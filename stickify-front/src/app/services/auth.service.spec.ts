import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { AuthService } from './auth.service';
import { User } from '../shared/interfaces/user.interface';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;
  let mockStorage: { [key: string]: string };

  const CURRENT_USER_KEY = 'currentUser';
  const TOKEN_KEY = 'authToken';

  const mockUser: User = {
    id: '1',
    username: 'testUser',
    email: 'test@example.com',
    password: 'password123',
    premium: false,
    following: ['user2@example.com']
  } as User;

  beforeEach(() => {
    // Mock del Router
    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    // Inicializar el storage mock
    mockStorage = {};
    
    // Mock del localStorage
    spyOn(localStorage, 'getItem').and.callFake(key => mockStorage[key]);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      mockStorage[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake(key => {
      delete mockStorage[key];
    });

    // Mock de Swal.fire
    spyOn(Swal, 'fire').and.callFake(() =>
      Promise.resolve({ isConfirmed: true } as SweetAlertResult)
    );

    // Mock de performance.now
    spyOn(performance, 'now').and.returnValues(100, 120);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    (localStorage.removeItem as jasmine.Spy).calls.reset();
    (localStorage.setItem as jasmine.Spy).calls.reset();
    (localStorage.getItem as jasmine.Spy).calls.reset();
    (router.navigate as jasmine.Spy).calls.reset();
    (Swal.fire as jasmine.Spy).calls.reset();
    (performance.now as jasmine.Spy).calls.reset();
    httpMock.verify();
  });

  describe('Authentication', () => {
    it('should handle successful signup', () => {
      const signUpResponse = {
        success: true,
        token: 'mock-token',
        user: mockUser
      };

      service.signUp(mockUser).subscribe(success => {
        expect(success).toBe(true);
        expect(service.authToken).toBe('mock-token');
      });

      const signUpReq = httpMock.expectOne(`${environment.backendUrl}/auth/sign-up`);
      expect(signUpReq.request.method).toBe('POST');
      signUpReq.flush(signUpResponse);

      const userReq = httpMock.expectOne(`${environment.backendUrl}/users/by-email/${mockUser.email}`);
      expect(userReq.request.method).toBe('GET');
      userReq.flush(mockUser);
    });

    it('should handle failed signup with empty fields', () => {
      const invalidUser = { ...mockUser, username: '', email: '', password: '' };
      
      service.signUp(invalidUser).subscribe(success => {
        expect(success).toBe(false);
      });
    });

    it('should handle successful login', () => {
      const loginResponse = {
        success: true,
        token: 'mock-token',
        user: mockUser
      };

      service.logIn({ 
        email: mockUser.email, 
        password: mockUser.password 
      }).subscribe(success => {
        expect(success).toBe(true);
        expect(service.authToken).toBe('mock-token');
        expect(service.currentUser).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(loginResponse);
    });

    it('should handle failed login with empty credentials', () => {
      service.logIn({ email: '', password: '' }).subscribe(success => {
        expect(success).toBe(false);
      });
    });

    it('should handle logOut', () => {
      mockStorage[CURRENT_USER_KEY] = JSON.stringify(mockUser);
      mockStorage[TOKEN_KEY] = 'mock-token';

      service.logOut();

      expect(service.currentUser).toBeNull();
      expect(Object.keys(mockStorage).length).toBe(0);
      expect(router.navigate).toHaveBeenCalledWith(['/log-in']);
      expect(Swal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'info',
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente.',
          confirmButtonText: 'Aceptar'
        })
      );
      expect(performance.now).toHaveBeenCalledTimes(2);
    });
  });

  describe('User Management', () => {
    it('should manage currentUser in localStorage', () => {
      service.currentUser = mockUser;
      expect(service.currentUser).toEqual(mockUser);
      expect(mockStorage[CURRENT_USER_KEY]).toBe(JSON.stringify(mockUser));

      service.currentUser = null;
      expect(service.currentUser).toBeNull();
      expect(mockStorage[CURRENT_USER_KEY]).toBeUndefined();
    });

    it('should check authentication status', () => {
      expect(service.isAuthenticated()).toBe(false);

      service.currentUser = mockUser;
      service.authToken = 'mock-token';

      expect(service.isAuthenticated()).toBe(true);
    });

    it('should find user by ID', () => {
      service.findOne(mockUser.id!).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/${mockUser.id}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error when finding user by ID', () => {
      service.findOne('invalid-id').subscribe(user => {
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/invalid-id`);
      req.error(new ErrorEvent('404 Not Found'));
    });

    it('should find user by email', () => {
      service.findByEmail(mockUser.email).subscribe(user => {
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/by-email/${mockUser.email}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error when finding user by email', () => {
      service.findByEmail('invalid@email.com').subscribe(user => {
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/by-email/invalid@email.com`);
      req.error(new ErrorEvent('404 Not Found'));
    });

    it('should update user', () => {
      const updateData = { premium: true };

      service.updateUser(mockUser.id!, updateData).subscribe(user => {
        expect(user).toBeTruthy();
        expect(user?.premium).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/${mockUser.id}`);
      expect(req.request.method).toBe('PUT');
      req.flush({ ...mockUser, ...updateData });
    });

    it('should update user premium status', () => {
      service.currentUser = mockUser;

      service.updateUserPremiumStatus(mockUser.email, true).subscribe(success => {
        expect(success).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/${mockUser.id}`);
      expect(req.request.method).toBe('PUT');
      req.flush({ ...mockUser, premium: true });
    });

    it('should not update premium status without current user', () => {
      service.currentUser = null;

      service.updateUserPremiumStatus(mockUser.email, true).subscribe(success => {
        expect(success).toBe(false);
      });
    });

    it('should get all other users except current user', () => {
      const otherUsers: User[] = [
        { ...mockUser, id: '2', username: 'user2' },
        { ...mockUser, id: '3', username: 'user3' }
      ];

      service.getAllOtherUsers('2').subscribe(users => {
        expect(users.length).toBe(1);
        expect(users[0].id).toBe('3');
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users`);
      expect(req.request.method).toBe('GET');
      req.flush(otherUsers);
    });

    it('should handle error when getting all users', () => {
      service.getAllOtherUsers('1').subscribe(users => {
        expect(users).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should toggle follow status', () => {
      service.currentUser = mockUser;
      const targetEmail = 'other@example.com';

      service.toggleFollow(targetEmail, true).subscribe(success => {
        expect(success).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/${mockUser.id}/follow`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({
        targetEmail,
        follow: true
      });
      req.flush({ ...mockUser, following: [...(mockUser.following || []), targetEmail] });
    });

    it('should not toggle follow without current user', () => {
      service.currentUser = null;

      service.toggleFollow('other@example.com', true).subscribe(success => {
        expect(success).toBe(false);
      });
    });
  });
});
