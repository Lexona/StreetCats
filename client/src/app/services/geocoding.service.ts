import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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

    return this.http.get<NominatimResponse[]>(this.nominatimUrl, {params}).pipe(
      map(results => results.map(result => ({
        lat: result.lat,
        lng: result.lon,
        display_name: result.display_name
      })))
    );
  }
}
