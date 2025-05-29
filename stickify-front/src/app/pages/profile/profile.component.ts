import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule, DatePipe  } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Song } from '../../shared/interfaces/song.interface';
import { SongRatings } from '../../shared/interfaces/song-ratings.interface';
import { Comment } from '../../shared/interfaces/comment.interface';
import { MusicService } from '../../services/music.service';
import { Subscription } from 'rxjs';
import { Playlist } from '../../shared/interfaces/playlist.interface';
import { UserProfile } from '../../shared/interfaces/user-profile.interface';
import { UserRating } from '../../shared/interfaces/user-rating.interface';
import { UserComment } from '../../shared/interfaces/user-comment.interface';
import Swal from 'sweetalert2'; 
import { PremiumPaymentComponent } from '../../shared/components/premium-payment/premium-payment.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, PremiumPaymentComponent, DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private musicService = inject(MusicService);
  currentUser: UserProfile = {};
  savedPlaylists: Playlist[] = [];
  userRatings: UserRating[] = [];
  userComments: UserComment[] = [];
  allSongs: Song[] = [];
  showPremiumModal: boolean = false; // New property to control modal visibility
  private allUsersMap: Map<string, string> = new Map(); // Maps email (ID) to username
  followersCount: number = 0;
  followingCount: number = 0;
  latestFollowersNames: string[] = [];
  latestFollowingNames: string[] = []

  // Local storage data cache
  private storedUserRatings: { [trackId: number]: SongRatings } = {};
  private storedSongComments: { [trackId: number]: Comment[] } = {};
  private songsSubscription: Subscription | undefined;

  constructor() { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSavedPlaylists();
    this.loadRatingsAndComments();
    this.subscribeToSongs();
    this.updateFollowData(); // Call this to populate counts and latest lists
  }

  ngOnDestroy(): void {
    this.songsSubscription?.unsubscribe();
  }

  private subscribeToSongs(): void {
    this.songsSubscription = this.musicService.songs$.subscribe(songs => {
      this.allSongs = songs;
    });
  }

  private loadUserData(): void {
    const storedUser = localStorage.getItem('currentUser');
    this.currentUser = storedUser ? JSON.parse(storedUser) : {};
  }

  private loadAllUsersForMapping(): void {
    const allRegisteredUsers = this.authService.users; // Get all users including the current one
    allRegisteredUsers.forEach(user => {
      if (user.email && user.username) {
        this.allUsersMap.set(user.email, user.username);
      }
    });
  }

  private loadSavedPlaylists(): void {
    const userId = this.currentUser.email || this.currentUser.username;
    if (userId) {
      const savedPlaylistsKey = `savedPlaylists_${userId}`;
      const storedPlaylistsString = localStorage.getItem(savedPlaylistsKey);
      this.savedPlaylists = storedPlaylistsString ? JSON.parse(storedPlaylistsString) : [];
    } else {
      this.savedPlaylists = [];
    }
  }

  private loadRatingsAndComments(): void {
    const storedRatings = localStorage.getItem('songRatings');
    if (storedRatings) {
      this.storedUserRatings = JSON.parse(storedRatings);
      this.populateUserRatings();
    }

    const storedComments = localStorage.getItem('songComments');
    if (storedComments) {
      this.storedSongComments = JSON.parse(storedComments);
      this.populateUserComments();
    }

    const storedAllSongs = localStorage.getItem('allSongs');
    if (storedAllSongs) {
      this.allSongs = JSON.parse(storedAllSongs);
    }
  }

  private populateUserRatings(): void {
    if (this.currentUser.email || this.currentUser.username) {
      const userId = this.currentUser.email || this.currentUser.username;
      for (const trackIdStr in this.storedUserRatings) {
        if (this.storedUserRatings.hasOwnProperty(trackIdStr)) {
          const trackId = parseInt(trackIdStr, 10);
          const ratingsForTrack = this.storedUserRatings[trackId];
          if (ratingsForTrack && (ratingsForTrack[this.currentUser.email!] || ratingsForTrack[this.currentUser.username!])) {
            const rating = ratingsForTrack[this.currentUser.email!] || ratingsForTrack[this.currentUser.username!];
            let songName: string | undefined;
            const song = this.allSongs.find(s => s.trackId === trackId);
            if (song) {
              songName = song.trackName;
            }
            this.userRatings.push({ songName: songName || trackId.toString(), rating });
          }
        }
      }
    }
  }

  private populateUserComments(): void {
    if (this.currentUser.email || this.currentUser.username) {
      for (const trackId in this.storedSongComments) {
        if (this.storedSongComments.hasOwnProperty(trackId)) {
          const commentsForTrack = this.storedSongComments[parseInt(trackId, 10)];
          if (commentsForTrack) {
            commentsForTrack.forEach(comment => {
              if (comment.user === this.currentUser.email || comment.user === this.currentUser.username) {
                let songName: string | undefined;
                const song = this.allSongs.find(s => s.trackId === parseInt(trackId, 10));
                if (song) {
                  songName = song.trackName;
                }
                this.userComments.push({ songName: songName || trackId, text: comment.text, date: comment.date });
              }
            });
          }
        }
      }
    }
  }
  // Get cover image for playlist (first song's artwork or default)
  getPlaylistCoverForProfile(playlist: Playlist): string {
    if (this.allSongs.length > 0 && playlist.trackIds.length > 0) {
      const firstSong = this.allSongs.find(song => String(song.trackId) === playlist.trackIds[0]);
      if (firstSong?.artworkUrl100) {
        return firstSong.artworkUrl100;
      }
    }
    return '/banner.jpg';
  }

  logout(): void {
    this.authService.logOut();
  }

  private updateFollowData(): void {
    // Get the *latest* current user data from AuthService
    this.loadUserData()

    if (this.currentUser) {
      const followers = this.currentUser.followers || [];
      const following = this.currentUser.following || [];

      this.followersCount = followers.length;
      this.followingCount = following.length;

      // Get latest 3 followers, mapped to usernames
      this.latestFollowersNames = followers
                               .slice(-3) // Take the last 3 (most recent)
                               .reverse() // Reverse to show most recent first
                               .map(email => this.getUsernameByEmail(email));

      // Get latest 3 following, mapped to usernames
      this.latestFollowingNames = following
                               .slice(-3) // Take the last 3 (most recent)
                               .reverse() // Reverse to show most recent first
                               .map(email => this.getUsernameByEmail(email));
    } else {
      // Clear data if no user is logged in
      this.followersCount = 0;
      this.followingCount = 0;
      this.latestFollowersNames = [];
      this.latestFollowingNames = [];
    }
  }

  // NEW: Helper to get username from email using the pre-built map
  private getUsernameByEmail(email: string): string {
    return this.allUsersMap.get(email) || email; // Return username if found, otherwise the email itself
  }

  async togglePremiumStatus(): Promise<void> {
    if (!this.currentUser || !this.currentUser.email) {
      return;
    }

    const currentPremiumStatus = this.currentUser.premium || false;

    if (currentPremiumStatus) {
      // User is premium, ask to cancel
      const result = await Swal.fire({
        title: '¿Cancelar Premium?',
        text: 'Al cancelar tu suscripción Premium, perderás el acceso a funciones exclusivas. ¿Estás seguro?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar Premium',
        cancelButtonText: 'No, mantener Premium',
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });

      if (result.isConfirmed) {
        // Proceed with cancellation
        const success = this.authService.updateUserPremiumStatus(this.currentUser.email, false);
        if (success) {
          this.currentUser.premium = false; // Update local state
          await Swal.fire({
            title: "¡Suscripción cancelada!",
            text: "Tu suscripción Premium ha sido cancelada correctamente.",
            icon: "success",
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
        } else {
          await Swal.fire({
            title: "Error",
            text: "No se pudo cancelar el estado Premium. Intenta de nuevo.",
            icon: "error",
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
        }
      }
    } else {
      // User is not premium, open the payment modal
      this.showPremiumModal = true;
    }
  }

  /**
   * Handles the output from the PremiumPaymentComponent modal.
   * @param isConfirmed True if payment was successful, false if cancelled.
   */
  async handlePremiumModalClose(isConfirmed: boolean): Promise<void> {
    this.showPremiumModal = false; // Close the modal regardless of outcome

    if (!this.currentUser || !this.currentUser.email) {
      console.error('No current user or user email found after modal closure.');
      return;
    }

    if (isConfirmed) {
      // Payment was successful, update user to premium
      const success = this.authService.updateUserPremiumStatus(this.currentUser.email, true);
      if (success) {
        this.currentUser.premium = true; // Update local state
        await Swal.fire({
          title: "¡Premium activado!",
          text: "¡Ahora eres usuario Premium y tienes acceso a todas las funciones!",
          icon: "success",
          color: "#716add",
          backdrop: `rgba(0,0,123,0.4) left top no-repeat`
        });
      } else {
        await Swal.fire({
          title: "Error",
          text: "Hubo un problema al activar tu suscripción Premium. Intenta de nuevo.",
          icon: "error",
          color: "#716add",
          backdrop: `rgba(0,0,123,0.4) left top no-repeat`
        });
      }
    } else {
      // Payment was cancelled or failed from the modal
      await Swal.fire({
        title: "Pago cancelado",
        text: "Puedes intentar activar Premium en cualquier momento.",
        icon: "info",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });
    }
  }
}