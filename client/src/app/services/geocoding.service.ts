import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, delay, map, throwError } from 'rxjs';

export interface GeocodingResult {
  lat: string,
  lng: string, 
  display_name: string;
}

interface NominatimResponse {
  lat: string;
  lon: string;
  display_name: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private http = inject(HttpClient);
  private nominatimUrl = 'https://nominatim.openstreetmap.org/search';

  searchAddress(address: string): Observable<GeocodingResult[]> {
    const params = {
      q: address,
      format: 'json',
      limit: '5',
      addressdetails: '1'
    };

    // user agent 
    const headers = new HttpHeaders({
      'User-Agent': 'StreetCats/1.0 (marta.pagliuso@hotmail.com)'
    });

    return this.http.get<NominatimResponse[]>(this.nominatimUrl, {
      params, 
      headers
    }).pipe(
      delay(1000),
      map(results => results.map(result => ({
        lat: result.lat,
        lng: result.lon,
        display_name: result.display_name
      }))),
      catchError(error => {
        console.error('Errore nella ricerca geocoding: ', error);

        if (error.status === 403) {
          console.error('Nominatim ha bloccato la richiesta. Verifica lo User-Agent.');
        } else if (error.status === 429) {
          console.error('Troppe richieste a Nominatim. Attendi prima di riprovare.');
        }

        return throwError(() => error);
      })
    );
  }
}
