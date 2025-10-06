import { TestBed, fakeAsync, tick } from '@angular/core/testing';
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
    //Assert
    expect(service).toBeTruthy();
  });

  it('debería cargar todas las canciones del backend', (done) => {
    //Arrange
    service['songsSubject'].next([]);
    service['allGenresSubject'].next([]);
    service['allArtistsSubject'].next([]);
    (service as any).__originalLoadAllSongs.call(service);
    
    //Act
    // Primera petición al backend
    const req = httpMock.expectOne(`${environment.backendUrl}/songs`);
    //Assert
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
    //Arrange
    service['songsSubject'].next([]);
    service['allGenresSubject'].next([]);
    service['allArtistsSubject'].next([]);
    (service as any).__originalLoadAllSongs.call(service);
    
    //Act
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
    //Arrange
    service['loadItunesSongs']().subscribe(songs => { //Act
      //Assert
      expect(Array.isArray(songs)).toBeTrue();
    });
    const req = httpMock.expectOne('https://itunes.apple.com/search?term=music&limit=100');
    //Assert
    expect(req.request.method).toBe('GET');
    req.flush({ results: [] });
    // Simula también la petición batch que ocurre después
    const batchReq = httpMock.expectOne(`${environment.backendUrl}/songs/batch`);
    //Assert
    expect(batchReq.request.method).toBe('POST');
    batchReq.flush({ success: true, data: [] });
  });

  it('debería manejar error en _loadAllSongsFromBackend y devolver []', (done) => {
    //Arrange
    service['_loadAllSongsFromBackend']().subscribe(songs => { //Act
      //Assert
      expect(songs).toEqual([]);
      done();
    });
    const req = httpMock.expectOne(`${environment.backendUrl}/songs`);
    req.error(new ErrorEvent('fail'));
  });

  it('debería guardar canciones en el backend con éxito', (done) => {
    //Arrange
    const mock = [mockSongs[0]];
    //Act
    service['saveSongsToBackend'](mock).subscribe(res => {
      //Assert
      expect(res).toEqual(mock);
      done();
    });
    const req = httpMock.expectOne(`${environment.backendUrl}/songs/batch`);
    req.flush({ success: true, data: mock });
  });

  it('debería manejar respuesta fallida de saveSongsToBackend', fakeAsync(() => {
    //Arrange
    const mock = [mockSongs[0]];
    let responseReceived = false;
    
    //Act
    service['saveSongsToBackend'](mock).subscribe({
      next: (songs) => {
        responseReceived = true;
        // Verificamos que devuelve las canciones originales cuando el backend indica fallo
        //Assert
        expect(songs).toEqual(mock);
      },
      error: () => {
        fail('No debería entrar en error debido al manejo en catchError');
      }
    });

    const req = httpMock.expectOne(`${environment.backendUrl}/songs/batch`);
    req.flush({ success: false, message: 'fail' });
    
    tick();
    //Assert
    expect(responseReceived).toBeTrue();
  }));

  it('debería devolver canciones originales si saveSongsToBackend falla', (done) => {
    //Arrange
    const mock = [mockSongs[0]];
    //Act
    service['saveSongsToBackend'](mock).subscribe(res => {
      //Assert
      expect(res).toEqual(mock);
      done();
    });
    const req = httpMock.expectOne(`${environment.backendUrl}/songs/batch`);
    req.error(new ErrorEvent('fail'));
  });

  it('debería cargar canciones subidas por usuario', (done) => {
    //Arrange 
    service['loadUploadedSongs']().subscribe(res => { //Act
      //Assert
      expect(res).toEqual(mockSongs);
      done();
    });
    const req = httpMock.expectOne(`${environment.backendUrl}/songs?isUserUpload=true`);
    req.flush(mockSongs);
  });

  it('debería devolver [] si loadUploadedSongs falla', (done) => {
    //Arrange
    service['loadUploadedSongs']().subscribe(res => { //Act
      //Assert
      expect(res).toEqual([]);
      done();
    });
    const req = httpMock.expectOne(`${environment.backendUrl}/songs?isUserUpload=true`);
    req.error(new ErrorEvent('fail'));
  });

  it('debería mapear canciones con generateUniqueId si faltan IDs', () => {
    //Arrange
    const raw = [{ artistName: 'A', trackName: 'T', primaryGenreName: 'G', collectionName: 'C', artworkUrl100: '', releaseDate: '2023' }];
    //Act
    const mapped = service['mapSongs'](raw, true);
    //Assert
    expect(mapped[0].isUserUpload).toBeTrue();
    //Assert
    expect(mapped[0].trackId).toBeTruthy();
  });

  it('debería actualizar géneros y artistas sin duplicados', () => {
    //Arrange
    service['allGenresSubject'].next(['Rock']);
    service['allArtistsSubject'].next(['X']);
    //Act
    service['updateGenresAndArtists']([mockSongs[0]]);
    //Assert
    expect(service.getGenres()).toContain('Pop');
    //Assert
    expect(service.getArtists()).toContain('Artista 1');
  });

  it('debería añadir canción correctamente', (done) => {
    //Arrange 
    service.addSong(mockSongs[0]).subscribe(song => {//Act
      //Assert
      expect(song).toEqual(mockSongs[0]);
      done();
    });
    const req = httpMock.expectOne(`${environment.backendUrl}/songs`);
    req.flush(mockSongs[0]);
  });

  it('debería lanzar error si addSong falla', (done) => {
    //Arrange
    service.addSong(mockSongs[0]).subscribe({ //Act
      error: (err) => {
        //Assert
        expect(err.message).toBe('Failed to add song');
        done();
      }
    });
    const req = httpMock.expectOne(`${environment.backendUrl}/songs`);
    req.error(new ErrorEvent('fail'));
  });

  it('debería filtrar canciones en fetchSongs', (done) => {
    //Arrange
    service['songsSubject'].next(mockSongs);
    //Act
    service.fetchSongs('canción').subscribe(res => {
      //Assert
      expect(res.length).toBe(1);
      done();
    });
  });

  it('debería devolver todas si no hay searchTerm en fetchSongs', (done) => {
    //Arrange
    service['songsSubject'].next(mockSongs);
    //Act
    service.fetchSongs().subscribe(res => {
      //Assert
      expect(res).toEqual(mockSongs);
      done();
    });
  });

  it('debería añadir canciones al caché sin duplicados', () => {
    //Arrange
    service['songsSubject'].next([mockSongs[0]]);
    //Act
    service['addSongsToCache']([mockSongs[0]]);
    //Assert
    expect(service['songsSubject'].getValue().length).toBe(1);
  });

  it('debería cubrir loadAllSongs catchError', () => {
    spyOn(service as any, '_loadAllSongsFromBackend').and.throwError('fail');
    (service as any).loadAllSongs(); // debería atrapar el error
  });
});
