import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { MusicService } from '../../services/music.service';
import { RatingService } from '../../services/rating.service';
import { CommentService } from '../../services/comment.service';
import { AuthService } from '../../services/auth.service';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

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

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    musicService = TestBed.inject(MusicService);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should filter songs by year', () => {
    component.allSongs = [...MOCK_SONGS];
    component.filteredSongs = [...MOCK_SONGS];
    component.totalFilteredSongs = MOCK_SONGS.length;

    const filters = { year: '2023', genres: [], artists: [] };
    component.onFilterChange(filters);

    const expectedSongs = MOCK_SONGS.filter(song =>
      new Date(song.releaseDate).getFullYear().toString() === filters.year
    );

    expect(component.filteredSongs.length).toBe(expectedSongs.length);
    expect(component.filteredSongs).toEqual(expectedSongs);
    expect(component.currentPage).toBe(1);
    expect(component.totalFilteredSongs).toBe(expectedSongs.length);
  });

  it('should filter songs by genre and artist', () => {
    component.allSongs = [...MOCK_SONGS];
    const filters = { year: '', genres: ['Pop'], artists: ['Artist A'] };
    component.onFilterChange(filters);
    const expectedSongs = MOCK_SONGS.filter(song =>
      filters.genres.includes(song.primaryGenreName) && filters.artists.includes(song.artistName)
    );
    expect(component.filteredSongs).toEqual(expectedSongs);
  });

  it('should search songs by term', () => {
    component.allSongs = [...MOCK_SONGS];
    component.onSearchTermChanged('Song 1');
    expect(component.filteredSongs.length).toBe(1);
    expect(component.filteredSongs[0].trackName).toBe('Song 1');
  });

  it('should open and close modal', () => {
    const song = MOCK_SONGS[0];
    component.openModal(song);
    expect(component.selectedSong).toBe(song);
    expect(component.showModal).toBeTrue();
    component.closeModal();
    expect(component.selectedSong).toBeNull();
    expect(component.showModal).toBeFalse();
  });

  it('should paginate songs', () => {
    component.filteredSongs = [...MOCK_SONGS];
    component.itemsPerPage = 2;
    component.currentPage = 2;
    const paginated = component.getPaginatedSongs();
    expect(paginated.length).toBe(2);
    expect(paginated[0]).toEqual(MOCK_SONGS[2]);
  });

  it('should change page', () => {
    component.currentPage = 1;
    component.onPageChange(3);
    expect(component.currentPage).toBe(3);
  });

  it('should get average rating for song', () => {
    const avg = component.getAverageRatingForSong(1);
    expect(avg).toBe(4.5);
  });

  it('should call addNewSong', () => {
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
    component.addNewSong(newSongData);
    expect(musicService.addSong).toHaveBeenCalled();
  });

  it('should save comments to localStorage', () => {
    spyOn(localStorage, 'setItem');
    component.songComments = { 1: [{ user: 'test', text: 'comment', date: Date.now(), trackId: 1 }] };
    (component as any).saveComments();
    expect(localStorage.setItem).toHaveBeenCalledWith('songComments', jasmine.any(String));
  });

  it('should get comments for selected song', () => {
    const commentService = TestBed.inject(CommentService);
    spyOn(commentService, 'getCommentsForTrack').and.returnValue([{ user: 'test', text: 'comment', date: Date.now(), trackId: 1 }]);
    component.selectedSong = MOCK_SONGS[0];
    const comments = component.getCommentsForSelectedSong();
    expect(comments.length).toBe(1);
  });

  it('should call onRateSong if selectedSong and currentUser', async () => {
    const ratingService = TestBed.inject(RatingService);
    spyOn(ratingService, 'rateSong').and.returnValue(Promise.resolve());
    component.selectedSong = MOCK_SONGS[0];
    component.currentUser = 'testuser';
    await component.onRateSong(5);
    expect(ratingService.rateSong).toHaveBeenCalledWith('testuser', MOCK_SONGS[0].trackId, 5);
  });

  it('should call onSubmitComment if selectedSong, commentText and currentUser', async () => {
    const commentService = TestBed.inject(CommentService);
    spyOn(commentService, 'postComment').and.returnValue(Promise.resolve());
    component.selectedSong = MOCK_SONGS[0];
    component.currentUser = 'testuser';
    await component.onSubmitComment('Nuevo comentario');
    expect(commentService.postComment).toHaveBeenCalledWith(MOCK_SONGS[0].trackId, jasmine.objectContaining({ text: 'Nuevo comentario' }));
  });
});