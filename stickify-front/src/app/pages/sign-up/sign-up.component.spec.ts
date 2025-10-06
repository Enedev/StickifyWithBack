import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { SignUpComponent } from './sign-up.component';
import { AuthService } from '../../services/auth.service';

describe('RegistryComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  let authService: AuthService;
  let router: Router;

  let authServiceSpy: jasmine.Spy;
  let routerSpy: jasmine.Spy;
  let swalSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpComponent, ReactiveFormsModule, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: () => of(true),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    authServiceSpy = spyOn(authService, 'signUp');
    routerSpy = spyOn(router, 'navigate');
    swalSpy = spyOn(Swal, 'fire').and.callFake(() => Promise.resolve({ isConfirmed: true } as any));

    fixture.detectChanges();
  });

  it('should create', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  it('should show error if form is invalid', async () => {
    // Act
    await component.onRegistry();
    // Assert
    expect(swalSpy).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'error' }));
    expect(authServiceSpy).not.toHaveBeenCalled();
  });

  it('should register successfully and navigate to login', async () => {
    // Arrange
    authServiceSpy.and.returnValue(of(true));

    component.registryForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      repeatPassword: 'password123',
    });
    component.isPremium = true;

    // Act
    await component.onRegistry();

    // Assert
    expect(authServiceSpy).toHaveBeenCalledWith({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      premium: true,
    });
    expect(swalSpy).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'success' }));
    expect(routerSpy).toHaveBeenCalledWith(['/log-in']);
  });

  it('should show specific error if user already exists', async () => {
    // Arrange
    authServiceSpy.and.returnValue(
      throwError(() => ({
        status: 400,
        error: { code: '23505', detail: 'duplicate key value' },
      }))
    );

    component.registryForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      repeatPassword: 'password123',
    });

    // Act
    await component.onRegistry();

    // Assert
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ text: 'Este correo electrónico ya está registrado.' })
    );
    expect(routerSpy).not.toHaveBeenCalled();
  });
  it('should show error if passwords do not match', async () => {
    // Arrange
    component.registryForm.setValue({
      username: 'user',
      email: 'user@test.com',
      password: '123',
      repeatPassword: '456',
    });

    // Act
    await component.onRegistry();

    // Assert
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ text: 'Las contraseñas no coinciden' })
    );
    expect(authServiceSpy).not.toHaveBeenCalled();
  });

  it('should cancel registry when not premium and user cancels confirmation', async () => {
    // Arrange
    component.registryForm.setValue({
      username: 'user',
      email: 'user@test.com',
      password: '123',
      repeatPassword: '123',
    });
    component.isPremium = false;

    swalSpy.and.returnValue(Promise.resolve({ isConfirmed: false } as any));

    // Act
    await component.onRegistry();

    // Assert
    expect(authServiceSpy).not.toHaveBeenCalled();
  });

  it('should continue registry without premium when user confirms', async () => {
    // Arrange
    authServiceSpy.and.returnValue(of(true));
    component.registryForm.setValue({
      username: 'user',
      email: 'user@test.com',
      password: '123',
      repeatPassword: '123',
    });
    component.isPremium = false;

    swalSpy.and.returnValue(Promise.resolve({ isConfirmed: true } as any));

    // Act
    await component.onRegistry();

    // Assert
    expect(authServiceSpy).toHaveBeenCalled();
  });

  it('should show error if service returns false', async () => {
    // Arrange
    authServiceSpy.and.returnValue(of(false));

    component.registryForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      repeatPassword: 'password123',
    });
    component.isPremium = true;

    // Act
    await component.onRegistry();

    // Assert
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ text: 'Error en el registro. Por favor intente nuevamente.' })
    );
  });

  it('should show backend detail error if provided', async () => {
    // Arrange
    authServiceSpy.and.returnValue(
      throwError(() => ({
        status: 400,
        error: { detail: 'Some backend error' },
      }))
    );

    component.registryForm.setValue({
      username: 'user',
      email: 'user@test.com',
      password: '123',
      repeatPassword: '123',
    });

    // Act
    await component.onRegistry();

    // Assert
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ text: 'Some backend error' })
    );
  });

  it('should show generic message from error.message', async () => {
    // Arrange
    authServiceSpy.and.returnValue(
      throwError(() => ({
        message: 'Custom error message',
      }))
    );

    component.registryForm.setValue({
      username: 'user',
      email: 'user@test.com',
      password: '123',
      repeatPassword: '123',
    });

    // Act
    await component.onRegistry();

    // Assert
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ text: 'Custom error message' })
    );
  });

  /* ==== openPremiumModal tests ==== */
  it('should show warning if form is invalid when opening premium modal', async () => {
    // Arrange
    component.registryForm.reset();
    // Act
    await component.openPremiumModal();
    // Assert
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: 'warning' })
    );
  });

  it('should not reopen modal if already premium and cancelled', async () => {
    // Arrange
    component.isPremium = true;
    component.registryForm.setValue({
      username: 'u',
      email: 'u@test.com',
      password: '123',
      repeatPassword: '123',
    });

    swalSpy.and.returnValue(Promise.resolve({ isConfirmed: false } as any));
    // Act
    await component.openPremiumModal();

    // Assert
    expect(component.showPremiumModal).toBeFalse();
  });

  /* ==== closePremiumModal tests ==== */
  it('should activate premium and show success alert when confirmed', () => {
    // Act
    component.closePremiumModal(true);
    // Assert
    expect(component.isPremium).toBeTrue();
    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: 'success' })
    );
  });

  it('should not show success alert when cancelled', () => {
    // Act
    component.closePremiumModal(false);
    // Assert
    expect(component.isPremium).toBeFalse();
    expect(swalSpy).not.toHaveBeenCalledWith(
      jasmine.objectContaining({ icon: 'success' })
    );
  });

});
