import { Component, ViewChild, ElementRef, inject, OnInit } from '@angular/core'; // Add OnInit
import { NavComponent } from '../../shared/components/nav/nav.component';
import { FormsModule } from '@angular/forms';
import { MusicService } from '../../services/music.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Song } from '../../shared/interfaces/song.interface';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service'; // Import AuthService
import { User } from '../../shared/interfaces/user.interface'; // Import User interface
import { SongApiService } from '../../services/song-api.service';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [NavComponent, FormsModule, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent implements OnInit { // Implement OnInit
  @ViewChild('artistName') artistNameInput!: ElementRef;
  @ViewChild('trackName') trackNameInput!: ElementRef;
  @ViewChild('collectionName') collectionNameInput!: ElementRef;
  @ViewChild('primaryGenreName') primaryGenreNameInput!: ElementRef;
  @ViewChild('artworkFile') artworkFileInput!: ElementRef;

  private musicService = inject(MusicService);
  private router = inject(Router);
  private authService = inject(AuthService); // Inject AuthService
  private songApiService = inject(SongApiService);
  private currentSwal: any;
  private readonly MAX_IMAGE_SIZE_MB = 3;
  previewImage: string | ArrayBuffer | null = null;
  currentUser: User | null = null; // Property to hold current user info

  ngOnInit(): void {
    // Load current user data on component initialization
    this.currentUser = this.authService.currentUser;
  }

  async uploadSong(): Promise<void> {
    // --- NEW: Premium check ---
    if (!this.currentUser?.premium) {
      await this.showAlert(
        'info',
        'Acceso Restringido',
        'Necesitas ser usuario Premium para subir canciones.'
      );
      this.router.navigate(['/profile']); // Optionally, navigate to profile page to encourage upgrade
      return;
    }
    // --- END NEW ---

    const formData = this.getFormData();
    if (!formData.valid) {
      await this.showAlert('error', 'Error', formData.errorMessage!);
      return;
    }
    // Check image size limit
    if (formData.artworkFile!.size > this.MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      await this.showAlert(
        'error',
        'Archivo demasiado grande',
        `La imagen no debe exceder ${this.MAX_IMAGE_SIZE_MB}MB`
      );
      return;
    }

    await this.showLoader();

    try {
      // Process image and create song
      const artworkUrl = await this.processImage(formData.artworkFile!);

      const generateSmallIntId = (): number => {
        const uuidHex = uuidv4().replace(/-/g, '');
        const startIndex = Math.floor(Math.random() * (uuidHex.length - 7));
        const limitedHex = uuidHex.substring(startIndex, startIndex + 7);
        return parseInt(limitedHex, 16);
      };

      const songToUpload: Song = {
        artistName: formData.artistName!,
        trackName: formData.trackName!,
        collectionName: formData.collectionName!,
        primaryGenreName: formData.primaryGenreName!,
        artworkUrl100: artworkUrl,
        releaseDate: new Date().toISOString(),
        trackId: generateSmallIntId(),
        collectionId: generateSmallIntId(),
        artistId: generateSmallIntId(),
        isUserUpload: true
      };

      // MODIFIED: Use musicService.addSong instead of songApiService.createSong
      this.musicService.addSong(songToUpload).subscribe({
        next: async (responseSong) => {
          await this.showAlert(
            'success',
            'Éxito',
            `Canción "${responseSong.trackName}" subida y guardada correctamente`
          );
          // The MusicService.addSong already triggers a re-fetch of all songs,
          // so navigating to home will show the updated, sorted list.
          this.router.navigate(['/home']);
        },
        error: async (err) => {
          console.error('Error al subir canción al backend:', err);
          const errorMsg = err.error?.message || 'Ocurrió un error al guardar la canción en el servidor.';
          await this.showAlert('error', 'Error', errorMsg);
        },
        complete: () => {
          this.closeCurrentAlert();
        }
      });

    } catch (error) {
      console.error('Error en uploadSong (antes de enviar al backend):', error);
      const errorMsg = this.getErrorMessage(error);
      await this.showAlert('error', 'Error', errorMsg);
      this.closeCurrentAlert();
    }
  }


  onFileSelected(event: Event): void {
  
    if (!this.currentUser?.premium) {
      this.showAlert(
        'info',
        'Acceso Restringido',
        'Necesitas ser usuario Premium para seleccionar archivos de portada.'
      );
      // Clear the input to prevent invalid file selection
      const input = event.target as HTMLInputElement;
      if (input) input.value = '';
      this.previewImage = null; // Clear any existing preview
      return;
    }


    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      if (file.size > this.MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        this.showAlert(
          'error',
          'Archivo demasiado grande',
          `La imagen no debe exceder ${this.MAX_IMAGE_SIZE_MB}MB`
        );
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  private getFormData(): {
    valid: boolean;
    errorMessage?: string;
    artistName?: string;
    trackName?: string;
    collectionName?: string;
    primaryGenreName?: string;
    artworkFile?: File
  } {
    const artistName = this.artistNameInput?.nativeElement?.value?.trim();
    const trackName = this.trackNameInput?.nativeElement?.value?.trim();
    const collectionName = this.collectionNameInput?.nativeElement?.value?.trim();
    const primaryGenreName = this.primaryGenreNameInput?.nativeElement?.value?.trim();
    const artworkFile = this.artworkFileInput?.nativeElement?.files?.[0];

    if (!artistName || !trackName || !collectionName || !primaryGenreName) {
      return {
        valid: false,
        errorMessage: 'Por favor completa todos los campos'
      };
    }

    if (!artworkFile) {
      return {
        valid: false,
        errorMessage: 'Por favor selecciona una imagen'
      };
    }

    return {
      valid: true,
      artistName,
      trackName,
      collectionName,
      primaryGenreName,
      artworkFile
    };
  }
  // Convert image file to data URL
  private async processImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(new Error('Error procesando imagen'));
      reader.readAsDataURL(file);
    });
  }

  private async showLoader(): Promise<void> {
    this.closeCurrentAlert();
    this.currentSwal = Swal.fire({
      title: 'Subiendo canción...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
      background: '#1a1a1a',
      color: '#ffffff'
    });
  }

  private async showAlert(
    type: 'success' | 'error' | 'info' | 'warning',
    title: string,
    text: string
  ): Promise<void> {
    this.closeCurrentAlert();
    this.currentSwal = await Swal.fire({
      icon: type,
      title: title,
      text: text,
      background: '#1a1a1a',
      color: '#ffffff',
      confirmButtonText: 'Entendido',
      timer: type === 'success' ? 3000 : undefined,
      timerProgressBar: type === 'success'
    });
  }

  private closeCurrentAlert(): void {
    if (this.currentSwal) {
      Swal.close();
      this.currentSwal = null;
    }
  }

  private getErrorMessage(error: any): string {
    if (error instanceof Error && error.message.includes('procesando imagen')) {
      return 'Error al procesar la imagen. Intenta con otro archivo.';
    }
    return 'Ocurrió un error inesperado al subir la canción.';
  }
}