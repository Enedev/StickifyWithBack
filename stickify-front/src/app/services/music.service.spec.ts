import { TestBed } from '@angular/core/testing';
import { MusicService } from './music.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Song } from '../shared/interfaces/song.interface';
import { RouterTestingModule } from '@angular/router/testing';

const mockSongs: Song[] = [
  {
    trackId: 1,
    artistName: 'Artista 1',
    trackName: 'Canción 1',
    primaryGenreName: 'Pop',
    collectionName: 'Álbum 1',
    artworkUrl100: '',
    releaseDate: '2023-01-01',
    isUserUpload: false,
    collectionId: 10,
    artistId: 100
  }
];

describe('MusicService', () => {
  let service: MusicService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [MusicService]
    });
    // Stub loadAllSongs on prototype to prevent automatic HTTP calls in constructor
    const originalLoadAllSongs = (MusicService.prototype as any).loadAllSongs;
    spyOn(MusicService.prototype as any, 'loadAllSongs').and.stub();

    service = TestBed.inject(MusicService);
    httpMock = TestBed.inject(HttpTestingController);

    // Attach original method for tests that need to call it explicitly
    (service as any).__originalLoadAllSongs = originalLoadAllSongs;

    // Consumir cualquier petición automática que haya quedado abierta
    const pendingBackend = httpMock.match(`${environment.backendUrl}/songs`);
    pendingBackend.forEach(req => req.flush([]));
    const pendingItunes = httpMock.match('https://itunes.apple.com/search?term=music&limit=100');
    pendingItunes.forEach(req => req.flush({ results: [] }));
    const pendingBatch = httpMock.match(`${environment.backendUrl}/songs/batch`);
    pendingBatch.forEach(req => req.flush({ success: true, data: [] }));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debería cargar todas las canciones del backend', (done) => {
    service['songsSubject'].next([]);
    service['allGenresSubject'].next([]);
    service['allArtistsSubject'].next([]);
    (service as any).__originalLoadAllSongs.call(service);
    
    // Primera petición al backend
    const req = httpMock.expectOne(`${environment.backendUrl}/songs`);
    expect(req.request.method).toBe('GET');
    req.flush(mockSongs);
    
    // Dar tiempo para que se procesen las respuestas
    setTimeout(() => {
      // Consumir la petición a iTunes
      const itunesReq = httpMock.expectOne('https://itunes.apple.com/search?term=music&limit=100');
      itunesReq.flush({ results: [] });
      
      // Y la petición batch
      const batchReq = httpMock.expectOne(`${environment.backendUrl}/songs/batch`);
      batchReq.flush({ success: true, data: [] });
      
      // Consumir cualquier petición adicional al backend
      const pendingBackend = httpMock.match(`${environment.backendUrl}/songs`);
      pendingBackend.forEach(req => req.flush([]));
      
      done();
    });
  });

  it('debería manejar error al cargar canciones del backend', (done) => {
    service['songsSubject'].next([]);
    service['allGenresSubject'].next([]);
    service['allArtistsSubject'].next([]);
    (service as any).__originalLoadAllSongs.call(service);
    
    // Primera petición al backend que fallará
    const req = httpMock.expectOne(`${environment.backendUrl}/songs`);
    req.error(new ErrorEvent('Error')); // Simula error
    
    // Dar tiempo para que se procesen los errores
    setTimeout(() => {
      // Aún necesitamos consumir la petición a iTunes
      const itunesReq = httpMock.expectOne('https://itunes.apple.com/search?term=music&limit=100');
      itunesReq.flush({ results: [] });
      
      // Y la petición batch
      const batchReq = httpMock.expectOne(`${environment.backendUrl}/songs/batch`);
      batchReq.flush({ success: true, data: [] });
      
      // Consumir cualquier petición adicional al backend
      const pendingBackend = httpMock.match(`${environment.backendUrl}/songs`);
      pendingBackend.forEach(req => req.flush([]));
      
      done();
    });
  });

  it('debería cargar canciones de iTunes', () => {
    service['loadItunesSongs']().subscribe(songs => {
      expect(Array.isArray(songs)).toBeTrue();
    });
    const req = httpMock.expectOne('https://itunes.apple.com/search?term=music&limit=100');
    expect(req.request.method).toBe('GET');
    req.flush({ results: [] });
    // Simula también la petición batch que ocurre después
    const batchReq = httpMock.expectOne(`${environment.backendUrl}/songs/batch`);
    expect(batchReq.request.method).toBe('POST');
    batchReq.flush({ success: true, data: [] });
  });
});
