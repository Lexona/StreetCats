import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, of, throwError } from 'rxjs';

export interface LoginResponse{
  accessToken: string;
}

export interface User {
  id: number,
  userName: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private accessToken: string | null = null;

  //signal for the authentication state
  isAuthenticated = signal<boolean>(false);
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Check if there is a token saved at startup
    this.accessToken = localStorage.getItem('accessToken');
    if (this.accessToken) {
      this.decodeAndSetUser(this.accessToken);
      this.isAuthenticated.set(true);
    }
  }

  /**
   * User Login
   */

  login (username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth`,
      {usr: username, pwd: password}, 
      {withCredentials: true}
    ).pipe (
      tap(reposense => {
        this.setSession(reposense.accessToken);
      }),
      catchError(error => {
        console.error('Errore login: ', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * New user registration
   */

  register(username: string, password: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/register`,
      {usr: username, pwd: password}
    );
  }

  /**
   * Logout
   */

  logout():Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`,
      {},
      {withCredentials: true}
    ).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      })
    );
  }

  /**
   * Token refresh
   */

  refreshToken():Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/refresh`,
      {},
      {withCredentials: true}
    ).pipe(
      tap(response => {
        this.setSession(response.accessToken);
      }),
      catchError(error => {
        console.error('Errore refresh token: ', error);
        this.clearSession();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get the current token
   */

  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Save session
   */

  private setSession(token: string): void {
    this.accessToken = token;
    localStorage.setItem('accessToken', token);
    this.decodeAndSetUser(token);
    this.isAuthenticated.set(true);
  }

  /**
   * Clear session
   */

  private clearSession():void {
    this.accessToken = null;
    localStorage.removeItem('accessToken');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  /**
   * Decode the JWT and set the current user
   */

  private decodeAndSetUser(token: string): void {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUser.set({
        id: payload.id,
        userName: payload.user
      });
    } catch (error) {
      console.error('Errore decodifica token: ', error);
    }
  }

  /**
   * Check if the token has expired
   */

  isTokenExpired(): boolean {
    if (!this.accessToken) return true;

    try {
      const payload = JSON.parse(atob(this.accessToken.split('.')[1]));
      const expiry = payload.exp * 1000;
      return Date.now() > expiry;
    } catch {
      return true
    }
  }

}
