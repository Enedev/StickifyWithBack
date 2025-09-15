import { TestBed } from '@angular/core/testing';
import { PlaylistService } from './playlist.service';
import { AuthService } from './auth.service';
import { PlaylistApiService } from './playlist-api.service';
import { Song } from '../shared/interfaces/song.interface';
import { Playlist } from '../shared/interfaces/playlist.interface';
import { Subscription } from 'rxjs';

const mockUser = { username: 'user1', email: 'user1@example.com' };
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

import { of } from 'rxjs';

describe('PlaylistService', () => {
  let service: PlaylistService;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let playlistApiServiceSpy: jasmine.SpyObj<PlaylistApiService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], { currentUser: mockUser });
    playlistApiServiceSpy = jasmine.createSpyObj('PlaylistApiService', ['getUserPlaylists']);
    TestBed.configureTestingModule({
      providers: [
        PlaylistService,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: PlaylistApiService, useValue: playlistApiServiceSpy }
      ]
    });
    service = TestBed.inject(PlaylistService);
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  

  it('debería crear una playlist de usuario', () => {
    const playlist = service.createUserPlaylist('Mi Playlist', mockSongs);
    expect(playlist.name).toBe('Mi Playlist');
    expect(playlist.trackIds.length).toBe(1);
    expect(playlist.createdBy).toBe(mockUser.email);
  });
  
  it('debería obtener playlists del usuario', () => {
  const mockPlaylists = [{ id: '1', name: 'Test', trackIds: ['1'], type: 'user' as 'user', createdAt: new Date(), createdBy: mockUser.email }];
    playlistApiServiceSpy.getUserPlaylists.and.returnValue(of(mockPlaylists));
    spyOn(console, 'log');
    service.getUserPlaylists();
    expect(playlistApiServiceSpy.getUserPlaylists).toHaveBeenCalledWith(mockUser.email);
    expect(console.log).toHaveBeenCalledWith('Playlists cargadas desde el backend:', mockPlaylists);
  });

  it('debería generar playlists automáticas por género', () => {
    const playlists = service.generateAutoPlaylists(mockSongs);
    expect(Array.isArray(playlists)).toBeTrue();
    expect(playlists[0].type).toBe('auto');
  });

  it('debería obtener canciones de una playlist', () => {
    const playlist: Playlist = {
      id: '1',
      name: 'Test',
      trackIds: ['1'],
      type: 'user',
      createdAt: new Date(),
      createdBy: mockUser.email
    };
    const songs = service.getPlaylistSongs(playlist, mockSongs);
    expect(songs.length).toBe(1);
    expect(songs[0].trackId).toBe(1);
  });
});
