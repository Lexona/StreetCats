import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, delay, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface GeocodingResult {
  lat: string,
  lng: string, 
  display_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/geocoding`

  searchAddress(address: string): Observable<GeocodingResult[]> {
    const params = {q: address};

    return this.http.get<GeocodingResult[]>(`${this.apiUrl}/search`, { params }).pipe(
      catchError(error => {
        console.error('Errore nella ricerca di geocoding: ', error);
        return throwError(() => error);
      })
    );
  }
}
