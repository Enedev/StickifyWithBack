import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { MusicService } from '../../services/music.service';
import { RatingService } from '../../services/rating.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

//Mock
const MOCK_SONGS = [
  { trackId: 1, releaseDate: '2023-01-01', primaryGenreName: 'Pop', artistName: 'Artist A', trackName: 'Song 1', collectionName: 'Album A', artworkUrl100: 'http://example.com/art1.jpg', isUserUpload: false, collectionId: 101, artistId: 201 },
  { trackId: 2, releaseDate: '2022-01-01', primaryGenreName: 'Rock', artistName: 'Artist B', trackName: 'Song 2', collectionName: 'Album B', artworkUrl100: 'http://example.com/art2.jpg', isUserUpload: false, collectionId: 102, artistId: 202 },
  { trackId: 3, releaseDate: '2023-01-01', primaryGenreName: 'Rock', artistName: 'Artist C', trackName: 'Song 3', collectionName: 'Album C', artworkUrl100: 'http://example.com/art3.jpg', isUserUpload: false, collectionId: 103, artistId: 203 },
  { trackId: 4, releaseDate: '2021-01-01', primaryGenreName: 'Pop', artistName: 'Artist A', trackName: 'Song 4', collectionName: 'Album D', artworkUrl100: 'http://example.com/art4.jpg', isUserUpload: false, collectionId: 104, artistId: 204 }
];

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let musicService: MusicService;

  beforeEach(async () => {
    // Mocks de servicios
    const musicServiceMock = {
      songs$: of(MOCK_SONGS),
      addSong: () => of(MOCK_SONGS[0]),
      generateUniqueId: () => 999,
    };

    const ratingServiceMock = {
      userRatings$: of({}),
      topRatedSongs$: of([]), 
      updateTopRatedSongs: () => { },
      getAverageRatingForSong: (trackId: number) => 4.5,
      rateSong: () => Promise.resolve(),
    };

    const commentServiceMock = {
      commentsMap$: of({}),
      getCommentsForTrack: () => [{ user: 'test', text: 'comment', date: Date.now(), trackId: 1 }],
      postComment: () => Promise.resolve(),
    };

    const authServiceMock = {
      currentUser: { username: 'testuser' }
    };

    await TestBed.configureTestingModule({
      imports: [
        HomeComponent,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: MusicService, useValue: musicServiceMock },
        { provide: RatingService, useValue: ratingServiceMock },
        { provide: CommentService, useValue: commentServiceMock },
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    // Arrange (configuración e inicialización común para todos los tests)
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    musicService = TestBed.inject(MusicService);

    fixture.detectChanges();
  });

  it('should create', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  it('should filter songs by year', () => {
    // Arrange
    component.allSongs = [...MOCK_SONGS];
    component.filteredSongs = [...MOCK_SONGS];
    component.totalFilteredSongs = MOCK_SONGS.length;
    const filters = { year: '2023', genres: [], artists: [] };

    // Act
    component.onFilterChange(filters);

    const expectedSongs = MOCK_SONGS.filter(song =>
      new Date(song.releaseDate).getFullYear().toString() === filters.year
    );

    // Assert
    expect(component.filteredSongs.length).toBe(expectedSongs.length);
    expect(component.filteredSongs).toEqual(expectedSongs);
    expect(component.currentPage).toBe(1);
    expect(component.totalFilteredSongs).toBe(expectedSongs.length);
  });

  it('should filter songs by genre and artist', () => {
    // Arrange
    component.allSongs = [...MOCK_SONGS];
    const filters = { year: '', genres: ['Pop'], artists: ['Artist A'] };

    // Act
    component.onFilterChange(filters);
    const expectedSongs = MOCK_SONGS.filter(song =>
      filters.genres.includes(song.primaryGenreName) && filters.artists.includes(song.artistName)
    );

    // Assert
    expect(component.filteredSongs).toEqual(expectedSongs);
  });

  it('should search songs by term', () => {
    // Arrange
    component.allSongs = [...MOCK_SONGS];

    // Act
    component.onSearchTermChanged('Song 1');

    // Assert
    expect(component.filteredSongs.length).toBe(1);
    expect(component.filteredSongs[0].trackName).toBe('Song 1');
  });

  it('should open and close modal', () => {
    // Arrange
    const song = MOCK_SONGS[0];

    // Act
    component.openModal(song);

    // Assert
    expect(component.selectedSong).toBe(song);
    expect(component.showModal).toBeTrue();

    // Act
    component.closeModal();

    // Assert
    expect(component.selectedSong).toBeNull();
    expect(component.showModal).toBeFalse();
  });

  it('should paginate songs', () => {
    // Arrange
    component.filteredSongs = [...MOCK_SONGS];
    component.itemsPerPage = 2;
    component.currentPage = 2;

    // Act
    const paginated = component.getPaginatedSongs();

    // Assert
    expect(paginated.length).toBe(2);
    expect(paginated[0]).toEqual(MOCK_SONGS[2]);
  });

  it('should change page', () => {
    // Arrange
    component.currentPage = 1;
    
    // Act
    component.onPageChange(3);

    // Assert
    expect(component.currentPage).toBe(3);
  });

  it('should get average rating for song', () => {

    // Act
    const avg = component.getAverageRatingForSong(1);

     // Assert
    expect(avg).toBe(4.5);
  });

  it('should call addNewSong', () => {
    // Arrange
    const musicService = TestBed.inject(MusicService);
    spyOn(musicService, 'addSong').and.returnValue(of({
      trackId: 999,
      artistName: 'Artist X',
      trackName: 'Title X',
      primaryGenreName: 'Pop',
      previewUrl: '',
      artworkUrl100: '',
      collectionName: 'Album X',
      releaseDate: '2025-01-01',
      trackPrice: 0,
      currency: 'USD',
      isUserUpload: false,
      collectionId: 0,
      artistId: 0,
    }));
    spyOn(musicService, 'generateUniqueId').and.returnValue(999);
    const newSongData = { artist: 'Artist X', title: 'Title X', genre: 'Pop', album: 'Album X', imageUrl: '', releaseDate: '2025-01-01' };

    // Act
    component.addNewSong(newSongData);

    // Assert
    expect(musicService.addSong).toHaveBeenCalled();
  });

  it('should save comments to localStorage', () => {
    // Arrange
    spyOn(localStorage, 'setItem');
    component.songComments = { 1: [{ user: 'test', text: 'comment', date: Date.now(), trackId: 1 }] };
    
    // Act
    (component as any).saveComments();

    // Assert
    expect(localStorage.setItem).toHaveBeenCalledWith('songComments', jasmine.any(String));
  });

  it('should get comments for selected song', () => {
    // Arrange
    const commentService = TestBed.inject(CommentService);
    spyOn(commentService, 'getCommentsForTrack').and.returnValue([{ user: 'test', text: 'comment', date: Date.now(), trackId: 1 }]);
    component.selectedSong = MOCK_SONGS[0];

     // Act
    const comments = component.getCommentsForSelectedSong();

    // Assert
    expect(comments.length).toBe(1);
  });

  it('should call onRateSong if selectedSong and currentUser', async () => {
    // Arrange
    const ratingService = TestBed.inject(RatingService);
    spyOn(ratingService, 'rateSong').and.returnValue(Promise.resolve());
    component.selectedSong = MOCK_SONGS[0];
    component.currentUser = 'testuser';

    // Act
    await component.onRateSong(5);

    // Assert
    expect(ratingService.rateSong).toHaveBeenCalledWith('testuser', MOCK_SONGS[0].trackId, 5);
  });

  it('should call onSubmitComment if selectedSong, commentText and currentUser', async () => {
    // Arrange
    const commentService = TestBed.inject(CommentService);
    spyOn(commentService, 'postComment').and.returnValue(Promise.resolve());
    component.selectedSong = MOCK_SONGS[0];
    component.currentUser = 'testuser';

    // Act
    await component.onSubmitComment('Nuevo comentario');

    // Assert
    expect(commentService.postComment).toHaveBeenCalledWith(MOCK_SONGS[0].trackId, jasmine.objectContaining({ text: 'Nuevo comentario' }));
  });
});