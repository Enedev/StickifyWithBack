import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Song } from '../../../shared/interfaces/song.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-song-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './song-card.component.html',
  styleUrls: ['./song-card.component.css']
})
export class SongCardComponent {
  @Input() song!: Song;
  @Input() averageRating: number = 0;
  @Output() songSelected = new EventEmitter<Song>();
  // Convert numeric rating to visual star representation
  getStarArray(): string[] {
    const fullStars = Math.floor(this.averageRating);
    const hasHalfStar = this.averageRating % 1 !== 0;
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

  onSongClick(): void {
    this.songSelected.emit(this.song);
  }
}