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
});