import { inject, Injectable } from '@angular/core';
import { Song } from '../shared/interfaces/song.interface';
import { Playlist } from '../shared/interfaces/playlist.interface';
import { AuthService } from './auth.service';
import { PlaylistApiService } from './playlist-api.service';
import { v4 as uuidv4 } from 'uuid';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlaylistService {
  private authService = inject(AuthService);
  private playlistApiService = inject(PlaylistApiService);
  
  private userPlaylistsSubject = new BehaviorSubject<Playlist[]>([]);
  public userPlaylists$ = this.userPlaylistsSubject.asObservable();

  private autoPlaylistsSubject = new BehaviorSubject<Playlist[]>([]);
  public autoPlaylists$ = this.autoPlaylistsSubject.asObservable();

  getUserPlaylists(): void {
    const currentUser = this.authService.currentUser;
    const userId = currentUser?.email || currentUser?.username;

    if (userId) {
      this.playlistApiService.getUserPlaylists(userId).subscribe({
        next: (playlists) => {
          this.userPlaylistsSubject.next(playlists);
        },
        error: (err) => {
          console.error('Error al cargar las playlists del usuario desde el backend:', err);
        }
      });
    } else {
      console.warn('No hay usuario logueado para cargar playlists.');
    }
  }
  
  createUserPlaylist(name: string, songs: Song[]): Playlist {
    const currentUser = this.authService.currentUser;
    const userId = currentUser?.email || currentUser?.username;

    if (!userId) {
      console.error('No se pudo obtener el ID del usuario actual.');
      throw new Error('Usuario no identificado.');
    }

    const newPlaylist: Playlist = {
      id: uuidv4(),
      name: name,
      trackIds: songs.map(song => song.trackId.toString()),
      type: 'user',
      createdAt: new Date(),
      createdBy: userId, 
    };
    return newPlaylist;
  }

  // Generate automatic playlists by genre
  generateAutoPlaylists(songs: Song[]): Playlist[] {
    const genres = [...new Set(songs.map(s => s.primaryGenreName))];

    return genres.map(genre => ({
      id: `auto-${genre.toLowerCase()}`,
      name: `${genre} Hits`,
      trackIds: songs
        .filter(s => s.primaryGenreName === genre)
        .slice(0, 20)
        .map(s => s.trackId.toString()),
      type: 'auto',
      createdAt: new Date()
    }));
  }

  updateAutoPlaylists(songs: Song[]): void {
    const autoPlaylists = this.generateAutoPlaylists(songs);
    this.autoPlaylistsSubject.next(autoPlaylists);
  }

  // Get full song objects for a playlist
  getPlaylistSongs(playlist: Playlist, allSongs: Song[]): Song[] {
    return playlist.trackIds
      .map(id => allSongs.find(s => s.trackId.toString() === id))
      .filter(s => s) as Song[];
  }

  addUserPlaylist(playlist: Playlist): void {
    const currentPlaylists = this.userPlaylistsSubject.value;
    this.userPlaylistsSubject.next([...currentPlaylists, playlist]);
  }

  updateAllUserPlaylists(playlists: Playlist[]): void {
    this.userPlaylistsSubject.next(playlists);
  }
}