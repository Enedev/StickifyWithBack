import { Component, OnInit, inject } from '@angular/core';
import { MusicService } from '../../services/music.service';
import { Song } from '../../shared/interfaces/song.interface';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { AsideComponent } from '../../shared/components/aside/aside.component';
import { CommonModule } from '@angular/common';
import { Comment } from '../../shared/interfaces/comment.interface';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { SongModalComponent } from '../../shared/components/song-modal/song-modal.component';
import { SongCardComponent } from '../../shared/components/song-card/song-card.component';
import { RatingService } from '../../services/rating.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  imports: [
    HeaderComponent,
    NavComponent,
    AsideComponent,
    CommonModule,
    FormsModule,
    SongModalComponent,
    SongCardComponent,
    PaginationComponent
  ],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  allSongs: Song[] = [];
  filteredSongs: Song[] = [];
  currentSearchTerm: string = 'music';
  selectedSong: Song | null = null;
  showModal: boolean = false;
  songComments: { [trackId: number]: Comment[] } = {};
  currentUser: string | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 20;
  totalFilteredSongs: number = 0;

  constructor(
    private musicService: MusicService,
    private ratingService: RatingService
  ) {}
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadInitialData();
    this.getCurrentUser();
    this.loadComments();
  }

  // Load initial data from MusicService
  private loadInitialData(): void {
    this.musicService.songs$.subscribe({
      next: (songs) => {
        this.allSongs = songs;
        this.filteredSongs = [...this.allSongs];
        this.totalFilteredSongs = this.filteredSongs.length; // Set total count
        this.ratingService.updateTopRatedSongs(this.allSongs);
      },
      error: (err) => console.error('Error loading songs:', err)
    });
  }

  private getCurrentUser(): void {
    this.currentUser = this.authService.currentUser?.username || this.authService.currentUser?.email || null;
  }

  private loadComments(): void {
    const storedComments = localStorage.getItem('songComments');
    if (storedComments) {
      this.songComments = JSON.parse(storedComments);
    }
  }

  private saveComments(): void {
    localStorage.setItem('songComments', JSON.stringify(this.songComments));
  }

  // Handle filter changes
  onFilterChange(filters: any): void {
    let filtered = this.allSongs.filter(song => {
      const yearMatch = !filters.year ||
        new Date(song.releaseDate).getFullYear().toString() === filters.year;
      const genreMatch = filters.genres.length === 0 ||
        filters.genres.includes(song.primaryGenreName);
      const artistMatch = filters.artists.length === 0 ||
        filters.artists.includes(song.artistName);

      return yearMatch && genreMatch && artistMatch;
    });

    this.filteredSongs = filtered;
    this.currentPage = 1;  // Reset to first page on filter change
    this.totalFilteredSongs = this.filteredSongs.length;
  }

  onSearchTermChanged(searchTerm: string): void {
    const lowerSearchTerm = searchTerm.toLowerCase();
    this.filteredSongs = this.allSongs.filter(song =>
      song.trackName.toLowerCase().includes(lowerSearchTerm) ||
      song.artistName.toLowerCase().includes(lowerSearchTerm)
    );
    this.currentPage = 1;
    this.totalFilteredSongs = this.filteredSongs.length;
  }

  getAverageRatingForSong(trackId: number): number {
    return this.ratingService.getAverageRatingForSong(trackId);
  }

  openModal(song: Song): void {
    this.selectedSong = song;
    this.showModal = true;
  }

  closeModal(): void {
    this.selectedSong = null;
    this.showModal = false;
  }
  // Handle song rating
  onRateSong(rating: number): void {
    if (this.selectedSong && this.currentUser) {
      const currentRatings = {...this.ratingService.currentRatings};
      // If there are no ratings for this song yet, initialize an empty object
      if (!currentRatings[this.selectedSong.trackId]) {
        currentRatings[this.selectedSong.trackId] = {};
      }
      // Store the user's rating for the song
      currentRatings[this.selectedSong.trackId][this.currentUser] = rating;
      this.ratingService.saveRatings(currentRatings);
      this.ratingService.updateTopRatedSongs(this.allSongs);
    }
  }
  // Handle comment submission
  onSubmitComment(commentText: string): void {
    if (this.selectedSong && commentText.trim() && this.currentUser) {
      const newComment: Comment = {
        user: this.currentUser,
        text: commentText.trim(),
        date: Date.now()
      };

      if (!this.songComments[this.selectedSong.trackId]) {
        this.songComments[this.selectedSong.trackId] = [];
      }

      this.songComments[this.selectedSong.trackId].push(newComment);
      this.saveComments(); // Persist comments to localStorage
    }
  }

  getCommentsForSelectedSong(): Comment[] {
    return this.selectedSong ?
      this.songComments[this.selectedSong.trackId] || [] : [];
  }

  getPaginatedSongs(): Song[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredSongs.slice(startIndex, endIndex);
  }

  onPageChange(newPage: number): void {
    this.currentPage = newPage;
  }
}