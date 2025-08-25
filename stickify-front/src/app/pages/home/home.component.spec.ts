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
    };

    const ratingServiceMock = {
      userRatings$: of({}),
      topRatedSongs$: of([]), 
      updateTopRatedSongs: () => { },
      getAverageRatingForSong: (trackId: number) => 4.5 
    };

    const commentServiceMock = {
      commentsMap$: of({}),
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

});