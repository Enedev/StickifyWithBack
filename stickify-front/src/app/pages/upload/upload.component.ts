import { Component, ViewChild, ElementRef, inject } from '@angular/core';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { FormsModule } from '@angular/forms';
import { MusicService } from '../../services/music.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Song } from '../../shared/interfaces/song.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [NavComponent, FormsModule, CommonModule],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {
  @ViewChild('artistName') artistNameInput!: ElementRef;
  @ViewChild('trackName') trackNameInput!: ElementRef;
  @ViewChild('collectionName') collectionNameInput!: ElementRef;
  @ViewChild('primaryGenreName') primaryGenreNameInput!: ElementRef;
  @ViewChild('artworkFile') artworkFileInput!: ElementRef;

  private musicService = inject(MusicService);
  private router = inject(Router);
  private currentSwal: any;
  private readonly MAX_IMAGE_SIZE_MB = 3;
  previewImage: string | ArrayBuffer | null = null;

  async uploadSong(): Promise<void> {
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
      
      const song = this.createSong(
        formData.artistName!,
        formData.trackName!,
        formData.collectionName!,
        formData.primaryGenreName!,
        artworkUrl
      );

      this.musicService.addSong(song);

      await this.showAlert(
        'success', 
        'Éxito', 
        `Canción "${formData.trackName}" subida correctamente`
      );
      
      this.router.navigate(['/home']);

    } catch (error) {
      console.error('Error en uploadSong:', error);
      
      const errorMsg = this.getErrorMessage(error);
      await this.showAlert('error', 'Error', errorMsg);
      
    } finally {
      this.closeCurrentAlert();
    }
  }

  onFileSelected(event: Event): void {
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

  private createSong(
    artistName: string,
    trackName: string,
    collectionName: string,
    primaryGenreName: string,
    artworkUrl: string
  ): Song {
    return {
      artistName,
      trackName,
      collectionName,
      primaryGenreName,
      artworkUrl100: artworkUrl,
      releaseDate: new Date().toISOString(),
      trackId: Date.now(),
      collectionId: Date.now() + 1,
      artistId: Date.now() + 2,
      isUserUpload: true
    };
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
    type: 'success'|'error'|'info'|'warning',
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