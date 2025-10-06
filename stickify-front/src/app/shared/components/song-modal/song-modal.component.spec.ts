import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SongModalComponent } from './song-modal.component';
import { RatingService } from '../../../services/rating.service';
import { AuthService } from '../../../services/auth.service';
import { Song } from '../../../shared/interfaces/song.interface';
import { Comment } from '../../../shared/interfaces/comment.interface';
import { EventEmitter } from '@angular/core';
//Mock
const mockSong: Song = {
  trackId: 1,
  artistName: 'Test Artist',
  trackName: 'Test Song',
  primaryGenreName: 'Pop',
  collectionName: 'Test Album',
  artworkUrl100: '',
  releaseDate: '2023-01-01',
  isUserUpload: false,
  collectionId: 10,
  artistId: 100
};

const mockComments: Comment[] = [
  { user: 'user1', text: 'Nice song!', date: 1680000000000, trackId: 1 },
  { user: 'user2', text: 'Love it!', date: 1680000000001, trackId: 1 }
];

describe('SongModalComponent', () => {
  let component: SongModalComponent;
  let fixture: ComponentFixture<SongModalComponent>;
  let ratingServiceSpy: jasmine.SpyObj<RatingService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    ratingServiceSpy = jasmine.createSpyObj('RatingService', [], {
      currentRatings: { '1': { 'testuser': 4 } }
    });
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUser: { username: 'testuser', email: 'testuser@example.com' }
    });

    await TestBed.configureTestingModule({
      imports: [SongModalComponent],
      providers: [
        { provide: RatingService, useValue: ratingServiceSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SongModalComponent);
    component = fixture.componentInstance;
    component.song = mockSong;
    component.comments = mockComments;
    component.currentUser = 'testuser';
    fixture.detectChanges();
  });

  it('should create', () => {
    //Assert
    expect(component).toBeTruthy();
  });

  it('should set and get song input', () => {
    //Arrange
    component.song = mockSong;
    //Assert
    expect(component.song).toEqual(mockSong);
  });

  it('should update userRating on song change', () => {
    //Arrange
    component.song = mockSong;
    //Act
    const rating = component.userRating
    //Assert
    expect(rating).toBe(4);
  });

  it('should update userRating to 0 if no rating', () => {
    //Arrange
    component.currentUser = 'otheruser';
    component.song = mockSong;
    //Act
    const rating = component.userRating
    //Assert
    expect(rating).toBe(0);
  });

  it('should emit rateSong on onRate', () => {
    //Arrange
    spyOn(component.rateSong, 'emit');
    //Act
    component.onRate(5);
    //Assert
    expect(component.userRating).toBe(5);
    //Assert
    expect(component.rateSong.emit).toHaveBeenCalledWith(5);
  });

  it('should emit submitComment on onSubmitComment', () => {
    //Arrange
    spyOn(component.submitComment, 'emit');
    component.newCommentText = 'Great!';
    //Act
    component.onSubmitComment();
    //Assert
    expect(component.submitComment.emit).toHaveBeenCalledWith('Great!');
    //Assert
    expect(component.newCommentText).toBe('');
  });

  it('should not emit submitComment if comment is empty', () => {
    //Arrange
    spyOn(component.submitComment, 'emit');
    component.newCommentText = '   ';
    //Act
    component.onSubmitComment();
    //Assert
    expect(component.submitComment.emit).not.toHaveBeenCalled();
  });

  it('should emit closeModal on onClose', () => {
    //Arrange
    spyOn(component.closeModal, 'emit');
    //Act
    component.onClose();
    //Assert
    expect(component.closeModal.emit).toHaveBeenCalled();
  });

  it('should update userRating on ngOnChanges when currentUser changes', () => {
    //Arrange
    component.song = mockSong;
    component.currentUser = 'testuser';
    //Act
    component.ngOnChanges({ currentUser: { currentValue: 'testuser', previousValue: 'other', firstChange: false, isFirstChange: () => false } });
    //Assert
    expect(component.userRating).toBe(4);
  });

  it('should set currentUser on ngOnInit', () => {
    //Arrange
    component.currentUser = null;
    //Act
    component.ngOnInit();
    //Assert
    expect(typeof component.currentUser).toBe('string');
  });
});
