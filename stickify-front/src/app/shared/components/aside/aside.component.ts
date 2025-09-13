import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingService } from '../../../services/rating.service';
import { Subscription } from 'rxjs';
import { RatedSong } from '../../../shared/interfaces/rated-song.interface';

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './aside.component.html',
  styleUrls: ['./aside.component.css']
})
export class AsideComponent implements OnInit, OnDestroy {
  topRatedSongs: RatedSong[] = [];
  private topRatedSubscription: Subscription | null = null;

  constructor(private readonly ratingService: RatingService) {}

  ngOnInit(): void {
    this.subscribeToTopRatedSongs();
  }

  ngOnDestroy(): void {
    this.topRatedSubscription?.unsubscribe();
  }
  // Subscribe to top rated songs updates
  private subscribeToTopRatedSongs(): void {
    this.topRatedSubscription = this.ratingService.topRatedSongs$.subscribe(ratedSongs => {
      this.topRatedSongs = ratedSongs;
    });
  }
  // Convert numeric rating to star display array
  getStarArray(averageRating: number): string[] {
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    const stars: string[] = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push('★');
    }

    if (hasHalfStar) {
      stars.push('½');
    }

    for (let i = 0; i < emptyStars; i++) {
      stars.push('☆');
    }

    return stars;
  }
}