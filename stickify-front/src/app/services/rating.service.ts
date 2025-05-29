import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from '../shared/interfaces/song.interface';
import { SongRatings } from '../shared/interfaces/song-ratings.interface';
import { RatedSong } from '../shared/interfaces/rated-song.interface';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private userRatingsSubject = new BehaviorSubject<{[trackId: number]: SongRatings}>({});
  private topRatedSongsSubject = new BehaviorSubject<RatedSong[]>([]);
  
  public userRatings$ = this.userRatingsSubject.asObservable();
  public topRatedSongs$ = this.topRatedSongsSubject.asObservable();

  get currentRatings() {
    return this.userRatingsSubject.value;
  }

  constructor() {
    this.loadRatings();
  }

  private loadRatings(): void {
    const storedRatings = localStorage.getItem('songRatings');
    if (storedRatings) {
      const ratings = JSON.parse(storedRatings);
      this.userRatingsSubject.next(ratings);
    }
  }
  
  saveRatings(ratings: {[trackId: number]: SongRatings}): void {
    this.userRatingsSubject.next(ratings);
    localStorage.setItem('songRatings', JSON.stringify(ratings));
  }
  
  getAverageRatingForSong(trackId: number): number {
    const ratings = this.currentRatings[trackId];
    if (ratings) {
      const ratingValues = Object.values(ratings);
      if (ratingValues.length > 0) {
        const sum = ratingValues.reduce((acc, curr) => acc + curr, 0);
        return sum / ratingValues.length;
      }
    }
    return 0;
  }
  // Update top rated songs list
  updateTopRatedSongs(allSongs: Song[]): void {
    const ratedSongs = Object.keys(this.currentRatings)
      .map(trackIdStr => {
        const trackId = parseInt(trackIdStr, 10);
        const song = allSongs.find(s => s.trackId === trackId);
        const averageRating = this.getAverageRatingForSong(trackId);
        return song && averageRating > 0 ? { song, averageRating } : null;
      })
      .filter((ratedSong): ratedSong is RatedSong => ratedSong !== null)
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 5); // Get top 5 rated songs

    this.topRatedSongsSubject.next(ratedSongs);
  }
}