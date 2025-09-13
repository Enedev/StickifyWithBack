import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay, tap, catchError, switchMap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, forkJoin, throwError } from 'rxjs';
import { Song } from '../shared/interfaces/song.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  private readonly apiUrl = 'https://itunes.apple.com';
  private readonly songsSubject = new BehaviorSubject<Song[]>([]);
  public songs$ = this.songsSubject.asObservable();

  private readonly allGenresSubject = new BehaviorSubject<string[]>([]);
  public genres$ = this.allGenresSubject.asObservable();
  
  private readonly allArtistsSubject = new BehaviorSubject<string[]>([]);
  public artists$ = this.allArtistsSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    this.loadAllSongs();
  }

  private loadAllSongs(): void {
    console.log('Iniciando carga de todas las canciones...');
    // Paso 1: Cargar todas las canciones que ya están en el backend (Supabase)
    this._loadAllSongsFromBackend().pipe(
      tap(backendSongs => {
        console.log(`Canciones cargadas inicialmente desde el backend: ${backendSongs.length}`);
        // Actualizar el caché y los sujetos con las canciones existentes del backend
        this.addSongsToCache(backendSongs);
        this.updateGenresAndArtists(backendSongs);
      }),
      // Paso 2: Después de cargar las canciones del backend, proceder con las de iTunes
      switchMap(() => {
        console.log('Procediendo a cargar canciones de iTunes...');
        return this.loadItunesSongs().pipe(
          tap(itunesSongsProcessed => {
            console.log(`Canciones de iTunes procesadas y enviadas al backend: ${itunesSongsProcessed.length}`);
          }),
          // Paso 3: Después de que las canciones de iTunes se hayan procesado y guardado en el backend,
          // volver a cargar TODAS las canciones del backend para asegurar que la UI tenga los datos más recientes.
          switchMap(() => {
            console.log('Volviendo a cargar todas las canciones del backend para sincronización final...');
            return this._loadAllSongsFromBackend();
          }),
          tap(finalSongs => {
            console.log(`Carga final de canciones (backend + iTunes): ${finalSongs.length}`);
            // Actualizar el caché y los sujetos con la lista combinada final
            this.addSongsToCache(finalSongs);
            this.updateGenresAndArtists(finalSongs);
          })
        );
      }),
      catchError(err => {
        console.error('Error en la secuencia de carga de todas las canciones:', err);
        return of(null); // Retorna un observable de null para completar el stream con gracia.
      })
    ).subscribe();
  }

  // Nuevo método para cargar TODAS las canciones del backend
  private _loadAllSongsFromBackend(): Observable<Song[]> {
    console.log('Realizando petición GET a:', `${environment.backendUrl}/songs`);
    return this.http.get<Song[]>(`${environment.backendUrl}/songs`).pipe(
      catchError(err => {
        console.error('Error al cargar TODAS las canciones desde el backend:', err);
        return of([]); // Retorna un array vacío en caso de error
      })
    );
  }

  private loadItunesSongs(): Observable<Song[]> {
    console.log('Realizando petición GET a iTunes:', `${this.apiUrl}/search?term=music&limit=100`);
    return this.http.get<{ results: any[] }>(
      `${this.apiUrl}/search?term=music&limit=100`
    ).pipe(
      map((data) => {
        console.log(`iTunes API response: ${data.results.length} songs found.`);
        return this.mapSongs(data.results, false);
      }),
      switchMap(songs => {
        console.log(`Guardando ${songs.length} canciones de iTunes en el backend...`);
        return this.saveSongsToBackend(songs);
      }),
      catchError(err => {
        console.error('Error al cargar canciones de iTunes:', err);
        return of([]);
      })
    );
  }

  private saveSongsToBackend(songs: Song[]): Observable<Song[]> {
    console.log('Enviando canciones al backend para guardado por lotes...');
    return this.http.post<any>(`${environment.backendUrl}/songs/batch`, { songs }).pipe(
      map(response => {
        if (response.success) {
          console.log('Guardado por lotes exitoso:', response.data.length, 'canciones procesadas.');
          return response.data; // Asegúrate de que el backend devuelva las canciones guardadas
        } else {
          console.error('Error en la respuesta del guardado por lotes:', response.message);
          throw new Error(response.message);
        }
      }),
      catchError(err => {
        console.error('Error al guardar canciones en el backend:', err);
        // Si hay un error al guardar, aún así retornamos las canciones originales de iTunes
        // para que al menos se intenten mostrar si es un problema transitorio del backend.
        // Sin embargo, la lógica de re-fetch debería mitigar esto.
        return of(songs);
      })
    );
  }

  // Este método ya no es usado directamente en loadAllSongs, pero se mantiene si lo usas en otro lado.
  private loadUploadedSongs(): Observable<Song[]> {
    console.log('Cargando canciones subidas por el usuario...');
    return this.http.get<Song[]>(`${environment.backendUrl}/songs?isUserUpload=true`).pipe(
      catchError(err => {
        console.error('Error al cargar canciones subidas por el usuario:', err);
        return of([]);
      })
    );
  }

  private mapSongs(results: any[], isUserUpload: boolean): Song[] {
    return results.map((song: any) => ({
      trackId: song.trackId || this.generateUniqueId(),
      artistName: song.artistName,
      trackName: song.trackName,
      primaryGenreName: song.primaryGenreName,
      collectionName: song.collectionName,
      artworkUrl100: song.artworkUrl100,
      releaseDate: song.releaseDate,
      isUserUpload: isUserUpload,
      collectionId: song.collectionId || this.generateUniqueId(),
      artistId: song.artistId || this.generateUniqueId(),
    } as Song));
  }

  generateUniqueId(): number {
    return Date.now() + Math.floor(Math.random() * 1000000);
  }

  private updateGenresAndArtists(newSongs: Song[]): void {
    const allGenres = [...new Set([
      ...this.allGenresSubject.getValue(), 
      ...newSongs.map(s => s.primaryGenreName)
    ])].sort();
    
    const allArtists = [...new Set([
      ...this.allArtistsSubject.getValue(), 
      ...newSongs.map(s => s.artistName)
    ])].sort();
    
    this.allGenresSubject.next(allGenres);
    this.allArtistsSubject.next(allArtists);
  }

  addSong(newSong: Song): Observable<Song> {
    const songToAdd = {...newSong, isUserUpload: true};
    console.log('Añadiendo nueva canción al backend:', songToAdd);
    return this.http.post<Song>(`${environment.backendUrl}/songs`, songToAdd).pipe(
      tap(createdSong => {
        console.log('Canción añadida con éxito en el backend:', createdSong);
        const currentSongs = this.songsSubject.getValue();
        const updatedSongs = [createdSong, ...currentSongs];
        this.songsSubject.next(updatedSongs);
        this.updateGenresAndArtists([createdSong]);
      }),
      catchError(err => {
        console.error('Error al añadir canción:', err);
        return throwError(() => new Error('Failed to add song'));
      })
    );
  }

  fetchSongs(searchTerm: string = ''): Observable<Song[]> {
    return this.songs$.pipe(
      map(songs => {
        if (!searchTerm) return songs;
        
        const lowerTerm = searchTerm.toLowerCase();
        return songs.filter(song => 
          song.trackName.toLowerCase().includes(lowerTerm) ||
          song.artistName.toLowerCase().includes(lowerTerm) ||
          song.primaryGenreName.toLowerCase().includes(lowerTerm)
        );
      })
    );
  }

  private addSongsToCache(songsToAdd: Song[]): void {
    const currentSongs = this.songsSubject.getValue();
    const uniqueSongs = this.mergeSongsWithoutDuplicates(currentSongs, songsToAdd);
    this.songsSubject.next(uniqueSongs);
    console.log(`Canciones en caché después de la actualización: ${uniqueSongs.length}`);
  }

  private mergeSongsWithoutDuplicates(existing: Song[], newSongs: Song[]): Song[] {
    const existingIds = new Set(existing.map(s => s.trackId));
    const filteredNew = newSongs.filter(song => !existingIds.has(song.trackId));
    return [...filteredNew, ...existing];
  }

  getGenres(): string[] {
    return this.allGenresSubject.getValue();
  }

  getArtists(): string[] {
    return this.allArtistsSubject.getValue();
  }
}
