import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { SignUpComponent } from './sign-up.component'; // Ajusta el nombre del componente según corresponda
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
    expect(component).toBeTruthy();
  });

  it('should show error if form is invalid', async () => {
    await component.onRegistry();

    expect(swalSpy).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'error' }));
    expect(authServiceSpy).not.toHaveBeenCalled();
  });

  it('should register successfully and navigate to login', async () => {
    authServiceSpy.and.returnValue(of(true));

    component.registryForm.setValue({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      repeatPassword: 'password123',
    });
    component.isPremium = true;

    await component.onRegistry();

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

    await component.onRegistry();

    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ text: 'Este correo electrónico ya está registrado.' })
    );
    expect(routerSpy).not.toHaveBeenCalled();
  });
});
