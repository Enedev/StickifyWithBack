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
import { PlaylistApiService } from '../../services/playlist-api.service';
import { v4 as uuidv4 } from 'uuid';

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
  private playlistApiService = inject(PlaylistApiService);
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
    // Ahora, carga las playlists del usuario desde el backend al inicio
    this.loadUserPlaylistsFromBackend(); 
    this.musicService.songs$.subscribe(songs => {
      this.allSongs = songs;
      this.autoPlaylists = this.playlistService.generateAutoPlaylists(songs);
    });
  }

  // Nueva función para cargar playlists desde el backend
  loadUserPlaylistsFromBackend() {
    const userId = this.currentUser?.email || this.currentUser?.username;
    if (userId) {
      this.playlistApiService.getUserPlaylists(userId).subscribe({
        next: (playlists) => {
          this.userPlaylists = playlists;
          console.log('Playlists del usuario cargadas:', this.userPlaylists);
        },
        error: (err) => {
          console.error('Error al cargar las playlists del usuario:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error de Carga',
            text: 'No se pudieron cargar tus playlists. Inténtalo de nuevo más tarde.',
            confirmButtonText: 'Entendido'
          });
        }
      });
    }
  }

  /*
  loadPlaylists() {
    this.userPlaylists = this.playlistService.getUserPlaylists();
  }*/

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

    this.playlistApiService.createPlaylist(newPlaylist).subscribe({
      next: (savedPlaylist) => {
        Swal.fire({
          icon: 'success',
          title: '¡Playlist Creada y Guardada!',
          text: `La playlist "${savedPlaylist.name}" ha sido creada y guardada en tu perfil.`,
          confirmButtonText: '¡Genial!'
        });
        this.closeModal();
        this.loadUserPlaylistsFromBackend();
      },
      error: (err) => {
        console.error('Error al guardar la playlist en el backend:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          text: `No se pudo guardar la playlist "${this.newPlaylistName}". Inténtalo de nuevo.`,
          confirmButtonText: 'Entendido'
        });
      }
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
      return; 
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
    
  saveAutoPlaylistAsUserPlaylist(playlistToSave: Playlist) {
    if (!this.currentUser?.premium) {
      Swal.fire({
        icon: 'info',
        title: 'Acceso Restringido',
        text: 'Necesitas ser usuario Premium para guardar playlists en tu perfil.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const currentUser = this.authService.currentUser;
    const userId = currentUser?.email || currentUser?.username;

    if (!userId) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Usuario',
        text: 'No se pudo identificar al usuario para guardar la playlist.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const playlistToSaveInDb: Playlist = {
      ...playlistToSave, 
      id: playlistToSave.id || uuidv4(), 
      type: 'user', 
      createdBy: userId,
      createdAt: playlistToSave.createdAt || new Date().toISOString() 
    };

    this.playlistApiService.createPlaylist(playlistToSaveInDb).subscribe({
      next: (savedPlaylist) => {
        Swal.fire({
          icon: 'success',
          title: '¡Playlist Guardada!',
          text: `La playlist "${savedPlaylist.name}" se ha guardado en tu perfil.`,
          confirmButtonText: '¡Entendido!'
        });
        this.loadUserPlaylistsFromBackend(); 
      },
      error: (err) => {
        console.error('Error al guardar la playlist en el backend:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          text: `No se pudo guardar la playlist "${playlistToSave.name}". Inténtalo de nuevo.`,
          confirmButtonText: 'Entendido'
        });
      }
    });
  }
}
