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

  createSong(songData: Song): Observable<Song> {
    return this.http.post<Song>(this.baseUrl, songData);
  }

}