import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SongCardComponent } from './song-card.component';
import { Song } from '../../../shared/interfaces/song.interface';
import { By } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { EventEmitter } from '@angular/core';

const mockSong: Song = {
  trackId: 1,
  trackName: 'Test Song',
  artistName: 'Test Artist',
  primaryGenreName: 'Pop',
  collectionName: 'Test Album',
  artworkUrl100: 'cover.jpg',
  releaseDate: '2023-01-01',
  collectionId: 101,
  artistId: 201,
  isUserUpload: false
};

describe('SongCardComponent', () => {
  let component: SongCardComponent;
  let fixture: ComponentFixture<SongCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SongCardComponent],
      providers: [DomSanitizer]
    }).compileComponents();
    fixture = TestBed.createComponent(SongCardComponent);
    component = fixture.componentInstance;
    component.song = mockSong;
    fixture.detectChanges();
  });

  it('should create', () => {
    //Assert
    expect(component).toBeTruthy();
  });

  it('should return correct stars for integer rating', () => {
    //Arrange
    component.averageRating = 3;
    //Act
    const result = component.getStarArray()
    //Assert
    expect(result).toEqual(['★', '★', '★', '☆', '☆']);
  });

  it('should return correct stars for half rating', () => {
    //Arrange
    component.averageRating = 2.5;
    //Act
    const result = component.getStarArray()
    //Assert
    expect(result).toEqual(['★', '★', '½', '☆', '☆']);
  });

  it('should return all empty stars for zero rating', () => {
    //Arrange
    component.averageRating = 0;
    //Act
    const result = component.getStarArray()
    //Assert
    expect(result).toEqual(['☆', '☆', '☆', '☆', '☆']);
  });

  it('should emit songSelected event on click', () => {
    //Arrange
    spyOn(component.songSelected, 'emit');
    //Act
    component.onSongClick();
    //Assert
    expect(component.songSelected.emit).toHaveBeenCalledWith(mockSong);
  });
});
