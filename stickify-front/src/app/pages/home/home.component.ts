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
import { CommentService } from '../../services/comment.service';

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
    private readonly musicService: MusicService,
    private readonly ratingService: RatingService,
    private readonly commentService: CommentService
  ) {}
  private readonly authService = inject(AuthService);

  ngOnInit(): void {
    this.loadSongs();
    this.getCurrentUser();
    this.commentService.commentsMap$.subscribe(map => {
      this.songComments = map;
    });

    this.ratingService.userRatings$.subscribe(() => {
      if (this.allSongs.length > 0) {
        this.ratingService.updateTopRatedSongs(this.allSongs);
      }
    });
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

  /*private loadComments(): void {
    const storedComments = localStorage.getItem('songComments');
    if (storedComments) {
      this.songComments = JSON.parse(storedComments);
    }
  }*/

  private saveComments(): void {
    localStorage.setItem('songComments', JSON.stringify(this.songComments));
  }

  onFilterChange(filters: any): void {
    console.log('[Cualitativa] Filtros recibidos:', filters);

    const startTime = performance.now(); // Cuantitativa: medir duración

    let filtered = this.allSongs.filter(song => {
      const yearMatch = !filters.year ||
        new Date(song.releaseDate).getFullYear().toString() === filters.year;
      const genreMatch = filters.genres.length === 0 ||
        filters.genres.includes(song.primaryGenreName);
      const artistMatch = filters.artists.length === 0 ||
        filters.artists.includes(song.artistName);

      return yearMatch && genreMatch && artistMatch;
    });

    const duration = performance.now() - startTime;
    console.log(`[Cuantitativa] Tiempo de filtrado: ${duration.toFixed(2)} ms`);
    console.log(`[Cuantitativa] Total canciones filtradas: ${filtered.length}`);

    // Cualitativa: análisis de filtros activos
    if (filters.year) console.log(`[Cualitativa] Filtro por año activo: ${filters.year}`);
    if (filters.genres.length > 0) console.log(`[Cualitativa] Filtro por géneros: ${filters.genres.join(', ')}`);
    if (filters.artists.length > 0) console.log(`[Cualitativa] Filtro por artistas: ${filters.artists.join(', ')}`);

    this.filteredSongs = filtered;
    this.currentPage = 1;
    this.totalFilteredSongs = this.filteredSongs.length;

    console.log('[Cualitativa] Página reiniciada a 1');
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
    }
  }

  async onSubmitComment(commentText: string): Promise<void> {
    if (this.selectedSong && commentText.trim() && this.currentUser) {
      const newComment: Comment = {
        user: this.currentUser,
        text: commentText.trim(),
        date: Date.now(),
        trackId: this.selectedSong.trackId
      };

      try {
        await this.commentService.postComment(this.selectedSong.trackId, newComment);
      } catch (err) {
        console.error('Error al enviar comentario:', err);
      }
    }
  }


  getCommentsForSelectedSong(): Comment[] {
    return this.selectedSong
      ? this.commentService.getCommentsForTrack(this.selectedSong.trackId)
      : [];
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