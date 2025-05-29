import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common'; // Used for *ngFor, *ngIf
import { FormsModule } from '@angular/forms'; // Used for [(ngModel)]
import { AuthService } from '../../services/auth.service';
import { User } from '../../shared/interfaces/user.interface';
import { NavComponent } from '../../shared/components/nav/nav.component'; // Import NavComponent
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-follows',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, NgFor, NgIf], // List all necessary Angular modules and components
  templateUrl: './user-follows.component.html',
  styleUrls: ['./user-follows.component.css']
})
export class UserFollowsComponent implements OnInit {
  private authService = inject(AuthService);

  searchTerm: string = '';
  allUsers: User[] = []; // Stores all users (excluding the current user)
  filteredUsers: User[] = []; // Users displayed after search filter
  currentUser: User | null = null; // The currently logged-in user

  ngOnInit(): void {
    // Get the current user from AuthService on component initialization
    this.currentUser = this.authService.currentUser;
    if (this.currentUser) {
      // Load all other users (excluding the current one)
      this.allUsers = this.authService.getAllOtherUsers(this.currentUser.email);
      this.applyFilter(); // Apply initial filter (which means display all if search is empty)
    } else {
      console.warn('No user logged in. Cannot display follow page.');
      // Optionally, redirect to signin page if no user is logged in
      // this.router.navigate(['/signin']);
    }
  }

  /**
   * Filters the list of users based on the search term (username or email).
   */
  applyFilter(): void {
    const lowerCaseSearchTerm = this.searchTerm.toLowerCase().trim();
    if (lowerCaseSearchTerm === '') {
      this.filteredUsers = [...this.allUsers]; // If search is empty, show all other users
    } else {
      this.filteredUsers = this.allUsers.filter(user =>
        user.username.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.email.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
  }

  /**
   * Checks if the currently logged-in user is following the given user.
   * @param user The user object to check the follow status against.
   * @returns True if the current user is following the `user`, false otherwise.
   */
  isFollowing(user: User): boolean {
    // Check if currentUser exists and has a 'following' array that includes the target user's email
    return !!this.currentUser?.following?.includes(user.email);
  }

  /**
   * Toggles the follow status for a specific user.
   * @param userToToggle The user object whose follow status will be changed.
   */
  toggleFollow(userToToggle: User): void {
    if (!this.currentUser) {
      console.error('No user logged in. Cannot perform follow action.');
      return;
    }

    const currentlyFollowing = this.isFollowing(userToToggle);
    const targetUserEmail = userToToggle.email;

    // Call the AuthService to handle the follow/unfollow logic
    const success = this.authService.toggleFollow(targetUserEmail, !currentlyFollowing);

    if (success) {
      // Re-load current user and all users to ensure UI reflects the latest state
      // (This is important because `AuthService` mutates localStorage)
      this.currentUser = this.authService.currentUser; // Refresh currentUser from service
      if (this.currentUser) {
        // Re-fetch all users to get updated follower counts/lists for others
        this.allUsers = this.authService.getAllOtherUsers(this.currentUser.email);
        this.applyFilter(); // Re-apply filter to update the displayed list
      }
    } else {
      console.error('Failed to toggle follow status.');
      // You might want to show a SweetAlert error here
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar el estado de seguimiento. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'Entendido'
      });
    }
  }
}