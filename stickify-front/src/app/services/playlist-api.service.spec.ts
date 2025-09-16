import { TestBed } from '@angular/core/testing';
import { PlaylistApiService } from './playlist-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Playlist } from '../shared/interfaces/playlist.interface';
import { UserSavedPlaylist } from '../shared/interfaces/user-saved-playlist.interface';

describe('PlaylistApiService', () => {
  let service: PlaylistApiService;
  let httpMock: HttpTestingController;

  const mockPlaylist: Playlist = {
    id: '1',
    name: 'Test Playlist',
    trackIds: ['1', '2', '3'],
    type: 'user',
    createdAt: new Date(),
    createdBy: 'test@user.com'
  };

  const mockPlaylists: Playlist[] = [
    mockPlaylist,
    {
      id: '2',
      name: 'Another Playlist',
      trackIds: ['4', '5'],
      type: 'user',
      createdAt: new Date(),
      createdBy: 'test@user.com'
    }
  ];

  const mockUserSavedPlaylist: UserSavedPlaylist = {
    id: '1',
    user_id: 'test@user.com',
    playlist_id: '1',
    saved_at: new Date()
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PlaylistApiService]
    });

    service = TestBed.inject(PlaylistApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debería crear una playlist', () => {
    service.createPlaylist(mockPlaylist).subscribe(playlist => {
      expect(playlist).toEqual(mockPlaylist);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/playlists');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockPlaylist);
    req.flush(mockPlaylist);
  });

  it('debería obtener todas las playlists', () => {
    service.getAllPlaylists().subscribe(playlists => {
      expect(playlists).toEqual(mockPlaylists);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/playlists');
    expect(req.request.method).toBe('GET');
    req.flush(mockPlaylists);
  });

  it('debería guardar una playlist para un usuario', () => {
    const userId = 'test@user.com';
    const playlistId = '1';

    service.saveUserPlaylist(userId, playlistId).subscribe(savedPlaylist => {
      expect(savedPlaylist).toEqual(mockUserSavedPlaylist);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/user-saved-playlists');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ userId, playlistId });
    req.flush(mockUserSavedPlaylist);
  });

  it('debería obtener las playlists guardadas de un usuario', () => {
    const userId = 'test@user.com';

    service.getUserSavedPlaylists(userId).subscribe(playlists => {
      expect(playlists).toEqual(mockPlaylists);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/user-saved-playlists/user/${userId}/full`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlaylists);
  });

  it('debería obtener una playlist por nombre', () => {
    const playlistName = 'Test Playlist';

    service.getPlaylistByName(playlistName).subscribe(playlist => {
      expect(playlist).toEqual(mockPlaylist);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/playlists/by-name/${encodeURIComponent(playlistName)}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlaylist);
  });

  it('debería obtener las playlists de un usuario', () => {
    const userId = 'test@user.com';

    service.getUserPlaylists(userId).subscribe(playlists => {
      expect(playlists).toEqual(mockPlaylists);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/playlists/user/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlaylists);
  });

  it('debería obtener las playlists de todos los usuarios', () => {
    const userId = 'test@user.com';

    service.getAllUsersPlaylists(userId).subscribe(playlists => {
      expect(playlists).toEqual(mockPlaylists);
    });

    const req = httpMock.expectOne(`http://localhost:3000/api/playlists/user`);
    expect(req.request.method).toBe('GET');
    req.flush(mockPlaylists);
  });

  it('debería manejar errores al crear una playlist', () => {
    service.createPlaylist(mockPlaylist).subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/api/playlists');
    req.flush('Error creating playlist', {
      status: 500,
      statusText: 'Internal Server Error'
    });
  });

  it('debería manejar errores al obtener playlists', () => {
    service.getAllPlaylists().subscribe({
      error: (error) => {
        expect(error.status).toBe(500);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/api/playlists');
    req.flush('Error fetching playlists', {
      status: 500,
      statusText: 'Internal Server Error'
    });
  });
});