import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { AuthService } from './auth.service';
import { User } from '../shared/interfaces/user.interface';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let router: Router;
  let httpMock: HttpTestingController;
  let mockStorage: { [key: string]: string };

  const CURRENT_USER_KEY = 'currentUser';
  const TOKEN_KEY = 'authToken';

  const mockUser: User = {
    id: '1',
    username: 'testUser',
    email: 'test@example.com',
    password: 'password123',
    premium: false,
    following: ['user2@example.com']
  } as User;

  beforeEach(() => {
    // Mock del Router
    const routerMock = {
      navigate: jasmine.createSpy('navigate')
    };

    // Inicializar el storage mock
    mockStorage = {};
    
    // Mock del localStorage
    spyOn(localStorage, 'getItem').and.callFake(key => mockStorage[key]);
    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      mockStorage[key] = value;
    });
    spyOn(localStorage, 'removeItem').and.callFake(key => {
      delete mockStorage[key];
    });

    // Mock de Swal.fire
    spyOn(Swal, 'fire').and.callFake(() =>
      Promise.resolve({ isConfirmed: true } as SweetAlertResult)
    );

    // Mock de performance.now
    spyOn(performance, 'now').and.returnValues(100, 120);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    (localStorage.removeItem as jasmine.Spy).calls.reset();
    (localStorage.setItem as jasmine.Spy).calls.reset();
    (localStorage.getItem as jasmine.Spy).calls.reset();
    (router.navigate as jasmine.Spy).calls.reset();
    (Swal.fire as jasmine.Spy).calls.reset();
    (performance.now as jasmine.Spy).calls.reset();
    httpMock.verify();
  });

  describe('Authentication', () => {
    it('should handle successful signup', () => {
      //Arrange
      const signUpResponse = {
        success: true,
        token: 'mock-token',
        user: mockUser
      };

      //Act
      service.signUp(mockUser).subscribe(success => {
        //Assert
        expect(success).toBe(true);
        //Assert
        expect(service.authToken).toBe('mock-token');
      });

      const signUpReq = httpMock.expectOne(`${environment.backendUrl}/auth/sign-up`);
      //Assert
      expect(signUpReq.request.method).toBe('POST');
      signUpReq.flush(signUpResponse);

      const userReq = httpMock.expectOne(`${environment.backendUrl}/users/by-email/${mockUser.email}`);
      //Assert
      expect(userReq.request.method).toBe('GET');
      userReq.flush(mockUser);
    });

    it('should handle failed signup with empty fields', () => {
      //Arrange
      const invalidUser = { ...mockUser, username: '', email: '', password: '' };
      //Act
      service.signUp(invalidUser).subscribe(success => {
        //Assert
        expect(success).toBe(false);
      });
    });

    it('should handle successful login', () => {
      //Arrange
      const loginResponse = {
        success: true,
        token: 'mock-token',
        user: mockUser
      };

      //Act
      service.logIn({ 
        email: mockUser.email, 
        password: mockUser.password 
      }).subscribe(success => {
        //Assert
        expect(success).toBe(true);
        //Assert
        expect(service.authToken).toBe('mock-token');
        //Assert
        expect(service.currentUser).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/auth/login`);
      //Assert
      expect(req.request.method).toBe('POST');
      req.flush(loginResponse);
    });

    it('should handle failed login with empty credentials', () => {
      //Arrange
      service.logIn({ email: '', password: '' }).subscribe(success => { //Act
        //Assert
        expect(success).toBe(false);
      });
    });

    it('should handle logOut', () => {
      //Arrange
      mockStorage[CURRENT_USER_KEY] = JSON.stringify(mockUser);
      mockStorage[TOKEN_KEY] = 'mock-token';
      
      //Act
      service.logOut();

      //Assert
      expect(service.currentUser).toBeNull();
      //Assert
      expect(Object.keys(mockStorage).length).toBe(0);
      //Assert
      expect(router.navigate).toHaveBeenCalledWith(['/log-in']);
      //Assert
      expect(Swal.fire).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'info',
          title: 'Sesión cerrada',
          text: 'Has cerrado sesión correctamente.',
          confirmButtonText: 'Aceptar'
        })
      );
      //Assert
      expect(performance.now).toHaveBeenCalledTimes(2);
    });
  });

  describe('User Management', () => {
    it('should manage currentUser in localStorage', () => {
      //Arrange
      service.currentUser = mockUser;
      //Assert
      expect(service.currentUser).toEqual(mockUser);
      //Assert
      expect(mockStorage[CURRENT_USER_KEY]).toBe(JSON.stringify(mockUser));

      //Act
      service.currentUser = null;
      //Assert
      expect(service.currentUser).toBeNull();
      //Assert
      expect(mockStorage[CURRENT_USER_KEY]).toBeUndefined();
    });

    it('should check authentication status', () => {
      //Assert
      expect(service.isAuthenticated()).toBe(false);

      //Act
      service.currentUser = mockUser;
      service.authToken = 'mock-token';

      //Assert
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should find user by ID', () => {
      //Arrange
      service.findOne(mockUser.id!).subscribe(user => { //Act
        //Assert
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/${mockUser.id}`);
      //Assert
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error when finding user by ID', () => {
      //Arrange
      service.findOne('invalid-id').subscribe(user => { //Act
        //Assert
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/invalid-id`);
      req.error(new ErrorEvent('404 Not Found'));
    });

    it('should find user by email', () => {
      //Arrange
      service.findByEmail(mockUser.email).subscribe(user => { //Act
        //Assert
        expect(user).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/by-email/${mockUser.email}`);
      //Assert
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });

    it('should handle error when finding user by email', () => {
      //Arrange
      service.findByEmail('invalid@email.com').subscribe(user => { //Act
        //Assert
        expect(user).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/by-email/invalid@email.com`);
      req.error(new ErrorEvent('404 Not Found'));
    });

    it('should update user', () => {
      //Arrange
      const updateData = { premium: true };

      service.updateUser(mockUser.id!, updateData).subscribe(user => { //Act
        //Assert
        expect(user).toBeTruthy();
        //Assert
        expect(user?.premium).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/${mockUser.id}`);
      //Assert
      expect(req.request.method).toBe('PUT');
      req.flush({ ...mockUser, ...updateData });
    });

    it('should update user premium status', () => {
      //Arrange
      service.currentUser = mockUser;

      service.updateUserPremiumStatus(mockUser.email, true).subscribe(success => { //Act
        //Assert
        expect(success).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/${mockUser.id}`);
      //Assert
      expect(req.request.method).toBe('PUT');
      req.flush({ ...mockUser, premium: true });
    });

    it('should not update premium status without current user', () => {
      //Arrange
      service.currentUser = null;

      service.updateUserPremiumStatus(mockUser.email, true).subscribe(success => { //Act
        //Assert
        expect(success).toBe(false);
      });
    });

    it('should get all other users except current user', () => {
      //Arrange
      const otherUsers: User[] = [
        { ...mockUser, id: '2', username: 'user2' },
        { ...mockUser, id: '3', username: 'user3' }
      ];

      service.getAllOtherUsers('2').subscribe(users => { //Act
        //Assert
        expect(users.length).toBe(1);
        //Assert
        expect(users[0].id).toBe('3');
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users`);
      //Assert
      expect(req.request.method).toBe('GET');
      req.flush(otherUsers);
    });

    it('should handle error when getting all users', () => {
      //Arrange
      service.getAllOtherUsers('1').subscribe(users => { //Act
        //Assert
        expect(users).toEqual([]);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users`);
      req.error(new ErrorEvent('Network error'));
    });

    it('should toggle follow status', () => {
      //Arrange
      service.currentUser = mockUser;
      const targetEmail = 'other@example.com';

      service.toggleFollow(targetEmail, true).subscribe(success => { //Act
        //Assert
        expect(success).toBe(true);
      });

      const req = httpMock.expectOne(`${environment.backendUrl}/users/${mockUser.id}/follow`);
      //Assert
      expect(req.request.method).toBe('PUT');
      //Assert
      expect(req.request.body).toEqual({
        targetEmail,
        follow: true
      });
      req.flush({ ...mockUser, following: [...(mockUser.following || []), targetEmail] });
    });

    it('should not toggle follow without current user', () => {
      //Arrange
      service.currentUser = null;

      service.toggleFollow('other@example.com', true).subscribe(success => { //Act
        //Assert
        expect(success).toBe(false);
      });
    });
  });
});
