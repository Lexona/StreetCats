import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string;
  UserId: number;
  SignalId: number;
  User: {
    id: number;
    userName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/comments`;

  /**
   * Create new comment
   */

  createComment(text: string, signalId: number): Observable<Comment> {
    return this.http.post<Comment>(this.apiUrl, {text, signalId});
  }

  /**
   * Delete a comment
   */

  deleteComment(commentId: number): Observable<{message: string}> {
    return this.http.delete<{ message: string}>(`${this.apiUrl}/${commentId}`);
  }
}
