import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Signal {
  id?: number;
  title: string;
  description?: string;
  photo_url: string;
  latitude: number;
  longitude: number;
  UserId?: number;
  User?: {
    userName: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSignalDto {
  title: string;
  description?: string;
  photo_url: string;
  latitude: number;
  longitude: number;
}


@Injectable({
  providedIn: 'root'
})
export class SignalService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/signals`;

  getAllSignals(): Observable<Signal[]> {
    return this.http.get<Signal[]>(this.apiUrl);
  }

  getSignalById(id: number): Observable<Signal> {
    return this.http.get<Signal>(`${this.apiUrl}/${id}`);
  }

  createSignal(signal: CreateSignalDto): Observable<Signal> {
    return this.http.post<Signal>(this.apiUrl, signal);
  }

  deleteSignal(id: number): Observable<{message: string}> {
    return this.http.delete<{message: string}>(`${this.apiUrl}/${id}`);
  }
}
