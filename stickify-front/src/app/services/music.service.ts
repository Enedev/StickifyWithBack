import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { Song } from '../shared/interfaces/song.interface';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  // API
  private apiUrl = 'https://itunes.apple.com';
  private songsSubject = new BehaviorSubject<Song[]>([]);
  public songs$ = this.songsSubject.asObservable();

  // Genre and artist state
  private allGenresSubject = new BehaviorSubject<string[]>([]);
  public genres$ = this.allGenresSubject.asObservable();
  private allArtistsSubject = new BehaviorSubject<string[]>([]);
  public artists$ = this.allArtistsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialSongs();
    this.loadUploadedSongs();
  }
  // Load initial songs from iTunes API
  private loadInitialSongs(searchTerm: string = 'music', limit: number = 100): void {
    this.http.get<{ results: any[] }>(
      `${this.apiUrl}/search?term=${encodeURIComponent(searchTerm)}&limit=${limit}`
    ).pipe(
      map((data) => this.mapSongs(data.results, false)),
      shareReplay(1)
    ).subscribe(songs => {
      this.addSongsToCache(songs);
      this.updateGenresAndArtists(songs);
    });
  }
  // Load user-uploaded songs from localStorage
  private loadUploadedSongs(): void {
    const storedUploadedSongs = localStorage.getItem('uploadedSongs');
    if (storedUploadedSongs) {
      const uploadedSongs: Song[] = JSON.parse(storedUploadedSongs);
      this.addSongsToCache(uploadedSongs);
      this.updateGenresAndArtists(uploadedSongs);
    }
  }
  // Filter songs based on search term
  fetchSongs(searchTerm: string = ''): Observable<Song[]> {
    if (!searchTerm) {
      return this.songs$;
    }
    return this.songs$.pipe(
      map(songs =>
        songs.filter(song =>
          song.trackName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artistName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.primaryGenreName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }
  // Transform API response to Song objects
  private mapSongs(results: any[], isUserUpload: boolean): Song[] {
    return results.map((song: any) => ({
      trackId: song.trackId || Date.now() + Math.random(),
      artistName: song.artistName,
      trackName: song.trackName,
      primaryGenreName: song.primaryGenreName,
      collectionName: song.collectionName,
      artworkUrl100: song.artworkUrl100,
      releaseDate: song.releaseDate,
      isUserUpload: isUserUpload,
      collectionId: song.collectionId || Date.now() + Math.random(),
      artistId: song.artistId || Date.now() + Math.random(),
    } as Song));
  }
  // Update genre and artist lists with new songs
  private updateGenresAndArtists(newSongs: Song[]): void {
    const allGenres = [...new Set([...this.allGenresSubject.getValue(), ...newSongs.map(s => s.primaryGenreName)])].sort();
    this.allGenresSubject.next(allGenres);

    const allArtists = [...new Set([...this.allArtistsSubject.getValue(), ...newSongs.map(s => s.artistName)])].sort();
    this.allArtistsSubject.next(allArtists);
  }

  getGenres(): string[] {
    return this.allGenresSubject.getValue();
  }

  getArtists(): string[] {
    return this.allArtistsSubject.getValue();
  }
  // Add new song (user upload)
  addSong(newSong: Song): void {
    const currentSongs = this.songsSubject.getValue();
    const updatedSongs = [newSong, ...currentSongs];
    this.songsSubject.next(updatedSongs);
    this.updateGenresAndArtists([newSong]);

    const storedUploadedSongs = localStorage.getItem('uploadedSongs');
    const uploadedSongs: Song[] = storedUploadedSongs ? JSON.parse(storedUploadedSongs) : [];
    uploadedSongs.unshift(newSong);
    localStorage.setItem('uploadedSongs', JSON.stringify(uploadedSongs));
  }

  private addSongsToCache(songsToAdd: Song[]): void {
    const currentSongs = this.songsSubject.getValue();
    this.songsSubject.next([...currentSongs, ...songsToAdd]);
  }
}