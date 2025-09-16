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
  savedPlaylists: Playlist[] = [];
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

  constructor(private readonly http: HttpClient) {}

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
      playlists: this.playlistApiService.getUserSavedPlaylists(userId),
      ratings: this.http.get<BackendSongRating[]>(`${environment.backendUrl}/ratings/user/${userName}`),
      comments: this.http.get<BackendComment[]>(`${environment.backendUrl}/comments/user/${userName}`)
    }).subscribe({
      next: ({ playlists, ratings, comments }) => {
        this.savedPlaylists = playlists;
        this.userRatings = this.processFetchedRatings(ratings);
        this.userComments = this.processFetchedComments(comments);
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
    if (this.allSongs.length > 0 && playlist.trackIds?.length > 0) {
      const firstSong = this.allSongs.find(song => song.trackId === parseInt(playlist.trackIds[0], 10));
      return firstSong?.artworkUrl100 || '/assets/banner.jpg';
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

      this.latestFollowersNames = followers.slice(-3).reverse().map(email => this.getUsernameByEmail(email));
      this.latestFollowingNames = following.slice(-3).reverse().map(email => this.getUsernameByEmail(email));
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

  private updatePremiumStatus(email: string, enable: boolean, successMsg: string, errorMsg: string): void {
    this.authService.updateUserPremiumStatus(email, enable).subscribe({
      next: (success) => {
        if (success) {
          this.currentUser!.premium = enable;
          Swal.fire({
            title: successMsg,
            icon: "success",
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
        } else {
          Swal.fire({
            title: "Error",
            text: errorMsg,
            icon: "error",
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
        }
      },
      error: (err) => {
        console.error('Error updating premium status:', err);
        Swal.fire({
          title: "Error",
          text: errorMsg,
          icon: "error",
          color: "#716add",
          backdrop: `rgba(0,0,123,0.4) left top no-repeat`
        });
      }
    });
  }

  async togglePremiumStatus(): Promise<void> {
    if (!this.currentUser?.email || !this.currentUser?.id) return;

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
        this.updatePremiumStatus(
          this.currentUser.email,
          false,
          "¡Suscripción cancelada!",
          "No se pudo cancelar el estado Premium. Intenta de nuevo."
        );
      }
    } else {
      this.showPremiumModal = true;
    }
  }

  async handlePremiumModalClose(isConfirmed: boolean): Promise<void> {
    this.showPremiumModal = false;

    if (!this.currentUser?.email || !this.currentUser?.id) return;

    if (isConfirmed) {
      this.updatePremiumStatus(
        this.currentUser.email,
        true,
        "¡Premium activado!",
        "Hubo un problema al activar tu suscripción Premium. Intenta de nuevo."
      );
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
