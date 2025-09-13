import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Song } from '../shared/interfaces/song.interface';
import { RatedSong } from '../shared/interfaces/rated-song.interface';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RatingService {
  private readonly userRatingsSubject = new BehaviorSubject<{ [trackId: number]: { [userId: string]: number } }>({});
  private readonly topRatedSongsSubject = new BehaviorSubject<RatedSong[]>([]);

  public userRatings$ = this.userRatingsSubject.asObservable();
  public topRatedSongs$ = this.topRatedSongsSubject.asObservable();

  private readonly apiUrl = environment.backendUrl; // ej: http://localhost:3000

  constructor(private readonly http: HttpClient) {
    this.loadRatings();
  }

  get currentRatings() {
    return this.userRatingsSubject.value;
  }

  private loadRatings(): void {
    this.http.get<any[]>(`${this.apiUrl}/ratings`).subscribe({
      next: (data) => {
        const ratingsMap: { [trackId: number]: { [userId: string]: number } } = {};
        data.forEach(rating => {
          if (!ratingsMap[rating.trackId]) {
            ratingsMap[rating.trackId] = {};
          }
          ratingsMap[rating.trackId][rating.userId] = rating.rating;
        });
        this.userRatingsSubject.next(ratingsMap);
      },
      error: (err) => console.error('Error loading ratings:', err)
    });
  }

  rateSong(userId: string, trackId: number, rating: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post(`${this.apiUrl}/ratings`, { userId, trackId, rating }).subscribe({
        next: () => {
          this.loadRatings();
          resolve();
        },
        error: (err) => {
          console.error('Error rating song:', err);
          reject(err);
        }
      });
    });
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
      .slice(0, 5);

    this.topRatedSongsSubject.next(ratedSongs);
  }
}
