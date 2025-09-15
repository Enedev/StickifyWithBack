import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadComponent } from './upload.component';
import { MusicService } from '../../services/music.service';
import { AuthService } from '../../services/auth.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { ElementRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({ template: '' })
class DummyComponent {}

describe('UploadComponent', () => {
  let component: UploadComponent;
  let fixture: ComponentFixture<UploadComponent>;

  const mockMusicService = {
    addSong: jasmine.createSpy('addSong').and.returnValue(of({ trackName: 'Mock Song' }))
  };

  const mockAuthService = {
    currentUser: { premium: true, email: 'testuser@example.com' },
    user$: of({ email: 'testuser@example.com', premium: true })
  };

  beforeEach(async () => {
    spyOn(Swal, 'fire').and.callFake((options): Promise<SweetAlertResult<any>> => {
      return Promise.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
        value: null,
        dismiss: undefined
      });
    });

    spyOn(Swal, 'close').and.callFake(() => {});

    await TestBed.configureTestingModule({
      imports: [
        UploadComponent,
        FormsModule,
        CommonModule,
        RouterTestingModule.withRoutes([
          { path: 'profile', component: DummyComponent },
          { path: 'home', component: DummyComponent }
        ])
      ],
      providers: [
        { provide: MusicService, useValue: mockMusicService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UploadComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    fixture.detectChanges();
  });

  function setValidFormInputs(fileSize = 1024 * 1024) {
    component.artistNameInput = new ElementRef({ value: 'Artista' });
    component.trackNameInput = new ElementRef({ value: 'Canción' });
    component.collectionNameInput = new ElementRef({ value: 'Álbum' });
    component.primaryGenreNameInput = new ElementRef({ value: 'Pop' });
    component.artworkFileInput = new ElementRef({
      files: [new File([new ArrayBuffer(fileSize)], 'cover.jpg', { type: 'image/jpeg' })]
    });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should block upload if user is not premium', async () => {
    component.currentUser = { premium: false } as any;
    setValidFormInputs();

    await component.uploadSong();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'info',
      title: 'Acceso Restringido'
    }));
  });

  it('should show error if form fields are missing', async () => {
    setValidFormInputs();
    component.artistNameInput.nativeElement.value = '';

    await component.uploadSong();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      text: 'Por favor completa todos los campos'
    }));
  });

  it('should show error if image is too large', async () => {
    setValidFormInputs(5 * 1024 * 1024); // 5MB

    await component.uploadSong();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      text: jasmine.stringMatching(/La imagen no debe exceder/)
    }));
  });

  it('should call musicService.addSong if form is valid and user is premium', async () => {
    setValidFormInputs();
    // Asegura que el mock retorne éxito para este test
    mockMusicService.addSong.and.returnValue(of({ trackName: 'Mock Song' }));

    await component.uploadSong();

    expect(mockMusicService.addSong).toHaveBeenCalled();
    // Busca entre las llamadas a Swal.fire una que tenga icon: 'success' y title: 'Éxito'
    const successCall = (Swal.fire as jasmine.Spy).calls.all().find(call =>
      call.args[0] && call.args[0].icon === 'success' && call.args[0].title === 'Éxito'
    );
    expect(successCall).toBeDefined();
  });

  it('should show error if backend fails', async () => {
    setValidFormInputs();
    mockMusicService.addSong.and.returnValue(throwError(() => ({
      error: { message: 'Error del servidor' }
    })));

    await component.uploadSong();

    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      text: 'Error del servidor'
    }));
  });
  it('should preview image on file selected', async () => {
    const originalFileReader = window.FileReader;
    window.FileReader = class {
      public onload: ((ev: any) => void) | null = null;
      public result: string | null = null;
      readAsDataURL(_file: any) {
        setTimeout(() => {
          this.result = 'data:image/jpeg;base64,abc';
          if (typeof this.onload === 'function') {
            this.onload({ target: { result: this.result } });
          }
        }, 0);
      }
    } as any;
    const file = new File([new ArrayBuffer(1024)], 'cover.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } } as any;
    component.currentUser = { premium: true } as any;
    component.previewImage = null;
    component.onFileSelected(event);
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(component.previewImage as any).toBe('data:image/jpeg;base64,abc');
    window.FileReader = originalFileReader;
  });

  it('should block file selection if not premium', () => {
    const file = new File([new ArrayBuffer(1024)], 'cover.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file], value: 'cover.jpg' } } as any;
    component.currentUser = { premium: false } as any;
    component.previewImage = 'old';
    spyOn<any>(component, 'showAlert');
    component.onFileSelected(event);
    expect((component as any).showAlert).toHaveBeenCalledWith('info', 'Acceso Restringido', jasmine.any(String));
    expect(event.target.value).toBe('');
    expect(component.previewImage).toBeNull();
  });

  it('should show error if selected image is too large', () => {
    const file = new File([new ArrayBuffer(5 * 1024 * 1024)], 'cover.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file] } } as any;
    component.currentUser = { premium: true } as any;
    spyOn<any>(component, 'showAlert');
    component.onFileSelected(event);
    expect((component as any).showAlert).toHaveBeenCalledWith('error', 'Archivo demasiado grande', jasmine.any(String));
  });

  it('should validate getFormData for missing fields', () => {
    component.artistNameInput = new ElementRef({ value: '' });
    component.trackNameInput = new ElementRef({ value: '' });
    component.collectionNameInput = new ElementRef({ value: '' });
    component.primaryGenreNameInput = new ElementRef({ value: '' });
    component.artworkFileInput = new ElementRef({ files: [new File([new ArrayBuffer(1024)], 'cover.jpg')] });
    const result = (component as any).getFormData();
    expect(result.valid).toBeFalse();
    expect(result.errorMessage).toBe('Por favor completa todos los campos');
  });

  it('should validate getFormData for missing image', () => {
    component.artistNameInput = new ElementRef({ value: 'Artista' });
    component.trackNameInput = new ElementRef({ value: 'Canción' });
    component.collectionNameInput = new ElementRef({ value: 'Álbum' });
    component.primaryGenreNameInput = new ElementRef({ value: 'Pop' });
    component.artworkFileInput = new ElementRef({ files: [] });
    const result = (component as any).getFormData();
    expect(result.valid).toBeFalse();
    expect(result.errorMessage).toBe('Por favor selecciona una imagen');
  });

  it('should process image and resolve data URL', async () => {
    const originalFileReader = window.FileReader;
    window.FileReader = class {
      public onload: ((ev: any) => void) | null = null;
      public result: string | null = null;
      readAsDataURL(_file: any) {
        setTimeout(() => {
          this.result = 'data:image/jpeg;base64,abc';
          if (typeof this.onload === 'function') {
            this.onload({ target: { result: this.result } });
          }
        }, 0);
      }
    } as any;
    const file = new File([new ArrayBuffer(1024)], 'cover.jpg');
    const result = await (component as any).processImage(file);
    expect(result).toBe('data:image/jpeg;base64,abc');
    window.FileReader = originalFileReader;
  });

  it('should handle error in processImage', async () => {
    const file = new File([new ArrayBuffer(1024)], 'cover.jpg');
    spyOn(window.FileReader.prototype, 'readAsDataURL').and.callFake(function(this: any) {
      this.onerror('error');
    });
    try {
      await (component as any).processImage(file);
      fail('Should throw error');
    } catch (e) {
      if (e instanceof Error) {
        expect(e.message).toContain('Error procesando imagen');
      }
    }
  });

  it('should call Swal.fire in showLoader', async () => {
    await (component as any).showLoader();
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ title: 'Subiendo canción...' }));
  });

  it('should call Swal.fire in showAlert', async () => {
    await (component as any).showAlert('success', 'Test', 'Mensaje');
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'success', title: 'Test', text: 'Mensaje' }));
  });

  it('should close current alert in closeCurrentAlert', () => {
    (component as any).currentSwal = true;
    (component as any).closeCurrentAlert();
    expect(Swal.close).toHaveBeenCalled();
    expect((component as any).currentSwal).toBeNull();
  });

  it('should return error message for image error in getErrorMessage', () => {
    const error = new Error('Error procesando imagen');
    const msg = (component as any).getErrorMessage(error);
    expect(msg).toBe('Error al procesar la imagen. Intenta con otro archivo.');
  });

  it('should return default error message in getErrorMessage', () => {
    const error = new Error('Otro error');
    const msg = (component as any).getErrorMessage(error);
    expect(msg).toBe('Ocurrió un error inesperado al subir la canción.');
  });
});