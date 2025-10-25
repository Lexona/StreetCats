import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(private renderer: Renderer2, private router: Router, public authService: AuthService) {}

  ngOnInit(): void {
    this.renderer.addClass(document.body, 'home-background');
  }

  ngOnDestroy(): void {
    this.renderer.removeClass(document.body, 'home-background');
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout effettuato.');
      },
      error: (error)  => {
        console.error('Errore logout: ', error);
        this.router.navigate(['/login']);
      }
    });
  }
}
