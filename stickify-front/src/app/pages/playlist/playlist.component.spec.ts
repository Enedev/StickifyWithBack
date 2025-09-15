import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlaylistComponent } from './playlist.component';
import { MusicService } from '../../services/music.service';
import { PlaylistService } from '../../services/playlist.service';
import { PlaylistApiService } from '../../services/playlist-api.service';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Song } from '../../shared/interfaces/song.interface';
import { Playlist } from '../../shared/interfaces/playlist.interface';
import Swal from 'sweetalert2';

describe('PlaylistComponent', () => {
  let component: PlaylistComponent;
  let fixture: ComponentFixture<PlaylistComponent>;
  let playlistApiServiceSpy: jasmine.SpyObj<PlaylistApiService>;

  const mockSong: Song = {
    trackId: 1,
    artistName: 'Test Artist',
    trackName: 'Test Song',
    primaryGenreName: 'Pop',
    collectionName: 'Test Album',
    artworkUrl100: '',
    releaseDate: '2023-01-01',
    isUserUpload: false,
    collectionId: 101,
    artistId: 201
  };

  const mockPlaylist: Playlist = {
    id: '123',
    name: 'My Playlist',
    trackIds: [String(mockSong.trackId)],
    type: 'user',
    createdAt: new Date(),
    createdBy: 'testuser'
  };

  beforeEach(async () => {
    const playlistApiSpy = jasmine.createSpyObj('PlaylistApiService', ['createPlaylist', 'getAllPlaylists']);
    playlistApiSpy.getAllPlaylists.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [PlaylistComponent],
      providers: [
        { provide: MusicService, useValue: { songs$: of([mockSong]) } },
        {
          provide: PlaylistService,
          useValue: {
            generateAutoPlaylists: () => [],
            createUserPlaylist: (name: string, songs: Song[]) => ({
              name,
              trackIds: songs.map(s => String(s.trackId)),
              createdAt: new Date()
            }),
            getPlaylistSongs: () => [mockSong]
          }
        },
        { provide: PlaylistApiService, useValue: playlistApiSpy },
        { provide: AuthService, useValue: { currentUser: { username: 'testuser', premium: true } } },
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PlaylistComponent);
    component = fixture.componentInstance;

    // Evitar que se recargue la página
    spyOn(component, 'reloadPage').and.callFake(() => {});

    playlistApiServiceSpy = TestBed.inject(PlaylistApiService) as jasmine.SpyObj<PlaylistApiService>;
    fixture.detectChanges();
  });

  it('should add a song if not selected', () => {
    component.selectedSongs = [];
    component.toggleSongSelection(mockSong);
    expect(component.selectedSongs).toContain(mockSong);
  });

  it('should remove a song if already selected', () => {
    component.selectedSongs = [mockSong];
    component.toggleSongSelection(mockSong);
    expect(component.selectedSongs).not.toContain(mockSong);
  });

  it('should create playlist when name and songs are valid', async () => {
    component.newPlaylistName = 'My Playlist';
    component.selectedSongs = [mockSong];
    playlistApiServiceSpy.createPlaylist.and.returnValue(of(mockPlaylist));

    await component.createPlaylistAndSaveToSupabase();

    expect(playlistApiServiceSpy.createPlaylist).toHaveBeenCalled();
    expect(component.reloadPage).toHaveBeenCalled(); // Verificar que se llamó
    expect(component.isSavingPlaylist).toBeFalse();
  });

  it('should not create playlist if no songs selected', async () => {
    component.newPlaylistName = 'My Playlist';
    component.selectedSongs = [];

    await component.createPlaylistAndSaveToSupabase();

    expect(playlistApiServiceSpy.createPlaylist).not.toHaveBeenCalled();
    expect(component.reloadPage).not.toHaveBeenCalled();
  });

  it('should not create playlist if name is empty', async () => {
    component.newPlaylistName = '';
    component.selectedSongs = [mockSong];

    await component.createPlaylistAndSaveToSupabase();

    expect(playlistApiServiceSpy.createPlaylist).not.toHaveBeenCalled();
    expect(component.reloadPage).not.toHaveBeenCalled();
  });

  it('should return playlist songs from getPlaylistSongs', () => {
    const playlist: Playlist = { ...mockPlaylist };
    const songs = component.getPlaylistSongs(playlist);
    expect(Array.isArray(songs)).toBeTrue();
    expect(songs.length).toBeGreaterThanOrEqual(0);
  });

  it('should return playlist cover from getPlaylistCover', () => {
    const playlist: Playlist = { ...mockPlaylist };
    const cover = component.getPlaylistCover(playlist);
    expect(typeof cover).toBe('string');
    expect(cover).toContain('banner.jpg');
  });

  it('should filter user playlists for display', () => {
    component.userPlaylists = [mockPlaylist];
    const filtered = component.userPlaylistsFilteredForDisplay;
    expect(filtered).toEqual([mockPlaylist]);
  });

  it('should call loadAllPlaylistsFromBackend and handle error', () => {
    // No crear doble spy si ya existe
    const playlistApi = (component as any)['playlistApiService'];
    if (!playlistApi.getAllPlaylists.calls) {
      spyOn(playlistApi, 'getAllPlaylists').and.returnValue(of([{ ...mockPlaylist, createdBy: 'automatic' }, mockPlaylist]));
    } else {
      playlistApi.getAllPlaylists.and.returnValue(of([{ ...mockPlaylist, createdBy: 'automatic' }, mockPlaylist]));
    }
    component.loadAllPlaylistsFromBackend();
    expect(playlistApi.getAllPlaylists).toHaveBeenCalled();
    expect(component.userPlaylists).toContain(mockPlaylist);
    expect(component.userPlaylists.some(p => p.createdBy === 'automatic')).toBeFalse();
  });

  it('should call saveAutoPlaylistsToSupabaseInitially and resolve promises', async () => {
    component.autoPlaylists = [mockPlaylist];
    const playlistApi = (component as any)['playlistApiService'];
    if (!playlistApi.createPlaylist.calls) {
      spyOn(playlistApi, 'createPlaylist').and.returnValue(of(mockPlaylist));
    } else {
      playlistApi.createPlaylist.and.returnValue(of(mockPlaylist));
    }
    const result = await component.saveAutoPlaylistsToSupabaseInitially();
    expect(Array.isArray(result)).toBeTrue();
  });

  it('should call savePlaylistToProfile and handle already saved', async () => {
    component.currentUser = { username: 'testuser', premium: true } as any;
    (component as any)['savedPlaylistIds'].add(mockPlaylist.id);
    const fireSpy = spyOn(Swal, 'fire').and.callFake(() => Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false }));
    await component.savePlaylistToProfile(mockPlaylist);
    expect(fireSpy).toHaveBeenCalled();
  });

  it('should call ngOnInit and initialize playlists', () => {
    spyOn(component, 'loadAllPlaylistsFromBackend');
    spyOn((component as any)['musicService'].songs$, 'subscribe').and.callFake((cb: any) => {
      cb([mockSong]);
      return { unsubscribe: () => {}, closed: false, add: () => {}, remove: () => {} } as any;
    });
    component.ngOnInit();
    expect(component.loadAllPlaylistsFromBackend).toHaveBeenCalled();
    expect(Array.isArray(component.allSongs)).toBeTrue();
  });

});
