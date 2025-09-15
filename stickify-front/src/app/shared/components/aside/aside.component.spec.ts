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
    expect(component).toBeTruthy();
  });

  it('should subscribe and set topRatedSongs on init', () => {
    expect(component.topRatedSongs).toEqual(mockRatedSongs);
  });

  it('should unsubscribe on destroy', () => {
    // Simulate a subscription
    const fakeSub = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    (component as any).topRatedSubscription = fakeSub;
    component.ngOnDestroy();
    expect(fakeSub.unsubscribe).toHaveBeenCalled();
  });

  it('should return correct star array for full, half, and empty stars', () => {
    expect(component.getStarArray(4.5)).toEqual(['★', '★', '★', '★', '½']);
    expect(component.getStarArray(3)).toEqual(['★', '★', '★', '☆', '☆']);
    expect(component.getStarArray(0)).toEqual(['☆', '☆', '☆', '☆', '☆']);
  });
});
