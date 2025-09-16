import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { SongApiService } from './song-api.service';
import { Song } from '../shared/interfaces/song.interface';

describe('SongApiService', () => {
  let service: SongApiService;
  let httpMock: HttpTestingController;

  // Mock data que coincide con la interfaz Song
  const mockSong: Song = { 
    trackId: 1,
    artistName: 'Test Artist',
    trackName: 'Test Song',
    primaryGenreName: 'Rock',
    collectionName: 'Test Album',
    artworkUrl100: 'http://example.com/artwork.jpg',
    releaseDate: '2023-01-01',
    isUserUpload: false,
    collectionId: 1,
    artistId: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [SongApiService]
    });

    service = TestBed.inject(SongApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verify that no unmatched requests are outstanding
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createSong', () => {
    it('should make a POST request to create a song', () => {
      // Act
      service.createSong(mockSong).subscribe(response => {
        // Assert response
        expect(response).toEqual(mockSong);
      });

      // Assert request
      const req = httpMock.expectOne('http://localhost:3000/api/songs');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockSong);

      // Respond with mock data
      req.flush(mockSong);
    });

    it('should handle errors when creating a song', () => {
      // Act
      service.createSong(mockSong).subscribe({
        error: (error) => {
          // Assert error handling
          expect(error.status).toBe(500);
        }
      });

      // Assert request and simulate error
      const req = httpMock.expectOne('http://localhost:3000/api/songs');
      req.flush('Error creating song', {
        status: 500,
        statusText: 'Internal Server Error'
      });
    });
  });

  // Test base URL configuration
  it('should use correct base URL for API requests', () => {
    service.createSong(mockSong).subscribe();
    
    const req = httpMock.expectOne('http://localhost:3000/api/songs');
    expect(req.request.url).toBe('http://localhost:3000/api/songs');
    req.flush({});
  });
});