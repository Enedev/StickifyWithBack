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

});
