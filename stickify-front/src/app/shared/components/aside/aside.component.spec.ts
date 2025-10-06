import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsideComponent } from './aside.component';
import { RatingService } from '../../../services/rating.service';
import { of, Subscription } from 'rxjs';
import { RatedSong } from '../../../shared/interfaces/rated-song.interface';

const mockRatedSongs: RatedSong[] = [
  {
    song: {
      trackId: 1,
      artistName: 'Artist 1',
      trackName: 'Song 1',
      primaryGenreName: 'Pop',
      collectionName: 'Album 1',
      artworkUrl100: '',
      releaseDate: '2023-01-01',
      isUserUpload: false,
      collectionId: 10,
      artistId: 100
    },
    averageRating: 4.5
  },
  {
    song: {
      trackId: 2,
      artistName: 'Artist 2',
      trackName: 'Song 2',
      primaryGenreName: 'Rock',
      collectionName: 'Album 2',
      artworkUrl100: '',
      releaseDate: '2023-01-02',
      isUserUpload: false,
      collectionId: 20,
      artistId: 200
    },
    averageRating: 3
  }
];

describe('AsideComponent', () => {
  let component: AsideComponent;
  let fixture: ComponentFixture<AsideComponent>;
  let ratingServiceSpy: jasmine.SpyObj<RatingService>;

  beforeEach(async () => {
    ratingServiceSpy = jasmine.createSpyObj('RatingService', [], {
      topRatedSongs$: of(mockRatedSongs)
    });
    await TestBed.configureTestingModule({
      imports: [AsideComponent],
      providers: [
        { provide: RatingService, useValue: ratingServiceSpy }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(AsideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //Assert
    expect(component).toBeTruthy();
  });

  it('should subscribe and set topRatedSongs on init', () => {
    //Assert
    expect(component.topRatedSongs).toEqual(mockRatedSongs);
  });

  it('should unsubscribe on destroy', () => {
    // Simulate a subscription
    //Arrange
    const fakeSub = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    (component as any).topRatedSubscription = fakeSub;
    //Act
    component.ngOnDestroy();

    //Assert
    expect(fakeSub.unsubscribe).toHaveBeenCalled();
  });

  it('should return correct star array for full, half, and empty stars', () => {
  // Arrange
  const rating1 = 4.5;

  // Act
  const result1 = component.getStarArray(rating1);

  // Assert
  expect(result1).toEqual(['★', '★', '★', '★', '½']);

  // Arrange
  const rating2 = 3;

  // Act
  const result2 = component.getStarArray(rating2);

  // Assert
  expect(result2).toEqual(['★', '★', '★', '☆', '☆']);

  // Arrange
  const rating3 = 0;

  // Act
  const result3 = component.getStarArray(rating3);

  // Assert
  expect(result3).toEqual(['☆', '☆', '☆', '☆', '☆']);
});

});
