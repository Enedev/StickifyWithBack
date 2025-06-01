import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Song } from '../shared/interfaces/song.interface'; 

@Injectable({
  providedIn: 'root'
})
export class SongApiService {
  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/api/songs';

  constructor() { }

  /**
   * Envía una nueva canción al backend para ser guardada en la base de datos.
   * @param songData Los datos de la canción a guardar.
   * @returns Un Observable con la canción creada o un error.
   */
  createSong(songData: Song): Observable<Song> {
    return this.http.post<Song>(this.baseUrl, songData);
  }

}