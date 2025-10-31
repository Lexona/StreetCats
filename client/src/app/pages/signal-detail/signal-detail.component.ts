import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SignalService, Signal } from '../../services/signal.service';
import { AuthService } from '../../services/auth.service';
import * as L from 'leaflet';
import { fixLeafletIconsWithCDN } from '../../../environments/leaflet-icon-fix';
import { MarkdownModule } from 'ngx-markdown';
import { CommentService, Comment } from '../../services/comment.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-signal-detail.component',
  imports: [CommonModule, RouterLink, MarkdownModule, FormsModule],
  templateUrl: './signal-detail.component.html',
  styleUrl: './signal-detail.component.scss',
})
export class SignalDetailComponent implements OnInit{
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private signalService = inject(SignalService);
  private commentService = inject(CommentService);
  authService = inject(AuthService);

  signal = signal<Signal | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  isDeleting = signal(false);

  comments = signal<Comment[]>([]);
  newCommentText = signal('');
  isSubmittingComment = signal(false);
  commentError = signal<string | null>(null);

  map!: L.Map;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadSignal(parseInt(id));
    } else {
      this.errorMessage.set('ID segnalazione non valido.');
      this.isLoading.set(false);
    }

    fixLeafletIconsWithCDN();
  }

  private loadSignal(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.signalService.getSignalById(id).subscribe({
      next: (signal) => {
        this.signal.set(signal);
        this.comments.set(signal.Comments || []);
        this.isLoading.set(false);

        // Inizialize map after signal is loaded
        setTimeout(() => {
          this.initializeMap(signal);
        }, 100);
      },
      error: (error) => {
        console.error('Errore nel caricamento della segnalazione: ', error);
        this.errorMessage.set('Errore nel caricamento della segnalazione.');
        this.isLoading.set(false);
      }
    });
  }

  private initializeMap(signal: Signal): void {
    if (!signal) return;

    this.map = L.map('detail-map', {
      center: [signal.latitude, signal.longitude],
      zoom: 15,
      scrollWheelZoom: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors' 
    }).addTo(this.map);

    // add marker
    const marker = L.marker([signal.latitude, signal.longitude]).addTo(this.map);

    marker.bindPopup(`
      <div style="text-align: center;"> 
        <strong> ${signal.title} </strong>
      </div>
    `).openPopup();
  }

  getImageUrl(photoUrl: string): string {
    return `http://localhost:3000${photoUrl}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  canDelete(): boolean {
    const currentSignal = this.signal();
    const currentUser = this.authService.currentUser();

    return !!(
      this.authService.isAuthenticated() &&
      currentSignal &&
      currentUser &&
      currentSignal.UserId === currentUser.id
    );
  }

  deleteSignal(): void {
    if (!this.signal()?.id) return;

    if (!confirm('Sei sicuro di voler eliminare la segnalazione?')) {
      return;
    }

    this.isDeleting.set(true);

    this.signalService.deleteSignal(this.signal()!.id!).subscribe({
      next: () => {
        console.log('Segnalazione eliminata con successo.');
        this.router.navigate(['/signals']);
      },
      error: (error) => {
        console.error('Errore nell\'eliminazione: ', error);
        alert('Errore nell\'eliminazione della segnalazione');
        this.isDeleting.set(false);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/signals']);
  }

  /**
   * Check if the current user can delete a comment
   */

  canDeleteComment(comment: Comment): boolean {
    const currentUser = this.authService.currentUser();
    return !!(
      this.authService.isAuthenticated() &&
      currentUser &&
      currentUser.id === comment.UserId
    );
  }

  /**
   * send a new comment
   */

  onAddComment(): void {
    this.commentError.set(null);
    const text = this.newCommentText().trim();
    const signalId = this.signal()?.id;

    if (!text || !signalId) {
      this.commentError.set('Il commento non può essere vuoto.');
      return;
    }

    this.isSubmittingComment.set(true);

    this.commentService.createComment(text, signalId).subscribe({
      next: (newComment) => {
        this.comments.update(currentComments => [newComment, ...currentComments]);
        this.newCommentText.set('');  // reset the textArea
        this.isSubmittingComment.set(false);
      },
      error: (error) => {
        console.error('Errore invio commento: ', error);
        this.commentError.set('Errore nell\'invio del commento. Riprova.');
        this.isSubmittingComment.set(false);
      }
    });
  }

  /**
   * Delete a comment
   */

  onDeleteComment(commentId: number): void {
    if(!confirm('Sei sicuro di voler eliminare questo commento?')) {
      return;
    }

    this.commentError.set(null);

    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments.update(currentComments => 
          currentComments.filter(comment => comment.id !== commentId)
        );
      },
      error: (error) => {
        console.error('Errore eliminazione commento: ', error);
        this.commentError.set('Errore nell\'eliminazione del commento. Riprova.');
      }
    });
  }
}
