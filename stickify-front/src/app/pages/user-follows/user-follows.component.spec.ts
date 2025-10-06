import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFollowsComponent } from './user-follows.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError, Subscription } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { User } from '../../shared/interfaces/user.interface';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import Swal from 'sweetalert2';

// Mocks
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  username: 'testuser',
  password: 'testpass',
  premium: false,
  followers: [],
  following: []
};

const mockOtherUsers: User[] = [
  { ...mockUser, id: '2', email: 'other@example.com', username: 'otheruser' }
];

describe('UserFollowsComponent', () => {
  let component: UserFollowsComponent;
  let fixture: ComponentFixture<UserFollowsComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AuthService', ['getAllOtherUsers'], { currentUser: mockUser });
    spy.getAllOtherUsers.and.returnValue(of(mockOtherUsers));

    await TestBed.configureTestingModule({
      imports: [UserFollowsComponent, HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserFollowsComponent);
    component = fixture.componentInstance;
    authServiceSpy = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    fixture.detectChanges();
  });

  beforeEach(() => {
    spyOn(Swal, 'fire'); // evita abrir modales reales
  });

  it('should create', () => {
    // Assert
    expect(component).toBeTruthy();
  });

  it('should call loadAllOtherUsers on init', () => {
    // Arrange
    // spy
    spyOn(component as any, 'loadAllOtherUsers');
    component.currentUser = mockUser;
    // Act
    component.ngOnInit();
    // Assert
    expect((component as any).loadAllOtherUsers).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    // Arrange
    const sub = new Subscription();
    component['usersSubscription'] = sub;
    // spy
    spyOn(sub, 'unsubscribe');
    // Act
    component.ngOnDestroy();
    // Assert
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('should filter users by searchTerm', () => {
    // Arrange
    component.allUsers = mockOtherUsers;
    component.searchTerm = 'other';
    // Act
    component.applyFilter();
    // Assert
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].username).toBe('otheruser');
  });

  it('should return true if currentUser is following user', () => {
    // Arrange
    component.currentUser = { ...mockUser, following: ['other@example.com'] };
    // Act
    const user = { ...mockUser, email: 'other@example.com' };
    // Assert
    expect(component.isFollowing(user)).toBeTrue();
  });

  it('should return false if currentUser is not following user', () => {
    // Arrange
    component.currentUser = { ...mockUser, following: [] };
    // Act
    const user = { ...mockUser, email: 'other@example.com' };
    // Assert
    expect(component.isFollowing(user)).toBeFalse();
  });

  it('should warn if no user is logged in on init', () => {
    // Arrange
    // Restablecer el componente
    fixture = TestBed.createComponent(UserFollowsComponent);
    component = fixture.componentInstance;
    
    // Configurar el spy para currentUser como null
    Object.defineProperty(authServiceSpy, 'currentUser', {
      get: () => null
    });
    
    // Espiar console.warn
    // spy
    spyOn(console, 'warn');
    
    // Llamar a ngOnInit manualmente
    // Act
    component.ngOnInit();
    
    // Assert
    expect(console.warn).toHaveBeenCalledWith(
      'No user logged in or user ID is missing. Cannot display follow page.'
    );
  });

  it('should not load other users if currentUser id is missing', () => {
    // Arrange
    spyOn(console, 'error');
    component.currentUser = { ...mockUser, id: '' };
    // Act
    (component as any).loadAllOtherUsers();
    // Assert
    expect(console.error).toHaveBeenCalledWith(
      'Cannot load other users: currentUser ID is missing.'
    );
  });

  it('should show Swal error if getAllOtherUsers fails', () => {
    // Arrange
    authServiceSpy.getAllOtherUsers.and.returnValue(throwError(() => new Error('fail')));
    component.currentUser = mockUser;
    // Act
    (component as any).loadAllOtherUsers();
    // Assert
    expect(Swal.fire).toHaveBeenCalledWith(
      jasmine.objectContaining({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los usuarios. Por favor, inténtalo de nuevo.',
        confirmButtonText: 'Entendido'
      })
    );
  });

  it('should show all users if searchTerm is empty', () => {
    // Arrange
    component.allUsers = mockOtherUsers;
    component.searchTerm = '';
    // Act
    component.applyFilter();
    // Assert
    expect(component.filteredUsers.length).toBe(1);
  });

  it('should not toggle follow if currentUser id is missing', () => {
    // Arrange
    spyOn(console, 'error');
    component.currentUser = { ...mockUser, id: '' };
    // Act
    component.toggleFollow(mockOtherUsers[0]);
    // Assert
    expect(console.error).toHaveBeenCalledWith('No user logged in. Cannot perform follow action.');
  });

  it('should show success Swal when following a user', () => {
    // Arrange
    authServiceSpy.toggleFollow = jasmine.createSpy().and.returnValue(of(true));
    component.currentUser = mockUser;
    // Act
    component.toggleFollow(mockOtherUsers[0]);
    // Assert
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      title: 'Éxito',
      text: 'Ahora sigues a otheruser'
    }));
  });

  it('should show success Swal when unfollowing a user', () => {
    // Arrange
    authServiceSpy.toggleFollow = jasmine.createSpy().and.returnValue(of(true));
    component.currentUser = { ...mockUser, following: ['other@example.com'] };
    // Act
    component.toggleFollow(mockOtherUsers[0]);
    // Assert
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      text: 'Has dejado de seguir a otheruser'
    }));
  });

  it('should show error Swal when toggleFollow returns false', () => {
    // Arrange
    authServiceSpy.toggleFollow = jasmine.createSpy().and.returnValue(of(false));
    component.currentUser = mockUser;
    // Act
    component.toggleFollow(mockOtherUsers[0]);
    // Assert
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error'
    }));
  });

  it('should show error Swal when toggleFollow throws error', () => {
    // Arrange
    authServiceSpy.toggleFollow = jasmine.createSpy().and.returnValue(throwError(() => new Error('fail')));
    component.currentUser = mockUser;
    // Act
    component.toggleFollow(mockOtherUsers[0]);
    // Assert
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error'
    }));
  });

  it('should unsubscribe toggleFollowSubscription on destroy', () => {
    // Arrange
    const sub = new Subscription();
    component['toggleFollowSubscription'] = sub;
    // spy
    spyOn(sub, 'unsubscribe');
    // Act
    component.ngOnDestroy();
    // Assert
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('should handle error in loadAllOtherUsers', () => {
    // Arrange
    authServiceSpy.getAllOtherUsers.and.returnValue(throwError(() => new Error('Error loading users')));
    // spy
    spyOn(console, 'error');

    // Act
    (component as any).loadAllOtherUsers();

    // Assert
    expect(console.error).toHaveBeenCalledWith('Error loading other users:', jasmine.any(Error));
    expect(component.allUsers).toEqual([]); // Asegurar que allUsers esté vacío después del error
  });

  it('should handle empty searchTerm in applyFilter', () => {
    // Arrange
    component.allUsers = mockOtherUsers;
    component.searchTerm = '';
    // Act
    component.applyFilter();
    // Assert
    expect(component.filteredUsers.length).toBe(mockOtherUsers.length);
  });

  it('should handle no matches in applyFilter', () => {
    // Arrange
    component.allUsers = mockOtherUsers;
    component.searchTerm = 'nonexistent';
    // Act
    component.applyFilter();
    // Assert
    expect(component.filteredUsers.length).toBe(0);
  });

  it('should return false in isFollowing for invalid user', () => {
    // Arrange
    component.currentUser = { ...mockUser, following: ['other@example.com'] };
    // Act
    const invalidUser = null as unknown as User; // Simular usuario inválido
    // Assert
    expect(component.isFollowing(invalidUser)).toBeFalse();
  });

  it('should call getAllOtherUsers from AuthService', () => {
    // Act
    (component as any).loadAllOtherUsers();
    // Assert
    expect(authServiceSpy.getAllOtherUsers).toHaveBeenCalled();
  });
});

