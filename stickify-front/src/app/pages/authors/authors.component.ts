import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { MusicService } from '../../services/music.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-authors',
  standalone: true,
  imports: [NavComponent, CommonModule],
  templateUrl: './authors.component.html',
  styleUrl: './authors.component.css'
})
export class AuthorsComponent implements OnInit, OnDestroy {
  authors: string[] = [];
  private artistsSubscription: Subscription | undefined;
  private musicService = inject(MusicService);

  // Initialize component by subscribing to artists data
  ngOnInit(): void {
    this.artistsSubscription = this.musicService.artists$.subscribe(artists => {
      this.authors = [...artists];
    });
  }
  // Clean up 
  ngOnDestroy(): void {
    if (this.artistsSubscription) {
      this.artistsSubscription.unsubscribe();
    }
  }
}