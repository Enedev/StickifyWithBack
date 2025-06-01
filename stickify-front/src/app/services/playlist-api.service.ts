import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Playlist } from '../shared/interfaces/playlist.interface';

@Injectable({
  providedIn: 'root'
})
export class PlaylistApiService {
  private http = inject(HttpClient);

  private baseUrl = 'http://localhost:3000/api/playlists'; 

  createPlaylist(playlist: Playlist): Observable<Playlist> {
    // Aquí el backend espera un DTO, asegúrate de que 'playlist' coincida con 'CreatePlaylistDto'
    return this.http.post<Playlist>(this.baseUrl, playlist);
  }

  getUserPlaylists(userId: string): Observable<Playlist[]> {
    return this.http.get<Playlist[]>(`${this.baseUrl}/user/${userId}`);
  }

}