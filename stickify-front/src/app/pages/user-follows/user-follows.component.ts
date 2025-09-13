import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../shared/interfaces/user.interface';
import { NavComponent } from '../../shared/components/nav/nav.component';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs'; // Import Subscription

@Component({
  selector: 'app-user-follows',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, NgFor, NgIf],
  templateUrl: './user-follows.component.html',
  styleUrls: ['./user-follows.component.css']
})
export class UserFollowsComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);

  searchTerm: string = '';
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  currentUser: User | null = null;
  private usersSubscription: Subscription | undefined; // To manage getAllOtherUsers subscription
  private toggleFollowSubscription: Subscription | undefined; // To manage toggleFollow subscription

  ngOnInit(): void {
    // Get the current user from AuthService on component initialization
    this.currentUser = this.authService.currentUser;
    if (this.currentUser?.id) { // Use id for backend calls
      this.loadAllOtherUsers(); // Load all other users (excluding the current one)
    } else {
      console.warn('No user logged in or user ID is missing. Cannot display follow page.');
      // Optionally, redirect to signin page if no user is logged in
      // this.router.navigate(['/signin']);
    }
  }

  ngOnDestroy(): void {
    this.usersSubscription?.unsubscribe();
    this.toggleFollowSubscription?.unsubscribe();
  }

  private loadAllOtherUsers(): void {
    if (!this.currentUser?.id) {
      console.error('Cannot load other users: currentUser ID is missing.');
      return;
    }
    this.usersSubscription = this.authService.getAllOtherUsers(this.currentUser.id).subscribe({
      next: (users) => {
        this.allUsers = users;
        this.applyFilter(); // Apply initial filter (which means display all if search is empty)
      },
      error: (err) => {
        console.error('Error loading other users:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los usuarios. Por favor, inténtalo de nuevo.',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  applyFilter(): void {
    const lowerCaseSearchTerm = this.searchTerm.toLowerCase().trim();
    if (lowerCaseSearchTerm === '') {
      this.filteredUsers = [...this.allUsers];
    } else {
      this.filteredUsers = this.allUsers.filter(user =>
        user.username.toLowerCase().includes(lowerCaseSearchTerm) ||
        user.email.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }
  }

  isFollowing(user: User): boolean {
    // Check if currentUser exists and has a 'following' array that includes the target user's email
    return !!this.currentUser?.following?.includes(user.email);
  }

  toggleFollow(userToToggle: User): void {
    if (!this.currentUser || !this.currentUser.id) {
      console.error('No user logged in. Cannot perform follow action.');
      return;
    }

    const currentlyFollowing = this.isFollowing(userToToggle);
    const targetUserEmail = userToToggle.email;

    this.toggleFollowSubscription = this.authService.toggleFollow(targetUserEmail, !currentlyFollowing).subscribe({
      next: (success) => {
        if (success) {
          // Re-load current user and all users to ensure UI reflects the latest state
          this.currentUser = this.authService.currentUser; // Refresh currentUser from service
          if (this.currentUser?.id) {
            this.loadAllOtherUsers(); // Re-fetch all users to get updated follower counts/lists for others
            // applyFilter is called inside loadAllOtherUsers's next block
          }
          Swal.fire({
            icon: 'success',
            title: 'Éxito',
            text: currentlyFollowing ? 'Has dejado de seguir a ' + userToToggle.username : 'Ahora sigues a ' + userToToggle.username,
            timer: 1500, // Auto-close after 1.5 seconds
            showConfirmButton: false,
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al actualizar el estado de seguimiento. Por favor, inténtalo de nuevo.',
            confirmButtonText: 'Entendido',
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
        }
      },
      error: (err) => {
        console.error('Failed to toggle follow status:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al actualizar el estado de seguimiento. Por favor, inténtalo de nuevo.',
          confirmButtonText: 'Entendido',
          color: "#716add",
          backdrop: `rgba(0,0,123,0.4) left top no-repeat`
        });
      }
    });
  }
}