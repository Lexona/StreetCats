import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register.component',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent { 
  username = signal('');
  password = signal('');
  confirmPassword = signal('');
  errorMessage = signal('');
  successMessage = signal('');
  isLoading = signal(false);

  constructor(private authService: AuthService, private router: Router){}

  onRegister(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    // Validations
    if (!this.username() || !this.password() || !this.confirmPassword()) {
      this.errorMessage.set('Compila tutti i campi.');
      return;
    }

    if (this.username().length < 3) {
      this.errorMessage.set('Lo username deve essere di almeno 3 caratteri.');
      return;
    }

    if (this.password().length < 6) {
      this.errorMessage.set('La password deve essere di almeno 6 caratteri.');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Le password non coincidono.');
      return;
    }

    this.isLoading.set(true);

    this.authService.register(this.username(), this.password()).subscribe({
      next: (response) => {
        console.log('Registrazione effettuata con successo.', response);
        this.isLoading.set(false);
        this.successMessage.set('Registrazione completata! Reindirizzamento al login...');

        // Redirect to login after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        console.error('Errore registrazione: ' , error);
        this.isLoading.set(false);

        if (error.status === 500) {
          this.errorMessage.set('Username già esistente o errore del server.');
        } else {
          this.errorMessage.set('Errore di connessione. Riprova più tardi.');
        }
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onRegister();
    }
  }
}
