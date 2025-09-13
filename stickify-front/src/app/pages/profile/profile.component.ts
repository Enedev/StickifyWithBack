// src/app/pages/profile/profile.component.ts
import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Song } from '../../shared/interfaces/song.interface';
import { BackendComment } from '../../shared/interfaces/backend-comment.interface';
import { MusicService } from '../../services/music.service';
import { Subscription, forkJoin } from 'rxjs';
import { Playlist } from '../../shared/interfaces/playlist.interface';
import { User } from '../../shared/interfaces/user.interface';
import { UserRating } from '../../shared/interfaces/user-rating.interface';
import { UserComment } from '../../shared/interfaces/user-comment.interface';
import Swal from 'sweetalert2';
import { PremiumPaymentComponent } from '../../shared/components/premium-payment/premium-payment.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { BackendSongRating } from '../../shared/interfaces/backend-song-rating.interface';
import { PlaylistApiService } from '../../services/playlist-api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, PremiumPaymentComponent, DatePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly musicService = inject(MusicService);
  private readonly playlistApiService = inject(PlaylistApiService);
  currentUser: User | null = null;
  savedPlaylists: Playlist[] = []; // This will directly receive the full Playlist objects
  userRatings: UserRating[] = [];
  userComments: UserComment[] = [];
  allSongs: Song[] = [];
  showPremiumModal: boolean = false;
  private readonly allUsersMap: Map<string, string> = new Map();
  followersCount: number = 0;
  followingCount: number = 0;
  latestFollowersNames: string[] = [];
  latestFollowingNames: string[] = [];

  private songsSubscription: Subscription | undefined;
  private usersSubscription: Subscription | undefined;

  constructor(private readonly http: HttpClient) { }

  ngOnInit(): void {
    this.loadUserData();
    this.loadAllUsersForMapping();

    if (this.currentUser) {
      this.songsSubscription = this.musicService.songs$.subscribe(songs => {
        this.allSongs = songs;
        this.loadAllProfileData();
      });
    } else {
      console.warn('No current user found on profile initialization. User might not be logged in.');
    }
  }

  ngOnDestroy(): void {
    this.songsSubscription?.unsubscribe();
    this.usersSubscription?.unsubscribe();
  }

  private loadUserData(): void {
    this.currentUser = this.authService.currentUser;
  }

  private loadAllUsersForMapping(): void {
    this.usersSubscription = this.authService.getAllOtherUsers('dummyId').subscribe({
      next: (users) => {
        if (this.currentUser) {
          this.allUsersMap.set(this.currentUser.email, this.currentUser.username);
        }
        users.forEach(user => {
          if (user.email && user.username) {
            this.allUsersMap.set(user.email, user.username);
          }
        });
        this.updateFollowData();
      },
      error: (err) => {
        console.error('Error loading all users for mapping:', err);
      }
    });
  }

  private loadAllProfileData(): void {
    if (!this.currentUser?.email) {
      console.error('Cannot load profile data: Current user email is missing.');
      return;
    }

    const userId = this.currentUser.email;
    const userName = this.currentUser.username;

    forkJoin({
      // MODIFIED: Directly fetch full Playlist objects from the backend's /user/:userId/full endpoint
      playlists: this.playlistApiService.getUserSavedPlaylists(userId),
      ratings: this.http.get<BackendSongRating[]>(`${environment.backendUrl}/ratings/user/${userName}`),
      comments: this.http.get<BackendComment[]>(`${environment.backendUrl}/comments/user/${userName}`)
    }).subscribe({
      next: ({ playlists, ratings, comments }) => {
        this.savedPlaylists = playlists; // Assign directly as backend returns full Playlist objects
        console.log('Fetched Saved Playlists:', this.savedPlaylists);

        this.userRatings = this.processFetchedRatings(ratings);
        console.log('Processed User Ratings:', this.userRatings);

        this.userComments = this.processFetchedComments(comments);
        console.log('Processed User Comments:', this.userComments);
      },
      error: (err) => {
        console.error('Error loading all profile data:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de Carga',
          text: 'No se pudieron cargar tus datos de perfil. Inténtalo de nuevo más tarde.',
          confirmButtonText: 'Entendido'
        });
      }
    });
  }

  private processFetchedRatings(ratings: BackendSongRating[]): UserRating[] {
    return ratings.map(rating => {
      const song = this.allSongs.find(s => s.trackId === rating.trackId);
      return {
        songName: song?.trackName || `Canción ID: ${rating.trackId}`,
        rating: rating.rating
      };
    });
  }

  private processFetchedComments(comments: BackendComment[]): UserComment[] {
    console.log('--- DEBUG: Incoming comments to processFetchedComments:', comments);
    return comments.map(comment => {
      const song = this.allSongs.find(s => s.trackId === Number(comment.trackId));
      return {
        songName: song?.trackName || `Canción ID: ${comment.trackId}`,
        text: comment.text,
        date: comment.date
      };
    });
  }

  getPlaylistCoverForProfile(playlist: Playlist): string {
    if (this.allSongs.length > 0 && playlist.trackIds && playlist.trackIds.length > 0) {
      const firstSong = this.allSongs.find(song => song.trackId === parseInt(playlist.trackIds[0], 10));
      if (firstSong?.artworkUrl100) {
        return firstSong.artworkUrl100;
      }
    }
    return '/assets/banner.jpg';
  }

  logout(): void {
    this.authService.logOut();
  }

  private updateFollowData(): void {
    this.currentUser = this.authService.currentUser;

    if (this.currentUser) {
      const followers = this.currentUser.followers || [];
      const following = this.currentUser.following || [];

      this.followersCount = followers.length;
      this.followingCount = following.length;

      this.latestFollowersNames = followers
        .slice(-3)
        .reverse()
        .map(email => this.getUsernameByEmail(email));

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
          next: (success) => {
            if (success) {
              this.currentUser!.premium = false;
               Swal.fire({
                title: "¡Suscripción cancelada!",
                text: "Tu suscripción Premium ha sido cancelada correctamente.",
                icon: "success",
                color: "#716add",
                backdrop: `rgba(0,0,123,0.4) left top no-repeat`
              });
            } else {
               Swal.fire({
                title: "Error",
                text: "No se pudo cancelar el estado Premium. Intenta de nuevo.",
                icon: "error",
                color: "#716add",
                backdrop: `rgba(0,0,123,0.4) left top no-repeat`
              });
            }
          },
          error: (err) => {
            console.error('Error canceling premium status:', err);
            Swal.fire({
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
        next:  (success) => {
          if (success) {
            this.currentUser!.premium = true;
             Swal.fire({
              title: "¡Premium activado!",
              text: "¡Ahora eres usuario Premium y tienes acceso a todas las funciones!",
              icon: "success",
              color: "#716add",
              backdrop: `rgba(0,0,123,0.4) left top no-repeat`
            });
          } else {
             Swal.fire({
              title: "Error",
              text: "Hubo un problema al activar tu suscripción Premium. Intenta de nuevo.",
              icon: "error",
              color: "#716add",
              backdrop: `rgba(0,0,123,0.4) left top no-repeat`
            });
          }
        },
        error: (err) => {
          console.error('Error activating premium status:', err);
           Swal.fire({
            title: "Error",
            text: "Hubo un problema al activar tu suscripción Premium. Por favor, inténtalo de nuevo.",
            icon: "error",
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
        }
      });
    } else {
       Swal.fire({
        title: "Pago cancelado",
        text: "Puedes intentar activar Premium en cualquier momento.",
        icon: "info",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });
    }
  }
}