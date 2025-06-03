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
import { UserSavedPlaylist } from '../../shared/interfaces/user-saved-playlist.interface'; // Keep this import for clarity, though its ID is not directly passed to saveUserPlaylist anymore
import { Subscription } from 'rxjs';

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
  isSavingPlaylist: boolean = false;

  userPlaylists: Playlist[] = []; // This will now represent playlists created by the user, and saved playlists for display
  autoPlaylists: Playlist[] = [];
  allSongs: Song[] = [];
  showModal = false;
  newPlaylistName = '';
  selectedSongs: Song[] = [];
  currentUser: User | null = null;

  private savedPlaylistIds: Set<string> = new Set(); // Stores IDs of playlists the user has saved
  private subscriptions: Subscription[] = [];

  ngOnInit() {
    this.currentUser = this.authService.currentUser;
    this.playlistService.getUserPlaylists();

    const songsSub = this.musicService.songs$.subscribe(songs => {
      this.allSongs = songs;
      this.playlistService.updateAutoPlaylists(songs);
      this.saveAutoPlaylistsToSupabaseInitially();
    });

    const userPlaylistsSub = this.playlistService.userPlaylists$.subscribe(playlists => {
      this.userPlaylists = playlists.filter(p => p.createdBy !== 'automatic' && p.createdBy !== null);
    });

    const autoPlaylistsSub = this.playlistService.autoPlaylists$.subscribe(playlists => {
      this.autoPlaylists = playlists;
    });

    this.subscriptions.push(songsSub, userPlaylistsSub, autoPlaylistsSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  get userPlaylistsFilteredForDisplay(): Playlist[] {
    return this.userPlaylists;
  }

  saveAutoPlaylistsToSupabaseInitially(): Promise<any> { // Return type can be more specific, like Promise<Array<Playlist | null>>
    const saveRequests = this.autoPlaylists.map(autoPlaylist => {
      const isAlreadyCreated = this.userPlaylists.some(p =>
        p.name === autoPlaylist.name && p.createdBy === 'automatic'
      );

      if (!isAlreadyCreated) {
        const playlistToSave: Playlist = {
          ...autoPlaylist,
          createdBy: 'automatic',
          type: 'auto',
          createdAt: autoPlaylist.createdAt || new Date().toISOString()
        };

        return this.playlistApiService.createPlaylist(playlistToSave).toPromise()
          .then(savedPlaylist => {
            // **Here's the crucial part: check if savedPlaylist is not null/undefined**
            if (savedPlaylist) { // Type guard: ensures savedPlaylist is of type Playlist here
              console.log(`Auto-playlist "${savedPlaylist.name}" guardada en Supabase.`);
              const index = this.autoPlaylists.findIndex(p => p.name === autoPlaylist.name);
              if (index !== -1) {
                this.autoPlaylists[index] = savedPlaylist;
              }
              return savedPlaylist;
            } else {
              console.warn(`createPlaylist for "${autoPlaylist.name}" returned null or undefined.`);
              return null; // Ensure consistency in return type for this branch
            }
          })
          .catch(err => {
            console.error(`Error saving auto-playlist "${autoPlaylist.name}":`, err);
            return null; // Return null on error as you were doing
          });
      }
      return Promise.resolve(null); // Consistent return type for already created playlists
    });

    // If you intend to wait for all these saves to complete, you'd use Promise.all
    return Promise.all(saveRequests);
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

  async createPlaylistAndSaveToSupabase() {
    if (this.isSavingPlaylist) {
        return;
    }
    
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

    const newPlaylistBase = this.playlistService.createUserPlaylist(this.newPlaylistName, this.selectedSongs);
    const currentUserIdentifier = this.currentUser?.email || this.currentUser?.username;

    if (!currentUserIdentifier) {
      Swal.fire({
        icon: 'error',
        title: 'Error de Usuario',
        text: 'No se pudo identificar al usuario para crear la playlist.',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    const playlistToCreate: Playlist = {
      ...newPlaylistBase,
      id: uuidv4(),
      createdBy: currentUserIdentifier,
      type: 'user',
      createdAt: newPlaylistBase.createdAt || new Date().toISOString()
    };

    this.isSavingPlaylist = true;

    try {
        const savedPlaylist = await this.playlistApiService.createPlaylist(playlistToCreate).toPromise();
        
        if (!savedPlaylist) {
          throw new Error('No se recibió respuesta al crear la playlist');
        }
        // Actualizamos las playlists del usuario desde el backend
        await this.playlistService.getUserPlaylists();
        await this.savePlaylistToProfile(savedPlaylist, true);
        
        this.closeModal();
        Swal.fire({
            icon: 'success',
            title: 'Playlist creada',
            text: `La playlist "${this.newPlaylistName}" ha sido creada exitosamente.`,
            confirmButtonText: 'Entendido'
        });
    } catch (err) {
        console.error('Error al guardar la playlist en el backend:', err);
        Swal.fire({
            icon: 'error',
            title: 'Error al Guardar',
            text: `No se pudo guardar la playlist "${this.newPlaylistName}". Inténtalo de nuevo.`,
            confirmButtonText: 'Entendido'
        });
    } finally {
        this.isSavingPlaylist = false; // Desbloqueamos el botón
    }
  }

  // MODIFIED: This function now uses the correct parameters for the backend's savePlaylist endpoint.
  async savePlaylistToProfile(playlistToSave: Playlist, isNewlyCreated: boolean = false) {
    try {
      // Validaciones básicas
      if (!this.currentUser?.premium) {
        Swal.fire('Acceso Restringido', 'Necesitas ser Premium para guardar playlists', 'info');
        return;
      }

      const userId = this.currentUser.email || this.currentUser.username;
      if (!userId) {
        Swal.fire('Error', 'No se pudo identificar al usuario', 'error');
        return;
      }

      // Verificar si ya está guardada
      if (!isNewlyCreated && this.savedPlaylistIds.has(playlistToSave.id)) {
        Swal.fire('Info', 'Ya tienes esta playlist guardada', 'info');
        return;
      }

      // Enviar al backend (el identificador será el ID o el nombre según el tipo)
      const identifier = playlistToSave.type === 'auto' ? playlistToSave.name : playlistToSave.id;
      await this.playlistApiService.saveUserPlaylist(userId, identifier).toPromise();

      // Actualizar estado local
      this.savedPlaylistIds.add(playlistToSave.id);
      
      // Si es nueva playlist creada, cerrar modal
      if (isNewlyCreated) {
        this.closeModal();
      }

      Swal.fire('Éxito', 'Playlist guardada correctamente', 'success');
      
      } catch  (err) {
        console.error('Error al verificar/crear playlist automática:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo preparar la playlist automática para guardar.',
          confirmButtonText: 'Entendido'
        });
        return;
      }
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
      return '/assets/banner.jpg';
    }

    if (firstSong.artworkUrl100) {
      return firstSong.artworkUrl100;
    }

    return '/assets/banner.jpg';
  }
}