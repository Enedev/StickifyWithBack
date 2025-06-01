// src/app/services/comment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Comment } from '../shared/interfaces/comment.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private commentsMapSubject = new BehaviorSubject<{ [trackId: number]: Comment[] }>({});
  public commentsMap$ = this.commentsMapSubject.asObservable();

  private apiUrl = environment.backendUrl; // e.g. http://localhost:3000

  constructor(private http: HttpClient) {
    this.loadComments();
  }

  get currentCommentsMap() {
    return this.commentsMapSubject.value;
  }

  private loadComments(): void {
    this.http.get<Comment[]>(`${this.apiUrl}/comments`).subscribe({
      next: (comments) => {
        const map: { [trackId: number]: Comment[] } = {};
        for (const comment of comments) {
          const trackId = (comment as any).trackId;
          if (!map[trackId]) map[trackId] = [];
          map[trackId].push(comment);
        }
        this.commentsMapSubject.next(map);
      },
      error: (err) => console.error('Error loading comments:', err)
    });
  }

  postComment(trackId: number, comment: Comment): Promise<void> {
    const body = { ...comment, trackId };
    return new Promise((resolve, reject) => {
      this.http.post(`${this.apiUrl}/comments`, body).subscribe({
        next: () => {
          this.loadComments();
          resolve();
        },
        error: (err) => {
          console.error('Error posting comment:', err);
          reject(err);
        }
      });
    });
  }

  getCommentsForTrack(trackId: number): Comment[] {
    return this.currentCommentsMap[trackId] || [];
  }
}
