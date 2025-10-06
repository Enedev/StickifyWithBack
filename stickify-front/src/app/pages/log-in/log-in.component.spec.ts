import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogInComponent } from './log-in.component';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { RouterTestingModule } from '@angular/router/testing';

describe('LogInComponent', () => {
  let component: LogInComponent;
  let fixture: ComponentFixture<LogInComponent>;
  let authService: AuthService;
  let router: Router;

  let authServiceSpy: jasmine.Spy;
  let routerSpy: jasmine.Spy;
  let swalSpy: jasmine.Spy;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogInComponent, RouterTestingModule], // Agregamos RouterTestingModule para resolver las dependencias del RouterLink
      providers: [
        {
          provide: AuthService,
          useValue: {
            logIn: () => of(true), 
          },
        },
      ],
    }).compileComponents();

    // Arrange (configuración e inicialización común para todos los tests)
    fixture = TestBed.createComponent(LogInComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    authServiceSpy = spyOn(authService, 'logIn');
    routerSpy = spyOn(router, 'navigate');
    swalSpy = spyOn(Swal, 'fire').and.callFake(() => Promise.resolve({ isConfirmed: true } as any));

    fixture.detectChanges();
  });

  it('should create', () => {
    //Assert
    expect(component).toBeTruthy();
  });

  it('should not call authService.logIn with an invalid form', async () => {
    // El formulario está vacío, por lo que es inválido por defecto

    // Act
    await component.onLogin();

    // Assert
    expect(swalSpy).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'error' }));
    expect(authServiceSpy).not.toHaveBeenCalled(); // Verificamos que el método de login del servicio no haya sido llamado
  });

  it('should call authService.logIn and navigate on valid credentials', async () => {
    // Arrange
    authServiceSpy.and.returnValue(of(true));
    // Establecemos valores válidos en el formulario
    component.loginForm.get('email')?.setValue('test@example.com');
    component.loginForm.get('password')?.setValue('password123');

    // Act
    await component.onLogin();

    // Assert
    
    expect(authServiceSpy).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    }); // Verificamos que se haya llamado al método de login del servicio

    expect(swalSpy).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'success' }));
    expect(routerSpy).toHaveBeenCalledWith(['/home']); // Verificamos que se haya navegado a la página de inicio ('/home')
  });

  it('should show an error message on login failure', async () => {
    // Arrange
    authServiceSpy.and.returnValue(throwError(() => ({ message: 'Login failed' })));

    component.loginForm.get('email')?.setValue('test@example.com');
    component.loginForm.get('password')?.setValue('password123');

    // Act
    await component.onLogin();

    // Assert
    expect(authServiceSpy).toHaveBeenCalled();

    expect(swalSpy).toHaveBeenCalledWith(
      jasmine.objectContaining({ text: jasmine.any(String), icon: 'error' })
    );

    expect(routerSpy).not.toHaveBeenCalled();
  });
});
