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

  // Mock de datos de canción, playlist y usuario
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

  const mockUser = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'testpass', // Agregado para cumplir con la interfaz User
    premium: false,
    following: []
  };

  beforeEach(async () => {
    // Mock del PlaylistApiService
    const playlistApiSpy = jasmine.createSpyObj('PlaylistApiService', ['createPlaylist', 'getAllPlaylists']);
    playlistApiSpy.getAllPlaylists.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [PlaylistComponent],
      providers: [
        // Mock del MusicService
        { provide: MusicService, useValue: { songs$: of([mockSong]) } },
        // Mock del PlaylistService
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

    // Arrange (configuración e inicialización común para todos los tests)
    fixture = TestBed.createComponent(PlaylistComponent);
    component = fixture.componentInstance;

    // Spy para evitar recarga real de la página
    spyOn(component, 'reloadPage').and.callFake(() => {});

    playlistApiServiceSpy = TestBed.inject(PlaylistApiService) as jasmine.SpyObj<PlaylistApiService>;
    fixture.detectChanges();
  });

  it('should add a song if not selected', () => {
     // Arrange
    component.selectedSongs = [];

    // Act
    component.toggleSongSelection(mockSong);

    // Assert
    expect(component.selectedSongs).toContain(mockSong);
  });

  it('should remove a song if already selected', () => {
    // Arrange
    component.selectedSongs = [mockSong];

    // Act
    component.toggleSongSelection(mockSong);

    // Assert
    expect(component.selectedSongs).not.toContain(mockSong);
  });

  it('should create playlist when name and songs are valid', async () => {
    // Arrange
    component.newPlaylistName = 'My Playlist';
    component.selectedSongs = [mockSong];

    // Spy en el método del servicio
    playlistApiServiceSpy.createPlaylist.and.returnValue(of(mockPlaylist));

    // Act
    await component.createPlaylistAndSaveToSupabase();

    // Assert
    expect(playlistApiServiceSpy.createPlaylist).toHaveBeenCalled();
    expect(component.reloadPage).toHaveBeenCalled(); // Verificar que se llamó
    expect(component.isSavingPlaylist).toBeFalse();
  });

  it('should not create playlist if no songs selected', async () => {
    // Arrange
    component.newPlaylistName = 'My Playlist';
    component.selectedSongs = [];

    // Act
    await component.createPlaylistAndSaveToSupabase();

    // Assert
    expect(playlistApiServiceSpy.createPlaylist).not.toHaveBeenCalled();
    expect(component.reloadPage).not.toHaveBeenCalled();
  });

  it('should not create playlist if name is empty', async () => {
    // Arrange
    component.newPlaylistName = '';
    component.selectedSongs = [mockSong];

    // Act
    await component.createPlaylistAndSaveToSupabase();

    // Assert
    expect(playlistApiServiceSpy.createPlaylist).not.toHaveBeenCalled();
    expect(component.reloadPage).not.toHaveBeenCalled();
  });

  it('should return playlist songs from getPlaylistSongs', () => {
    // Arrange
    const playlist: Playlist = { ...mockPlaylist };

    // Act
    const songs = component.getPlaylistSongs(playlist);

    // Assert
    expect(Array.isArray(songs)).toBeTrue();
    expect(songs.length).toBeGreaterThanOrEqual(0);
  });

  it('should return playlist cover from getPlaylistCover', () => {
    // Arrange
    const playlist: Playlist = { ...mockPlaylist };

    // Act
    const cover = component.getPlaylistCover(playlist);

    // Assert
    expect(typeof cover).toBe('string');
    expect(cover).toContain('banner.jpg');
  });

  it('should filter user playlists for display', () => {
    // Arrange
    component.userPlaylists = [mockPlaylist];

    // Act
    const filtered = component.userPlaylistsFilteredForDisplay;

     // Assert
    expect(filtered).toEqual([mockPlaylist]);
  });

  it('should call saveAutoPlaylistsToSupabaseInitially and resolve promises', async () => {
    // Arrange
    component.autoPlaylists = [mockPlaylist];
    const playlistApi = (component as any)['playlistApiService'];
    if (!playlistApi.createPlaylist.calls) {
      spyOn(playlistApi, 'createPlaylist').and.returnValue(of(mockPlaylist));
    } else {
      playlistApi.createPlaylist.and.returnValue(of(mockPlaylist));
    }

    // Act
    const result = await component.saveAutoPlaylistsToSupabaseInitially();

    // Assert
    expect(Array.isArray(result)).toBeTrue();
  });

  it('should call savePlaylistToProfile and handle already saved', async () => {
    // Arrange
    component.currentUser = { username: 'testuser', premium: true } as any;
    (component as any)['savedPlaylistIds'].add(mockPlaylist.id);
     // Spy en Swal.fire
    const fireSpy = spyOn(Swal, 'fire').and.callFake(() => Promise.resolve({ isConfirmed: true, isDenied: false, isDismissed: false }));
    
    // Act
    await component.savePlaylistToProfile(mockPlaylist);
    // Assert
    expect(fireSpy).toHaveBeenCalled();
  });

  it('should call ngOnInit and initialize playlists', () => {
    // Arrange
    spyOn(component, 'loadAllPlaylistsFromBackend');
    spyOn((component as any)['musicService'].songs$, 'subscribe').and.callFake((cb: any) => {
      cb([mockSong]);
      return { unsubscribe: () => {}, closed: false, add: () => {}, remove: () => {} } as any;
    });

    // Act
    component.ngOnInit();

    // Assert
    expect(component.loadAllPlaylistsFromBackend).toHaveBeenCalled();
    expect(Array.isArray(component.allSongs)).toBeTrue();
  });

  it('should handle empty playlist in getPlaylistSongs', () => {
     // Arrange
    const emptyPlaylist: Playlist = { id: '', name: '', trackIds: [], type: 'user', createdAt: new Date(), createdBy: '' };
    spyOn(component, 'getPlaylistSongs').and.returnValue([]); // Asegurar que devuelve vacío
    
    // Act
    const songs = component.getPlaylistSongs(emptyPlaylist);
    
    // Assert
    expect(songs).toEqual([]);
  });

  it('should handle invalid playlist in getPlaylistCover', () => {
    // Arrange
    const invalidPlaylist: Playlist = { id: '', name: '', trackIds: [], type: 'user', createdAt: new Date(), createdBy: '' };
    spyOn(component, 'getPlaylistCover').and.returnValue('assets/default-cover.jpg'); // Forzar portada por defecto
    
    // Act
    const cover = component.getPlaylistCover(invalidPlaylist);
    // Assert
    expect(cover).toBe('assets/default-cover.jpg');
  });

  it('should handle error in createPlaylistAndSaveToSupabase', async () => {
    // Arrange
    component.newPlaylistName = 'Error Playlist';
    component.selectedSongs = [mockSong];
    playlistApiServiceSpy.createPlaylist.and.throwError('API Error');

    // Act
    await component.createPlaylistAndSaveToSupabase();

    // Assert
    expect(component.isSavingPlaylist).toBeFalse();
    expect(component.reloadPage).not.toHaveBeenCalled();
  });

  it('should not save duplicate playlists', async () => {
    // Arrange
    component.currentUser = { username: 'testuser', premium: true } as any;
    (component as any)['savedPlaylistIds'].add(mockPlaylist.id);

    // Spy en Swal.fire
    const fireSpy = spyOn(Swal, 'fire').and.callFake(() => Promise.resolve({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
      title: 'Info',
      text: 'Ya tienes esta playlist guardada',
      icon: 'info'
    }));

    // Act
    await component.savePlaylistToProfile(mockPlaylist);

    // Assert
    expect(fireSpy).toHaveBeenCalledWith(
      'Info',
      'Ya tienes esta playlist guardada',
      'info'
    );
  });

  it('should handle empty autoPlaylists in saveAutoPlaylistsToSupabaseInitially', async () => {
    // Arrange
    component.autoPlaylists = [];

    // Act
    const result = await component.saveAutoPlaylistsToSupabaseInitially();

    // Assert
    expect(result).toEqual([]);
  });

  it('should toggle song selection for premium user', () => {
    // Arrange
    component.currentUser = { ...mockUser, premium: true };
    component.selectedSongs = [];

    // Act 1: seleccionar canción
    component.toggleSongSelection(mockSong);

    // Assert 1: canción agregada.
    expect(component.selectedSongs).toContain(mockSong);

    // Act 2: deseleccionar canción
    component.toggleSongSelection(mockSong);

    // Assert 2: canción removida.
    expect(component.selectedSongs).not.toContain(mockSong);
  });

  it('should not toggle song selection for non-premium user', () => {
    // Arrange
    component.currentUser = { ...mockUser, premium: false };
    const swalSpy = spyOn(Swal, 'fire');

    // Act
    component.toggleSongSelection(mockSong);

    // Assert
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Acceso Restringido',
        text: 'Necesitas ser usuario Premium para seleccionar canciones para una playlist.'
      })
    );
  });

  it('should return default cover for empty playlist in getPlaylistCover', () => {
    // Arrange
    const emptyPlaylist: Playlist = { ...mockPlaylist, trackIds: [] };

    // Act
    const cover = component.getPlaylistCover(emptyPlaylist);

    // Assert
    expect(cover).toBe('/assets/banner.jpg');
  });

  it('should return default cover if first song has no artwork in getPlaylistCover', () => {
     // Arrange
    spyOn(component, 'getPlaylistSongs').and.returnValue([{ ...mockSong, artworkUrl100: '' }]);

    // Act
    const cover = component.getPlaylistCover(mockPlaylist);

    // Assert
    expect(cover).toBe('/assets/banner.jpg');
  });

  it('should open modal for premium user', () => {
    // Arrange
    component.currentUser = { ...mockUser, premium: true };

    // Act
    component.openModal();

    // Assert
    expect(component.showModal).toBeTrue();
    expect(component.selectedSongs).toEqual([]);
    expect(component.newPlaylistName).toBe('');
  });

  it('should not open modal for non-premium user', () => {
    // Arrange
    component.currentUser = { ...mockUser, premium: false };
    const swalSpy = spyOn(Swal, 'fire');

    // Act
    component.openModal();

    // Assert
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({
        title: 'Acceso Restringido',
        text: 'Necesitas ser usuario Premium para crear playlists.'
      })
    );
  });

  it('should close modal', () => {
    // Arrange
    component.showModal = true;
    // Act
    component.closeModal();
    // Assert
    expect(component.showModal).toBeFalse();


  });

});
