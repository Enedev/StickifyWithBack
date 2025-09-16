import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ProfileComponent } from './profile.component';
import { AuthService } from '../../services/auth.service';
import { MusicService } from '../../services/music.service';
import { PlaylistApiService } from '../../services/playlist-api.service';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of, Subject, throwError } from 'rxjs';
import { User } from '../../shared/interfaces/user.interface';
import { Song } from '../../shared/interfaces/song.interface';
import { BackendSongRating } from '../../shared/interfaces/backend-song-rating.interface';
import { BackendComment } from '../../shared/interfaces/backend-comment.interface';
import { Playlist } from '../../shared/interfaces/playlist.interface';
import Swal from 'sweetalert2';
import { RouterTestingModule } from '@angular/router/testing';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let musicServiceSpy: jasmine.SpyObj<MusicService>;
  let playlistApiSpy: jasmine.SpyObj<PlaylistApiService>;
  let httpMock: HttpTestingController;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'testpass',
    premium: false,
    followers: ['a@example.com', 'b@example.com'],
    following: ['c@example.com']
  };

  const mockSongs: Song[] = [
    {
      trackId: 1,
      trackName: 'Song One',
      artworkUrl100: 'cover1.jpg',
      artistName: 'Artist One',
      primaryGenreName: 'Pop',
      collectionName: 'Collection One',
      releaseDate: '2023-01-01',
      collectionId: 101,
      artistId: 201,
      isUserUpload: false
    },
    {
      trackId: 2,
      trackName: 'Song Two',
      artworkUrl100: 'cover2.jpg',
      artistName: 'Artist Two',
      primaryGenreName: 'Rock',
      collectionName: 'Collection Two',
      releaseDate: '2023-01-02',
      collectionId: 102,
      artistId: 202,
      isUserUpload: false
    }
  ];


  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['getAllOtherUsers', 'updateUserPremiumStatus', 'logOut'], { currentUser: mockUser });
    authSpy.getAllOtherUsers.and.returnValue(of([]));
    const musicSpy = jasmine.createSpyObj('MusicService', [], { songs$: of(mockSongs) });
    const playlistSpy = jasmine.createSpyObj('PlaylistApiService', ['getUserSavedPlaylists']);

    TestBed.configureTestingModule({
      imports: [ProfileComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: MusicService, useValue: musicSpy },
        { provide: PlaylistApiService, useValue: playlistSpy }
      ]
    });

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    musicServiceSpy = TestBed.inject(MusicService) as jasmine.SpyObj<MusicService>;
    playlistApiSpy = TestBed.inject(PlaylistApiService) as jasmine.SpyObj<PlaylistApiService>;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user data and subscribe to songs$', () => {
  spyOn(component as any, 'loadAllProfileData');
  component.currentUser = { ...mockUser };
  component.ngOnInit();
  expect(component.currentUser).toEqual(mockUser);
  expect((component as any).loadAllProfileData).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const songSub = new Subject<Song[]>().subscribe();
    const userSub = new Subject<User[]>().subscribe();
    (component as any).songsSubscription = songSub;
    (component as any).usersSubscription = userSub;
    spyOn(songSub, 'unsubscribe');
    spyOn(userSub, 'unsubscribe');
    component.ngOnDestroy();
    expect(songSub.unsubscribe).toHaveBeenCalled();
    expect(userSub.unsubscribe).toHaveBeenCalled();
  });

  it('should process fetched ratings correctly', () => {
  const ratings: BackendSongRating[] = [{ trackId: 1, rating: 4, userId: '1' }];
    component.allSongs = mockSongs;
    const result = (component as any).processFetchedRatings(ratings);
    expect(result[0].songName).toBe('Song One');
  });

  it('should process fetched comments correctly', () => {
  const comments: BackendComment[] = [{ id: 'c1', user: 'testuser', trackId: 2, text: 'Nice', date: 20230101 }];
    component.allSongs = mockSongs;
    const result = (component as any).processFetchedComments(comments);
    expect(result[0].songName).toBe('Song Two');
  });

  it('should return playlist cover from song', () => {
    component.allSongs = mockSongs;
    const playlist: Playlist = {
      id: 'p1',
      name: 'Test Playlist',
      trackIds: ['1'],
      type: 'user',
      createdAt: new Date(),
      cover: 'cover1.jpg',
      createdBy: 'testuser'
    };
    const cover = component.getPlaylistCoverForProfile(playlist);
    expect(cover).toBe('cover1.jpg');
  });

  it('should return default cover if no match', () => {
    const playlist: Playlist = {
      id: 'p2',
      name: 'Empty Playlist',
      trackIds: ['99'],
      type: 'user',
      createdAt: new Date(),
      cover: '',
      createdBy: 'testuser'
    };
    component.allSongs = mockSongs;
    const cover = component.getPlaylistCoverForProfile(playlist);
    expect(cover).toBe('/assets/banner.jpg');
  });

  it('should call logout method', () => {
    component.logout();
    expect(authServiceSpy.logOut).toHaveBeenCalled();
  });

  it('should update follow data correctly', () => {
    (component as any).allUsersMap.set('a@example.com', 'UserA');
    (component as any).allUsersMap.set('b@example.com', 'UserB');
    (component as any).allUsersMap.set('c@example.com', 'UserC');
    (component as any).updateFollowData();
    expect(component.followersCount).toBe(2);
    expect(component.latestFollowersNames).toEqual(['UserB', 'UserA']);
    expect(component.latestFollowingNames).toEqual(['UserC']);
  });

  it('should toggle premium status and show modal if not premium', fakeAsync(() => {
  component.currentUser = { ...mockUser, premium: false };
  component.togglePremiumStatus();
  tick();
  expect(component.showPremiumModal).toBeTrue();
  }));

  it('should handle premium modal confirmation', fakeAsync(() => {
  authServiceSpy.updateUserPremiumStatus.and.returnValue(of(true));
  component.currentUser = { ...mockUser, premium: false };
  component.handlePremiumModalClose(true);
  tick();
  expect(component.currentUser!.premium).toBeTrue();
  }));

  it('should handle premium modal cancellation', fakeAsync(() => {
  spyOn(Swal, 'fire');
  component.currentUser = { ...mockUser };
  component.handlePremiumModalClose(false);
  tick();
  expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Pago cancelado' }));
  }));

  it('should handle error in loadAllUsersForMapping', fakeAsync(() => {
    spyOn(console, 'error');
    authServiceSpy.getAllOtherUsers.and.returnValue(throwError(() => new Error('fail')));
    
    component.ngOnInit();
    tick();
    
    expect(console.error).toHaveBeenCalledWith('Error loading all users for mapping:', jasmine.any(Error));
  }));

  it('should handle error in loadAllProfileData', fakeAsync(() => {
    spyOn(console, 'error');
    spyOn(Swal, 'fire');
    
    // Mock de usuario actual
    component.currentUser = { ...mockUser };
    
    // Mock de servicios que retornan error
    playlistApiSpy.getUserSavedPlaylists.and.returnValue(throwError(() => new Error('http fail')));
    
    // Llamar al método
    (component as any).loadAllProfileData();
    tick();
    
    // Verificar que se muestra el error
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error de Carga',
      text: 'No se pudieron cargar tus datos de perfil. Inténtalo de nuevo más tarde.'
    }));
  }));

  it('should not load profile data if email missing', () => {
    spyOn(console, 'error');
    component.currentUser = { ...mockUser, email: '' };
    (component as any).loadAllProfileData();
    expect(console.error).toHaveBeenCalledWith('Cannot load profile data: Current user email is missing.');
  });

  it('should fallback songName if rating song not found', () => {
    const ratings: BackendSongRating[] = [{ trackId: 999, rating: 5, userId: '1' }];
    component.allSongs = mockSongs;
    const result = (component as any).processFetchedRatings(ratings);
    expect(result[0].songName).toContain('Canción ID: 999');
  });

  it('should fallback songName if comment song not found', () => {
    const comments: BackendComment[] = [{ id: 'c1', user: 'x', trackId: 999, text: 'Hello', date: 20230101 }];
    component.allSongs = mockSongs;
    const result = (component as any).processFetchedComments(comments);
    expect(result[0].songName).toContain('Canción ID: 999');
  });

  it('should return default cover if trackIds is empty', () => {
    const playlist: Playlist = { id: 'p3', name: 'Empty', trackIds: [], type: 'user', createdAt: new Date(), cover: '', createdBy: 'u' };
    component.allSongs = mockSongs;
    const cover = component.getPlaylistCoverForProfile(playlist);
    expect(cover).toBe('/assets/banner.jpg');
  });

  it('should cancel premium if user is already premium and confirms', fakeAsync(async () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    authServiceSpy.updateUserPremiumStatus.and.returnValue(of(true));
    component.currentUser = { ...mockUser, premium: true };
    await component.togglePremiumStatus();
    tick();
    expect(authServiceSpy.updateUserPremiumStatus).toHaveBeenCalledWith(mockUser.email, false);
  }));

  it('should not cancel premium if user is already premium and cancels', fakeAsync(async () => {
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false }) as any);
    authServiceSpy.updateUserPremiumStatus.and.returnValue(of(true));
    component.currentUser = { ...mockUser, premium: true };
    await component.togglePremiumStatus();
    tick();
    expect(authServiceSpy.updateUserPremiumStatus).not.toHaveBeenCalled();
  }));

  it('should show error if updateUserPremiumStatus returns false', fakeAsync(() => {
    spyOn(Swal, 'fire');
    authServiceSpy.updateUserPremiumStatus.and.returnValue(of(false));
    component.currentUser = { ...mockUser };
    (component as any).updatePremiumStatus(mockUser.email, true, 'ok', 'fail');
    tick();
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'error' }));
  }));

  it('should show error if updateUserPremiumStatus throws error', fakeAsync(() => {
    spyOn(console, 'error');
    spyOn(Swal, 'fire');
    
    // Mock del servicio para que lance error
    authServiceSpy.updateUserPremiumStatus.and.returnValue(throwError(() => new Error('fail')));
    
    // Configurar usuario actual
    component.currentUser = { ...mockUser };
    
    // Llamar al método privado
    (component as any).updatePremiumStatus(
      mockUser.email,
      true,
      'Success message',
      'Error message'
    );
    
    tick();
    
    // Verificar que se muestra el mensaje de error
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      text: 'Error message'
    }));
  }));

});
