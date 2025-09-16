import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { AuthService } from './auth.service';
import { User } from '../shared/interfaces/user.interface';

describe('AuthService - logOut', () => {
  let service: AuthService;
  let router: Router;

  const CURRENT_USER_KEY = 'currentUser';
  const TOKEN_KEY = 'authToken';

  beforeEach(() => {
    // Mock del Router
    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    // Espías para localStorage
    spyOn(localStorage, 'removeItem');
    spyOn(localStorage, 'setItem');
    spyOn(localStorage, 'getItem').and.returnValue(null);

    // Mock de Swal.fire
    spyOn(Swal, 'fire').and.callFake(() =>
      Promise.resolve({ isConfirmed: true } as SweetAlertResult)
    );

    // Mock de performance.now
    spyOn(performance, 'now').and.returnValues(100, 120); // duración = 20ms

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
    (performance.now as jasmine.Spy).calls.reset();
  });

  it('should clear storage, reset user, navigate to login and show alert', () => {
    // Arrange
    const mockUser: User = { id: '1', username: 'testUser' } as User;
    service.currentUser = mockUser;

    // Act
    service.logOut();

    // Assert - Estado interno
    expect(service.currentUser).toBeNull();

    // Assert - Storage
    expect(localStorage.removeItem).toHaveBeenCalledWith(CURRENT_USER_KEY);
    expect(localStorage.removeItem).toHaveBeenCalledWith(TOKEN_KEY);
    expect(localStorage.setItem).not.toHaveBeenCalled();

    // Assert - Navegación
    expect(router.navigate).toHaveBeenCalledWith(['/log-in']);

    // Assert - SweetAlert2
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: 'info',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente.',
        confirmButtonText: 'Aceptar'
      })
    );

    // Assert - Medición de tiempo
    expect(performance.now).toHaveBeenCalledTimes(2);
  });
});
