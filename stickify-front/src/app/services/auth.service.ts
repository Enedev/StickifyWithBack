import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { User } from '../shared/interfaces/user.interface';
import { HttpClient } from '@angular/common/http'; // Import HttpClient
import { environment } from '../../environments/environment'; // Import environment for backend URL
import { Observable, tap, catchError, of, map } from 'rxjs'; // Import RxJS operators

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly CURRENT_USER_KEY = 'currentUser';
  private readonly TOKEN_KEY = 'authToken';

  constructor(private readonly router: Router, private readonly http: HttpClient) {
    // Initialize currentUser from localStorage on service load
    this.currentUser = localStorage.getItem(this.CURRENT_USER_KEY)
      ? JSON.parse(localStorage.getItem(this.CURRENT_USER_KEY)!)
      : null;
  }

  get currentUser(): User | null {
    const currentUserString = localStorage.getItem(this.CURRENT_USER_KEY);
    return currentUserString ? JSON.parse(currentUserString) : null;
  }

  set currentUser(user: User | null) {
    if (user) {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.CURRENT_USER_KEY);
    }
  }

  get authToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  set authToken(token: string | null) {
    if (token) {
      localStorage.setItem(this.TOKEN_KEY, token);
    } else {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  signUp(userData: User): Observable<boolean> {
    const { username, email, password } = userData;
    if (!username || !email || !password) {
      console.warn('Validación fallida: Campos vacíos');
      return of(false);
    }

    // Pass all necessary fields to the backend for sign-up
    const signUpDto = {
      username: userData.username,
      email: userData.email,
      password: userData.password,
      premium: userData.premium || false // Ensure premium is always a boolean
    };

    return this.http.post<any>(`${environment.backendUrl}/auth/sign-up`, signUpDto).pipe(
      tap(response => {
        if (response.success && response.token) {
          this.authToken = response.token;
          // The backend's signUp (create) also returns a token.
          // You might need an additional call or modify backend to return user data here.
          // For now, let's assume we can set a basic currentUser if signUp returns success.
          // A better approach would be to receive the user object in the signUp response.
          // Given your backend's `create` method returns `{ success: true, token: this.getToken(userDB) }`,
          // it implicitly says the user is created and logged in.
          // To get the full user, we'll need to call a `getUserByEmail` or `getUserById` endpoint.
          // Let's call `findByEmail` to fetch the complete user object after successful signup.
          this.findByEmail(email).subscribe(user => {
            if (user) {
              this.currentUser = user; // Set the full user data
            }
          });
        }
      }),
      map(response => response.success), // Map response to boolean success
      catchError(error => {
        console.error('Error during sign-up:', error);
        // You can inspect error.status and error.error for specific backend messages
        throw error; // Re-throw to be handled by the component for Swal messages
      })
    );
  }

  logIn(credentials: Pick<User, 'email' | 'password'>): Observable<boolean> {
    const { email, password } = credentials;
    if (!email || !password) {
      console.warn('Validación fallida: Campos vacíos en login');
      return of(false);
    }

    return this.http.post<any>(`${environment.backendUrl}/auth/login`, credentials).pipe(
      tap(response => {
        // Backend's login method in auth.service.ts should return 'user' object now
        if (response.success && response.token && response.user) {
          this.authToken = response.token;
          this.currentUser = response.user; // Set currentUser directly from backend response
        }
      }),
      map(response => response.success), // Map response to boolean success
      catchError(error => {
        console.error('Error during login:', error);
        throw error; // Re-throw to be handled by the component for Swal messages
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.currentUser && !!this.authToken;
  }

  logOut(): void {
    const startTime = performance.now(); // Cuantitativa: inicio de medición

    localStorage.removeItem(this.CURRENT_USER_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser = null;
    console.log('[Cualitativa] Usuario y token eliminados del localStorage');

    this.router.navigate(['/log-in']);
    console.log('[Cualitativa] Redirección a /log-in ejecutada');

    Swal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      text: 'Has cerrado sesión correctamente.',
      confirmButtonText: 'Aceptar'
    });
    console.log('[Cualitativa] Alerta de cierre de sesión mostrada');

    const duration = performance.now() - startTime;
    console.log(`[Cuantitativa] Tiempo de ejecución de logOut(): ${duration.toFixed(2)} ms`);
  }

  // --- Methods to interact with backend for user data ---

  // Fetches a single user by their ID
  findOne(id: string): Observable<User | null> {
    return this.http.get<User>(`${environment.backendUrl}/users/${id}`).pipe(
      catchError(error => {
        console.error(`Error fetching user with ID ${id}:`, error);
        return of(null);
      })
    );
  }

  // Fetches a single user by their email (useful after signup if backend doesn't return full user)
  findByEmail(email: string): Observable<User | null> {
    // You need to add a findByEmail endpoint to your UsersController in NestJS
    // Example: @Get('by-email/:email') async findByEmail(@Param('email') email: string) { return this.usersService.findByEmail(email); }
    return this.http.get<User>(`${environment.backendUrl}/users/by-email/${email}`).pipe(
      catchError(error => {
        console.error(`Error fetching user with email ${email}:`, error);
        return of(null);
      })
    );
  }

  // Updates a user's data (e.g., premium status)
  updateUser(id: string, updateUserDto: Partial<User>): Observable<User | null> {
    return this.http.put<User>(`${environment.backendUrl}/users/${id}`, updateUserDto).pipe(
      tap(updatedUser => {
        // If the updated user is the current logged-in user, refresh currentUser
        if (this.currentUser && this.currentUser.id === updatedUser.id) {
          this.currentUser = updatedUser;
        }
      }),
      catchError(error => {
        console.error(`Error updating user with ID ${id}:`, error);
        return of(null);
      })
    );
  }

  // Helper for updating premium status, uses the general updateUser method
  updateUserPremiumStatus(email: string, isPremium: boolean): Observable<boolean> {
    const currentUser = this.currentUser;
    if (!currentUser || !currentUser.id) {
      console.error('No current user or user ID available to update premium status.');
      return of(false);
    }
    // Call the generic updateUser method
    return this.updateUser(currentUser.id, { premium: isPremium }).pipe(
      map(user => !!user), // Map to true if update was successful (user returned), false otherwise
      catchError(error => {
        console.error('Error updating premium status:', error);
        return of(false);
      })
    );
  }

  // Fetches all users *except* the current user
  getAllOtherUsers(currentUserId: string): Observable<User[]> {
    // Change '/user' to '/users'
    return this.http.get<User[]>(`${environment.backendUrl}/users`).pipe(
      map(users => users.filter(user => user.id !== currentUserId)),
      catchError(error => {
        console.error('Error fetching all other users:', error);
        return of([]);
      })
    );
  }

  // Toggles follow status via backend
  toggleFollow(targetUserEmail: string, shouldFollow: boolean): Observable<boolean> {
    if (!this.currentUser || !this.currentUser.id) {
      console.error('No user logged in or user ID to perform follow action.');
      return of(false);
    }

    return this.http.put<User>(`${environment.backendUrl}/users/${this.currentUser.id}/follow`, {
      targetEmail: targetUserEmail,
      follow: shouldFollow
    }).pipe(
      tap(updatedUser => {
        // Update the current user's following list in local storage
        this.currentUser = updatedUser;
      }),
      map(user => !!user), // Map to true if API call was successful
      catchError(error => {
        console.error('Error toggling follow status:', error);
        throw error; // Re-throw to be handled by components
      })
    );
  }
}