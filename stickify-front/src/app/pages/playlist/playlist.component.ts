import { Component, OnInit, inject } from '@angular/core';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { MusicService } from '../../services/music.service';
import { PlaylistService } from '../../services/playlist.service';
import { Song } from '../../shared/interfaces/song.interface';
import { Playlist } from '../../shared/interfaces/playlist.interface';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { User } from '../../shared/interfaces/user.interface';

@Component({
  selector: 'app-playlist',
  standalone: true,
  imports: [NavComponent, NgFor, NgIf, FormsModule, CommonModule],
  templateUrl: './playlist.component.html',
  styleUrls: ['./playlist.component.css']
})
export class PlaylistComponent implements OnInit {
  private musicService = inject(MusicService);
  private playlistService = inject(PlaylistService);
  private authService = inject(AuthService);

  userPlaylists: Playlist[] = [];
  autoPlaylists: Playlist[] = [];
  allSongs: Song[] = [];
  showModal = false;
  newPlaylistName = '';
  selectedSongs: Song[] = [];
  currentUser: User | null = null; 

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.loadPlaylists();
    this.musicService.songs$.subscribe(songs => {
      this.allSongs = songs;
      this.autoPlaylists = this.playlistService.generateAutoPlaylists(songs);
    });
  }

  loadPlaylists() {
    this.userPlaylists = this.playlistService.getUserPlaylists();
  }

  getPlaylistSongs(playlist: Playlist): Song[] {
    return this.playlistService.getPlaylistSongs(playlist, this.allSongs);
  }

  toggleSongSelection(song: Song) {
    if (!this.currentUser?.premium) {
      Swal.fire({
        icon: 'info',
        title: 'Acceso Restringido',
        text: 'Necesitas ser usuario Premium para seleccionar canciones para una playlist.',
        confirmButtonText: 'Entendido'
      });
      return;
    }
    const index = this.selectedSongs.findIndex(s => s.trackId === song.trackId);
    index > -1 ? this.selectedSongs.splice(index, 1) : this.selectedSongs.push(song);
  }

  createPlaylist() {
    if (!this.currentUser?.premium) {
      Swal.fire({
        icon: 'info',
        title: 'Acceso Restringido',
        text: 'Necesitas ser usuario Premium para crear playlists.',
        confirmButtonText: 'Entendido'
      });
      return; 
    }
    if (!this.newPlaylistName || this.newPlaylistName.trim() === '') {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre Requerido',
        text: 'Por favor, ingresa un nombre para la playlist.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (this.selectedSongs.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: '¡Selecciona Canciones!',
        text: 'Por favor, selecciona al menos una canción para la playlist.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const newPlaylist = this.playlistService.createUserPlaylist(this.newPlaylistName, this.selectedSongs);
    this.loadPlaylists();
    this.closeModal();

    this.savePlaylistToProfile(newPlaylist);

    Swal.fire({
      icon: 'success',
      title: '¡Playlist Creada y Guardada!',
      text: `La playlist "${this.newPlaylistName}" ha sido creada y guardada en tu perfil.`,
      confirmButtonText: '¡Genial!'
    });
  }


  openModal() {
    if (!this.currentUser?.premium) {
      Swal.fire({
        icon: 'info',
        title: 'Acceso Restringido',
        text: 'Necesitas ser usuario Premium para crear playlists.',
        confirmButtonText: 'Entendido'
      });
      return; // Prevent modal from opening
    }
    
    this.showModal = true;
    this.selectedSongs = [];
    this.newPlaylistName = '';
  }

  closeModal() {
    this.showModal = false;
  }

  getPlaylistCover(playlist: Playlist): string {
    const firstSong = this.getPlaylistSongs(playlist)[0];

    if (!firstSong) {
      return '/banner.jpg';
    }

    if (firstSong.artworkUrl100) {
      return firstSong.artworkUrl100;
    }

    return '/banner.jpg';
  }

  savePlaylistToProfile(playlist: Playlist) {
    const currentUserString = localStorage.getItem('currentUser');
    if (currentUserString) {
      const currentUser = JSON.parse(currentUserString);
      const userId = currentUser.email || currentUser.username;
      if (userId) {
        const playlistToSave = {
          id: playlist.id,
          name: playlist.name,
          trackIds: playlist.trackIds,
          type: playlist.type,
          createdAt: playlist.createdAt
        };

        const savedPlaylistsKey = `savedPlaylists_${userId}`;
        const storedPlaylistsString = localStorage.getItem(savedPlaylistsKey);
        const storedPlaylists = storedPlaylistsString ? JSON.parse(storedPlaylistsString) : [];

        const existingPlaylistIndex = storedPlaylists.findIndex(
          (saved: { id: string }) => saved.id === playlistToSave.id
        );

        if (existingPlaylistIndex === -1) {
          storedPlaylists.push(playlistToSave);
          localStorage.setItem(savedPlaylistsKey, JSON.stringify(storedPlaylists));
          Swal.fire({
            icon: 'success',
            title: '¡Playlist Guardada!',
            text: `La playlist "${playlist.name}" se ha guardado en tu perfil.`,
            confirmButtonText: '¡Entendido!'
          });
        } else {
          Swal.fire({
            icon: 'info',
            title: '¡Playlist Existente!',
            text: `La playlist "${playlist.name}" ya está guardada en tu perfil.`,
            confirmButtonText: 'Entendido'
          });
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error de Usuario',
          text: 'No se pudo identificar al usuario para guardar la playlist.',
          confirmButtonText: 'Entendido'
        });
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar la playlist. Usuario no encontrado.',
        confirmButtonText: 'Entendido'
      });
    }
  }
}