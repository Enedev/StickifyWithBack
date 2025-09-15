import { TestBed } from '@angular/core/testing';
import { RatingService } from './rating.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { Song } from '../shared/interfaces/song.interface';

const mockRatings = [
  { trackId: 1, userId: 'user1', rating: 5 },
  { trackId: 1, userId: 'user2', rating: 3 }
];
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

describe('RatingService', () => {
  let service: RatingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [RatingService]
    });
    // Stub loadRatings on prototype to avoid automatic GET in constructor
    const originalLoadRatings = (RatingService.prototype as any).loadRatings;
    spyOn(RatingService.prototype as any, 'loadRatings').and.stub();

    service = TestBed.inject(RatingService);
    httpMock = TestBed.inject(HttpTestingController);

    // Attach original method for tests that need to call it explícitamente
    (service as any).__originalLoadRatings = originalLoadRatings;

    // Consumir cualquier petición automática que haya quedado abierta
    const pendingRatings = httpMock.match(`${environment.backendUrl}/ratings`);
    pendingRatings.forEach(req => req.flush([]));
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debería cargar ratings desde el backend', () => {
    (service as any).__originalLoadRatings.call(service);
    const req = httpMock.expectOne(`${environment.backendUrl}/ratings`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRatings);
    expect(service.currentRatings[1]['user1']).toBe(5);
    expect(service.currentRatings[1]['user2']).toBe(3);
  });

  it('debería manejar error al cargar ratings', () => {
    (service as any).__originalLoadRatings.call(service);
    const req = httpMock.expectOne(`${environment.backendUrl}/ratings`);
    req.error(new ErrorEvent('Error'));
  });

  it('debería calcular el promedio de rating de una canción', () => {
    service['userRatingsSubject'].next({ 1: { user1: 5, user2: 3 } });
    const avg = service.getAverageRatingForSong(1);
    expect(avg).toBe(4);
  });

  it('debería actualizar las canciones mejor calificadas', () => {
    service['userRatingsSubject'].next({ 1: { user1: 5, user2: 3 } });
    service.updateTopRatedSongs(mockSongs);
    expect(service.topRatedSongs$).toBeTruthy();
  });

  it('debería calificar una canción', (done) => {
    service.rateSong('user1', 1, 5);
    // Consumir el POST inmediatamente
    const postReq = httpMock.expectOne(`${environment.backendUrl}/ratings`);
    expect(postReq.request.method).toBe('POST');
    postReq.flush({});
    
    // Dar tiempo al servicio para que procese la respuesta del POST
    setTimeout(() => {
      // Llama al método original para disparar el GET y lo consume
      (service as any).__originalLoadRatings.call(service);
      const getReq = httpMock.expectOne(`${environment.backendUrl}/ratings`);
      getReq.flush(mockRatings);
      done();
    });
  });
});
