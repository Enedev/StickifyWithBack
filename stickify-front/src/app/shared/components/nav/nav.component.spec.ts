import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NavComponent } from './nav.component';
import { AuthService } from '../../../services/auth.service';
import { Subject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

// Creamos un mock del servicio AuthService
class MockAuthService {
  isHomePage: boolean = false;
  logOut() {}
}

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let router: Router;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    // Subject para simular eventos del router
    routerEventsSubject = new Subject();

    await TestBed.configureTestingModule({
      imports: [NavComponent, RouterTestingModule, HttpClientTestingModule],
      providers: [
        {
          provide: Router,
          useValue: {
            // Agregamos createUrlTree y serializeUrl para que RouterLink funcione
            createUrlTree: () => ({}),
            serializeUrl: () => 'fake-url',
            navigate: jasmine.createSpy('navigate'),
            events: routerEventsSubject.asObservable(),
          },
        },
        // Proveemos un mock para ActivatedRoute para evitar el error de inyección
        { provide: ActivatedRoute, useValue: {} },
        // Proveemos el mock de AuthService
        { provide: AuthService, useClass: MockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges(); // Ejecuta ngOnInit y el constructor
  });

  // Limpiamos los mocks después de cada prueba
  afterEach(() => {
    routerEventsSubject.complete();
  });

  it('should set isHomePage to true when navigating to /home', () => {
    // 1. Simula un evento de navegación a la ruta '/home'
    const navigationEndEvent = new NavigationEnd(1, '/home', '/home');
    routerEventsSubject.next(navigationEndEvent);

    // 2. Ejecuta la detección de cambios para que el componente reaccione al evento
    fixture.detectChanges();

    // 3. Verifica que la propiedad isHomePage es verdadera
    expect(component.isHomePage).toBeTrue();
  });

  it('should set isHomePage to false when navigating to a different page', () => {
    // 1. Simula un evento de navegación a una ruta diferente
    const navigationEndEvent = new NavigationEnd(1, '/other-page', '/other-page');
    routerEventsSubject.next(navigationEndEvent);

    // 2. Ejecuta la detección de cambios para que el componente reaccione al evento
    fixture.detectChanges();

    // 3. Verifica que la propiedad isHomePage es falsa
    expect(component.isHomePage).toBeFalse();
  }); 
});
