import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { AuthService } from './auth.service';
import { User } from '../shared/interfaces/user.interface';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;

  beforeEach(() => {
    // Mock del Router
    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    // Espías para los métodos de localStorage
    spyOn(localStorage, 'removeItem');
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'getItem').and.returnValue(null);

    // Mock de Swal.fire
    spyOn(Swal, 'fire').and.callFake(() => Promise.resolve({ isConfirmed: true } as SweetAlertResult));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock },
      ]
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    (localStorage.removeItem as jasmine.Spy).calls.reset();
    (localStorage.setItem as jasmine.Spy).calls.reset();
    (localStorage.getItem as jasmine.Spy).calls.reset();
    (router.navigate as jasmine.Spy).calls.reset();
    (Swal.fire as jasmine.Spy).calls.reset();
  });
  
  it('should remove user and token from localStorage, navigate to login, and show an alert', () => {
    // 1. Configura el estado inicial del servicio para la prueba,
    // simula que el usuario está autenticado
    const mockUser: User = { name: 'testUser' } as any; // 'as any' para simplificar
    service.currentUser = mockUser;
    
    // 2. Llama al método que se esta probando
    service.logOut();

    // 3. Verifica que el currentUser en el servicio se ha establecido en null
    expect(service.currentUser).toBeNull();

    // 4. Verifica que el usuario y el token se han eliminado del localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith('currentUser');
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');

    // 5. Verifica que la navegación al login ha sido llamada
    expect(router.navigate).toHaveBeenCalledWith(['/log-in']);

    // 6. Verifica que la alerta de SweetAlert2 se ha mostrado
    expect(Swal.fire).toHaveBeenCalled();
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: 'info',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente.',
        confirmButtonText: 'Aceptar'
      })
    );
  });
});
