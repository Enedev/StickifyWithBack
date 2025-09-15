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
    expect(component).toBeTruthy();
  });

  it('should return correct stars for integer rating', () => {
    component.averageRating = 3;
    expect(component.getStarArray()).toEqual(['★', '★', '★', '☆', '☆']);
  });

  it('should return correct stars for half rating', () => {
    component.averageRating = 2.5;
    expect(component.getStarArray()).toEqual(['★', '★', '½', '☆', '☆']);
  });

  it('should return all empty stars for zero rating', () => {
    component.averageRating = 0;
    expect(component.getStarArray()).toEqual(['☆', '☆', '☆', '☆', '☆']);
  });

  it('should emit songSelected event on click', () => {
    spyOn(component.songSelected, 'emit');
    component.onSongClick();
    expect(component.songSelected.emit).toHaveBeenCalledWith(mockSong);
  });
});
