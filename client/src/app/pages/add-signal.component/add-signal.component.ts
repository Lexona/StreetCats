import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { SignalService } from '../../services/signal.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-add-signal.component',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-signal.component.html',
  styleUrl: './add-signal.component.scss',
})
export class AddSignalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private signalService = inject(SignalService);
  private router = inject(Router);

  signalForm!: FormGroup;
  map!: L.Map;
  marker?: L.Marker;
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  // Predefined coordinates (Naples)
  defaultLat = 40.8518;
  defaultLng = 14.2681;

  ngOnInit(): void {
    this.initializeForm();
    this.initializeMap();
  }

  private initializeForm(): void {
    this.signalForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      latitude: [this.defaultLat, [Validators.required]],
      longitude: [this.defaultLng, [Validators.required]],
      photo_url: ['', [Validators.required]]
    });
  }

  private initializeMap(): void {
    // Initialize the map after the DOM is ready
    setTimeout(() => {
      this.map = L.map('map').setView([this.defaultLat, this.defaultLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(this.map);

      // initial marker
      this.marker = L.marker([this.defaultLat, this.defaultLng], {
        draggable: true
      }).addTo(this.map);

      // Marker drag event
      this.marker.on('dragend', (event) => {
        const position = (event.target as L.Marker).getLatLng();
        this.updateCoordinates(position.lat, position.lng);
      });

      // Click on the map to move the marker
      this.map.on('click', (event: L.LeafletMouseEvent) => {
        const {lat, lng} = event.latlng;
        this.moveMarker(lat, lng);
        this.updateCoordinates(lat, lng);
      });
    }, 100);
  }

  private moveMarker(lat: number, lng: number): void {
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    }
  }

  private updateCoordinates(lat: number, lng: number): void {
    this.signalForm.patchValue({
      latitude: lat, 
      longitude: lng
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // File type validation
      if (!file.type.startsWith('image/')) {
        this.errorMessage.set('Seleziona un file immagine valido');
        return
      }

      // File dimension validation (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage.set('L\'immagine non può superare 5MB');
        return;
      }

      this.selectedFile.set(file);
      this.errorMessage.set(null);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to Base64 for the form
      this.convertToBase64(file);
    }
  }

  private convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      this.signalForm.patchValue({
        photo_url: base64
      });
    };
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedFile.set(null);
    this.previewUrl.set(null);
    this.signalForm.patchValue({
      photo_url: ''
    });
  }
  
  onSubmit(): void {
    if (this.signalForm.invalid) {
      this.signalForm.markAllAsTouched();
      this.errorMessage.set('Completa tutti i campi obbligatori');
      return
    }

    this.isSubmitting.set(true);
    this.errorMessage.set('');

    const signalData = {
      title: this.signalForm.value.title,
      description: this.signalForm.value.description || '',
      photo_url: this.signalForm.value.photo_url,
      latitude: parseFloat(this.signalForm.value.latitude),
      longitude: parseFloat(this.signalForm.value.longitude)
    };

    this.signalService.createSignal(signalData).subscribe({
      next: (response) => {
        console.log('Segnalazione creata con successo: ', response);
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Errore nella creazione della segnalazione: ', error);
        this.errorMessage.set(error.error?.description || 'Errore nella creazione della segnalazione');
        this.isSubmitting.set(false);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }

  // getter for validation
  get title() {
    return this.signalForm.get('title');
  }
}
