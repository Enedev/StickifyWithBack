import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Playlist } from '../shared/interfaces/playlist.interface';
import { UserSavedPlaylist } from '../shared/interfaces/user-saved-playlist.interface'; // Import the new interface

@Injectable({
  providedIn: 'root'
})
export class PlaylistApiService {
  private readonly http = inject(HttpClient);

  private readonly baseUrl = 'http://localhost:3000/api/playlists';
  private readonly userSavedPlaylistsUrl = 'http://localhost:3000/api/user-saved-playlists';

  createPlaylist(playlist: Playlist): Observable<Playlist> {
    return this.http.post<Playlist>(this.baseUrl, playlist);
  }

  getAllPlaylists(): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(this.baseUrl);
  }

  // MODIFIED: 'userSavedPlaylist' should now match what the backend 'savePlaylist' expects
  // Your backend POST endpoint expects { userId: string; playlistId: string }
  saveUserPlaylist(userId: string, playlistId: string): Observable<UserSavedPlaylist> {
    return this.http.post<UserSavedPlaylist>(this.userSavedPlaylistsUrl, { userId, playlistId });
  }

  // MODIFIED: This method now uses the new backend endpoint /user/:userId/full
  getUserSavedPlaylists(userId: string): Observable<Playlist[]> { // Changed return type to Playlist[] as backend returns full Playlist objects
    return this.http.get<Playlist[]>(`${this.userSavedPlaylistsUrl}/user/${userId}/full`);
  }

  getPlaylistByName(name: string): Observable<Playlist | null> {
    return this.http.get<Playlist | null>(`${this.baseUrl}/by-name/${encodeURIComponent(name)}`);
  }

  // This method remains for its original purpose (playlists explicitly created by a user, if needed)
  getUserPlaylists(userId: string): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.baseUrl}/user/${userId}`);
  }

  getAllUsersPlaylists(userId: string): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.baseUrl}/user`);
  }
}