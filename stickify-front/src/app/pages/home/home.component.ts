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
    this.loadSongs();
    this.getCurrentUser();
    this.loadComments();
  }

  private loadSongs(): void {
    this.musicService.songs$.subscribe({
      next: (songs) => {
        this.allSongs = songs;
        this.filteredSongs = [...this.allSongs];
        this.totalFilteredSongs = this.filteredSongs.length;
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
    this.currentPage = 1;
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

  async onRateSong(rating: number): Promise<void> {
    if (this.selectedSong && this.currentUser) {
      await this.ratingService.rateSong(this.currentUser, this.selectedSong.trackId, rating);
      this.ratingService.updateTopRatedSongs(this.allSongs);
    }
  }

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
      this.saveComments();
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

  addNewSong(newSongData: any): void {
    const newSong: Song = {
      trackId: this.musicService.generateUniqueId(),
      artistName: newSongData.artist,
      trackName: newSongData.title,
      primaryGenreName: newSongData.genre,
      collectionName: newSongData.album,
      artworkUrl100: newSongData.imageUrl || 'assets/default-album.png',
      releaseDate: newSongData.releaseDate,
      isUserUpload: true,
      collectionId: this.musicService.generateUniqueId(),
      artistId: this.musicService.generateUniqueId()
    };

    this.musicService.addSong(newSong).subscribe({
      next: () => console.log('Canción añadida con éxito'),
      error: (err) => console.error('Error al añadir canción:', err)
    });
  }
}