import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login.component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  username = signal('');
  password = signal('');
  errorMessage = signal('');
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router){}

  onLogin(): void {
    this.errorMessage.set('');

    if (!this.username() || !this.password()) {
      this.errorMessage.set('Inserisci username e password');
      return;
    }

    this.isLoading.set(true);

    this.authService.login(this.username(), this.password()).subscribe({
      next: (response) => {
        console.log('Login effettuato con successo.', response);
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Errore login: ', error);
        this.isLoading.set(false);

        if (error.status === 401) {
          this.errorMessage.set('Credenziali non valide. Riprova.');
        } else {
          this.errorMessage.set('Errore di connessione. Riprova più tardi.');
        }
      }
    });
  }


  // Method for managing sending with Enter
  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') this.onLogin();
  }
}
