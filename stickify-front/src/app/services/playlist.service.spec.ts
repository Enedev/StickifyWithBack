import { TestBed } from '@angular/core/testing';
import { PlaylistService } from './playlist.service';
import { AuthService } from './auth.service';
import { PlaylistApiService } from './playlist-api.service';
import { of, throwError } from 'rxjs';
import { Song } from '../shared/interfaces/song.interface';
import { Playlist } from '../shared/interfaces/playlist.interface';

describe('PlaylistService', () => {
  let service: PlaylistService;
  let authService: jasmine.SpyObj<AuthService>;
  let playlistApiService: jasmine.SpyObj<PlaylistApiService>;

  const mockUser = { id: '1', email: 'test@user.com', username: 'testUser' };
  
  const mockSongs: Song[] = [
    {
      trackId: 1,
      artistName: 'Artist 1',
      trackName: 'Song 1',
      primaryGenreName: 'Pop',
      collectionName: 'Album 1',
      artworkUrl100: 'url1',
      releaseDate: '2023-01-01',
      isUserUpload: false,
      collectionId: 1,
      artistId: 1
    },
    {
      trackId: 2,
      artistName: 'Artist 2',
      trackName: 'Song 2',
      primaryGenreName: 'Rock',
      collectionName: 'Album 2',
      artworkUrl100: 'url2',
      releaseDate: '2023-01-02',
      isUserUpload: false,
      collectionId: 2,
      artistId: 2
    }
  ];

  const mockPlaylists: Playlist[] = [
    {
      id: '1',
      name: 'Test Playlist',
      trackIds: ['1', '2'],
      type: 'user',
      createdAt: new Date(),
      createdBy: 'test@user.com'
    }
  ];

  beforeEach(() => {
    // Crear spies para los servicios
    authService = jasmine.createSpyObj('AuthService', [], {
      currentUser: mockUser
    });

    playlistApiService = jasmine.createSpyObj('PlaylistApiService', [
      'getUserPlaylists',
      'createPlaylist',
      'getAllPlaylists',
      'saveUserPlaylist',
      'getUserSavedPlaylists',
      'getPlaylistByName',
      'getAllUsersPlaylists'
    ]);

    // Configurar comportamiento por defecto de los spies
    playlistApiService.getUserPlaylists.and.returnValue(of(mockPlaylists));
    playlistApiService.getAllPlaylists.and.returnValue(of(mockPlaylists));
    playlistApiService.createPlaylist.and.returnValue(of(mockPlaylists[0]));

    TestBed.configureTestingModule({
      providers: [
        PlaylistService,
        { provide: AuthService, useValue: authService },
        { provide: PlaylistApiService, useValue: playlistApiService }
      ]
    });

    service = TestBed.inject(PlaylistService);
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debería obtener playlists del usuario correctamente', () => {
    const result = service.getUserPlaylists();
    
    expect(playlistApiService.getUserPlaylists).toHaveBeenCalledWith(mockUser.email);
    expect(result).toEqual([]); // La función retorna [] mientras carga async
  });

  it('debería manejar error al obtener playlists del usuario', () => {
    playlistApiService.getUserPlaylists.and.returnValue(throwError(() => new Error('Error')));
    spyOn(console, 'error');
    
    service.getUserPlaylists();
    
    expect(console.error).toHaveBeenCalledWith(
      'Error al cargar las playlists del usuario desde el backend:',
      jasmine.any(Error)
    );
  });

  it('debería advertir si no hay usuario logueado al obtener playlists', () => {
    // Simular que no hay usuario
    Object.defineProperty(authService, 'currentUser', { get: () => null });
    spyOn(console, 'warn');
    
    service.getUserPlaylists();
    
    expect(console.warn).toHaveBeenCalledWith('No hay usuario logueado para cargar playlists.');
  });

  it('debería crear una playlist de usuario correctamente', () => {
    const playlistName = 'Nueva Playlist';
    const playlist = service.createUserPlaylist(playlistName, mockSongs);
    
    expect(playlist).toBeDefined();
    expect(playlist.name).toBe(playlistName);
    expect(playlist.trackIds).toEqual(mockSongs.map(s => s.trackId.toString()));
    expect(playlist.type).toBe('user');
    expect(playlist.createdBy).toBe(mockUser.email);
  });

  it('debería lanzar error al crear playlist sin usuario logueado', () => {
    // Simular que no hay usuario
    Object.defineProperty(authService, 'currentUser', { get: () => null });
    
    expect(() => service.createUserPlaylist('Test', mockSongs))
      .toThrowError('Usuario no identificado.');
  });

  it('debería generar playlists automáticas por género', () => {
    const autoPlaylists = service.generateAutoPlaylists(mockSongs);
    
    expect(autoPlaylists.length).toBe(2); // Pop y Rock
    expect(autoPlaylists[0].type).toBe('auto');
    expect(autoPlaylists[0].trackIds).toContain('1'); // Pop song
    expect(autoPlaylists[1].trackIds).toContain('2'); // Rock song
  });

  it('debería obtener canciones de una playlist', () => {
    const playlist: Playlist = {
      id: '1',
      name: 'Test Playlist',
      trackIds: ['1', '2'],
      type: 'user',
      createdAt: new Date(),
      createdBy: mockUser.email
    };
    
    const songs = service.getPlaylistSongs(playlist, mockSongs);
    
    expect(songs.length).toBe(2);
    expect(songs[0]).toEqual(mockSongs[0]);
    expect(songs[1]).toEqual(mockSongs[1]);
  });
});
