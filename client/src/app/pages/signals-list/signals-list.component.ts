import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { SignalService, Signal } from '../../services/signal.service';
import * as L from 'leaflet';
import { fixLeafletIconsWithCDN } from '../../../environments/leaflet-icon-fix';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signals-list.component',
  imports: [CommonModule, RouterLink],
  templateUrl: './signals-list.component.html',
  styleUrl: './signals-list.component.scss',
})
export class SignalsListComponent implements OnInit {
  private signalService = inject(SignalService);
  private router = inject(Router);
  authService = inject(AuthService);

  signals = signal<Signal[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  selectedSignal = signal<Signal | null>(null);

  map!: L.Map;
  markers: Map<number, L.Marker> = new Map();

  // Custom icons for the markers
  private defaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  private selectedIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  ngOnInit(): void {
    this.loadSignals();
    this.initializeMap();
    fixLeafletIconsWithCDN();
  }

  private initializeMap(): void {
    setTimeout(() => {
      this.map = L.map('map').setView([40.8518, 14.2681], 12);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);
    }, 100);
  }

  loadSignals(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.signalService.getAllSignals().subscribe({
      next: (signals) => {
        this.signals.set(signals);
        this.isLoading.set(false);

        // add marker to the map
        setTimeout(() => {
          this.addMarkersToMap(signals);
        }, 200);
      },
      error: (error) => {
        console.error('Errore nel caricamento delle segnalazioni: ', error);
        this.errorMessage.set('Errore nel caricamento delle segnalazioni.');
        this.isLoading.set(false);
      }
    });
  }

  private addMarkersToMap(signals: Signal[]): void {
    if (!this.map) return;

    // remove all existed marker
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();

    signals.forEach(signal => {
      const marker = L.marker([signal.latitude, signal.longitude], {
        icon: this.defaultIcon
      }).addTo(this.map);

      // tooltip with base information
      marker.bindTooltip(`
        <div style="text-align: center;">
          <strong>${signal.title}</strong><br>
          <small>da ${signal.User?.userName || 'Anonimo'}</small>
        </div>
      `, {
        direction: 'top',
        offset: [0, -41]
      });

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <img src="http://localhost:3000${signal.photo_url}" 
              alt="${signal.title}" 
              style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;">
          <h4 style="margin: 0 0 4px 0; font-size: 14px;">${signal.title}</h4>
          <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
            ${new Date(signal.createdAt!).toLocaleDateString('it-IT')}
          </p>
          <button 
            onclick="window.dispatchEvent(new CustomEvent('viewSignalDetail', { detail: ${signal.id} }))"
            style="width: 100%; padding: 6px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 13px;">
            Vedi dettagli
          </button>
        </div>
      `, {
        maxWidth: 220
      });

      marker.on('click', () => {
        this.selectSignal(signal);
      });

      this.markers.set(signal.id!, marker);
    });

    // event listener for button popup
    window.addEventListener('viewSignalDetail', ((event: CustomEvent) => {
      this.viewDetail(event.detail);
    }) as EventListener);

    if (signals.length > 0) {
      const bounds = L.latLngBounds(
        signals.map(s => [s.latitude, s.longitude] as [number, number])
      );
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  selectSignal(signal: Signal): void {
    // Ripristina l'icona del marker precedentemente selezionato
    if (this.selectedSignal()) {
      const prevMarker = this.markers.get(this.selectedSignal()!.id!);
      if (prevMarker) {
        prevMarker.setIcon(this.defaultIcon);
      }
    }

    // Imposta la nuova segnalazione selezionata
    this.selectedSignal.set(signal);

    // Cambia l'icona del marker selezionato
    const marker = this.markers.get(signal.id!);
    if (marker) {
      marker.setIcon(this.selectedIcon);
      this.map.setView([signal.latitude, signal.longitude], 15);
    }

    // Scroll alla card nella lista
    setTimeout(() => {
      const element = document.getElementById(`signal-${signal.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  viewDetail(id: number): void {
    this.router.navigate(['/signals', id]);
  }

  getImageUrl(photoUrl: string): string {
    return `http://localhost:3000${photoUrl}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  goToAddSignal(): void {
    this.router.navigate(['/add-signals']);
  }
}
