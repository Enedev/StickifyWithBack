import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Song } from '../../shared/interfaces/song.interface';
import { SongRatings } from '../../shared/interfaces/song-ratings.interface';
import { Comment } from '../../shared/interfaces/comment.interface';
import { MusicService } from '../../services/music.service';
import { Subscription } from 'rxjs';
import { Playlist } from '../../shared/interfaces/playlist.interface';
// import { UserProfile } from '../../shared/interfaces/user-profile.interface'; // Remove this if it's just an alias for User
import { User } from '../../shared/interfaces/user.interface'; // Use the User interface directly
import { UserRating } from '../../shared/interfaces/user-rating.interface';
import { UserComment } from '../../shared/interfaces/user-comment.interface';
import Swal from 'sweetalert2';
import { PremiumPaymentComponent } from '../../shared/components/premium-payment/premium-payment.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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
  currentUser: User | null = null; // Use User interface and allow null
  savedPlaylists: Playlist[] = [];
  userRatings: UserRating[] = [];
  userComments: UserComment[] = [];
  allSongs: Song[] = [];
  showPremiumModal: boolean = false;
  private allUsersMap: Map<string, string> = new Map();
  followersCount: number = 0;
  followingCount: number = 0;
  latestFollowersNames: string[] = [];
  latestFollowingNames: string[] = []

  private storedUserRatings: { [trackId: number]: SongRatings } = {};
  private storedSongComments: { [trackId: number]: Comment[] } = {};
  private songsSubscription: Subscription | undefined;
  private usersSubscription: Subscription | undefined; // New subscription for users data

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadUserData(); // This will load currentUser from localStorage (updated by authService)
    this.loadAllUsersForMapping(); // Load all users from backend to build the map
    this.loadSavedPlaylists();
    this.loadRatingsAndComments();
    this.subscribeToSongs();
    this.updateFollowData(); // This will use the currentUser loaded in loadUserData
  }

  ngOnDestroy(): void {
    this.songsSubscription?.unsubscribe();
    this.usersSubscription?.unsubscribe(); // Unsubscribe from users observable
  }

  private subscribeToSongs(): void {
    this.songsSubscription = this.musicService.songs$.subscribe(songs => {
      this.allSongs = songs;
    });
  }

  private loadUserData(): void {
    // currentUser is now managed by AuthService. We just read it from the service.
    this.currentUser = this.authService.currentUser;
  }

  private loadAllUsersForMapping(): void {
    // Fetch all users from the backend to build the map
    this.usersSubscription = this.authService.getAllOtherUsers('dummyId').subscribe({ // 'dummyId' as it's filtered on frontend
      next: (users) => {
        // Include current user in the map if they exist
        if (this.currentUser) {
            this.allUsersMap.set(this.currentUser.email, this.currentUser.username);
        }
        users.forEach(user => {
          if (user.email && user.username) {
            this.allUsersMap.set(user.email, user.username);
          }
        });
        // After loading users, update follow data as it depends on this map
        this.updateFollowData();
      },
      error: (err) => {
        console.error('Error loading all users for mapping:', err);
      }
    });
  }

  private loadSavedPlaylists(): void {
    const userId = this.currentUser?.id; // Use currentUser.id from backend
    if (userId) {
      const savedPlaylistsKey = `savedPlaylists_${userId}`;
      const storedPlaylistsString = localStorage.getItem(savedPlaylistsKey);
      this.savedPlaylists = storedPlaylistsString ? JSON.parse(storedPlaylistsString) : [];
    } else {
      this.savedPlaylists = [];
    }
  }

  private loadRatingsAndComments(): void {
    this.loadUserRatingsFromBackend();

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

  private loadUserRatingsFromBackend(): void {
    if (!this.currentUser?.email) return;

    this.http.get<any[]>(`${environment.backendUrl}/ratings`).subscribe({
      next: (ratings) => {
        // Filtrar solo las calificaciones del usuario actual
        const userRatings = ratings.filter(rating => rating.userId === this.currentUser?.email);
        this.processUserRatings(userRatings);
      },
      error: (err) => {
        console.error('Error loading ratings from backend:', err);
        // Puedes mostrar un mensaje al usuario si lo deseas
      }
    });
  }

  private processUserRatings(ratings: any[]): void {
    this.userRatings = []; // Limpiar array existente

    ratings.forEach(rating => {
      const song = this.allSongs.find(s => s.trackId === rating.trackId);
      this.userRatings.push({
        songName: song?.trackName || `Canción ID: ${rating.trackId}`,
        rating: rating.rating
      });
    });
  }

  private populateUserRatings(): void {
    if (this.currentUser?.email) { // Use optional chaining for currentUser
      const userId = this.currentUser.email; // Still using email for existing local storage logic
      for (const trackIdStr in this.storedUserRatings) {
        if (this.storedUserRatings.hasOwnProperty(trackIdStr)) {
          const trackId = parseInt(trackIdStr, 10);
          const ratingsForTrack = this.storedUserRatings[trackId];
          if (ratingsForTrack && (ratingsForTrack[this.currentUser.email])) { // Check against current user's email
            const rating = ratingsForTrack[this.currentUser.email];
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
    if (this.currentUser?.email) { // Use optional chaining for currentUser
      for (const trackId in this.storedSongComments) {
        if (this.storedSongComments.hasOwnProperty(trackId)) {
          const commentsForTrack = this.storedSongComments[parseInt(trackId, 10)];
          if (commentsForTrack) {
            commentsForTrack.forEach(comment => {
              if (comment.user === this.currentUser!.email) { // Use non-null assertion as we checked above
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

  getPlaylistCoverForProfile(playlist: Playlist): string {
    if (this.allSongs.length > 0 && playlist.trackIds.length > 0) {
      const firstSong = this.allSongs.find(song => String(song.trackId) === playlist.trackIds[0]);
      if (firstSong?.artworkUrl100) {
        return firstSong.artworkUrl100;
      }
    }
    return '/assets/banner.jpg'; // Corrected path to assets folder
  }

  logout(): void {
    this.authService.logOut();
  }

  private updateFollowData(): void {
    // Get the *latest* current user data from AuthService
    this.currentUser = this.authService.currentUser; // Ensure currentUser is fresh

    if (this.currentUser) {
      const followers = this.currentUser.followers || [];
      const following = this.currentUser.following || [];

      this.followersCount = followers.length;
      this.followingCount = following.length;

      // Get latest 3 followers, mapped to usernames
      this.latestFollowersNames = followers
        .slice(-3)
        .reverse()
        .map(email => this.getUsernameByEmail(email));

      // Get latest 3 following, mapped to usernames
      this.latestFollowingNames = following
        .slice(-3)
        .reverse()
        .map(email => this.getUsernameByEmail(email));
    } else {
      this.followersCount = 0;
      this.followingCount = 0;
      this.latestFollowersNames = [];
      this.latestFollowingNames = [];
    }
  }

  private getUsernameByEmail(email: string): string {
    return this.allUsersMap.get(email) || email;
  }

  async togglePremiumStatus(): Promise<void> {
    if (!this.currentUser || !this.currentUser.email || !this.currentUser.id) {
      return;
    }

    const currentPremiumStatus = this.currentUser.premium || false;

    if (currentPremiumStatus) {
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
        this.authService.updateUserPremiumStatus(this.currentUser.email, false).subscribe({
          next: async (success) => {
            if (success) {
              this.currentUser!.premium = false; // Update local state
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
          },
          error: async (err) => {
            console.error('Error canceling premium status:', err);
            await Swal.fire({
              title: "Error",
              text: "Hubo un problema al cancelar el estado Premium. Por favor, inténtalo de nuevo.",
              icon: "error",
              color: "#716add",
              backdrop: `rgba(0,0,123,0.4) left top no-repeat`
            });
          }
        });
      }
    } else {
      this.showPremiumModal = true;
    }
  }

  async handlePremiumModalClose(isConfirmed: boolean): Promise<void> {
    this.showPremiumModal = false;

    if (!this.currentUser || !this.currentUser.email || !this.currentUser.id) {
      console.error('No current user or user email/id found after modal closure.');
      return;
    }

    if (isConfirmed) {
      this.authService.updateUserPremiumStatus(this.currentUser.email, true).subscribe({
        next: async (success) => {
          if (success) {
            this.currentUser!.premium = true; // Update local state
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
        },
        error: async (err) => {
          console.error('Error activating premium status:', err);
          await Swal.fire({
            title: "Error",
            text: "Hubo un problema al activar tu suscripción Premium. Por favor, inténtalo de nuevo.",
            icon: "error",
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
        }
      });
    } else {
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