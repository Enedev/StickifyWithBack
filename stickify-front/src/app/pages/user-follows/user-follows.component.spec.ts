import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFollowsComponent } from './user-follows.component';
import { AuthService } from '../../services/auth.service';
import { of, throwError, Subscription } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { User } from '../../shared/interfaces/user.interface';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import Swal from 'sweetalert2';

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
    expect(component).toBeTruthy();
  });

  it('should call loadAllOtherUsers on init', () => {
    spyOn(component as any, 'loadAllOtherUsers');
    component.currentUser = mockUser;
    component.ngOnInit();
    expect((component as any).loadAllOtherUsers).toHaveBeenCalled();
  });

  it('should unsubscribe on destroy', () => {
    const sub = new Subscription();
    component['usersSubscription'] = sub;
    spyOn(sub, 'unsubscribe');
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('should filter users by searchTerm', () => {
    component.allUsers = mockOtherUsers;
    component.searchTerm = 'other';
    component.applyFilter();
    expect(component.filteredUsers.length).toBe(1);
    expect(component.filteredUsers[0].username).toBe('otheruser');
  });

  it('should return true if currentUser is following user', () => {
    component.currentUser = { ...mockUser, following: ['other@example.com'] };
    const user = { ...mockUser, email: 'other@example.com' };
    expect(component.isFollowing(user)).toBeTrue();
  });

  it('should return false if currentUser is not following user', () => {
    component.currentUser = { ...mockUser, following: [] };
    const user = { ...mockUser, email: 'other@example.com' };
    expect(component.isFollowing(user)).toBeFalse();
  });

  it('should warn if no user is logged in on init', () => {
    // Restablecer el componente
    fixture = TestBed.createComponent(UserFollowsComponent);
    component = fixture.componentInstance;
    
    // Configurar el spy para currentUser como null
    Object.defineProperty(authServiceSpy, 'currentUser', {
      get: () => null
    });
    
    // Espiar console.warn
    spyOn(console, 'warn');
    
    // Llamar a ngOnInit manualmente
    component.ngOnInit();
    
    expect(console.warn).toHaveBeenCalledWith(
      'No user logged in or user ID is missing. Cannot display follow page.'
    );
  });

  it('should not load other users if currentUser id is missing', () => {
    spyOn(console, 'error');
    component.currentUser = { ...mockUser, id: '' };
    (component as any).loadAllOtherUsers();
    expect(console.error).toHaveBeenCalledWith(
      'Cannot load other users: currentUser ID is missing.'
    );
  });

  it('should show Swal error if getAllOtherUsers fails', () => {
    authServiceSpy.getAllOtherUsers.and.returnValue(throwError(() => new Error('fail')));
    component.currentUser = mockUser;
    (component as any).loadAllOtherUsers();
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
    component.allUsers = mockOtherUsers;
    component.searchTerm = '';
    component.applyFilter();
    expect(component.filteredUsers.length).toBe(1);
  });

  it('should not toggle follow if currentUser id is missing', () => {
    spyOn(console, 'error');
    component.currentUser = { ...mockUser, id: '' };
    component.toggleFollow(mockOtherUsers[0]);
    expect(console.error).toHaveBeenCalledWith('No user logged in. Cannot perform follow action.');
  });

  it('should show success Swal when following a user', () => {
    authServiceSpy.toggleFollow = jasmine.createSpy().and.returnValue(of(true));
    component.currentUser = mockUser;
    component.toggleFollow(mockOtherUsers[0]);
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      title: 'Éxito',
      text: 'Ahora sigues a otheruser'
    }));
  });

  it('should show success Swal when unfollowing a user', () => {
    authServiceSpy.toggleFollow = jasmine.createSpy().and.returnValue(of(true));
    component.currentUser = { ...mockUser, following: ['other@example.com'] };
    component.toggleFollow(mockOtherUsers[0]);
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'success',
      text: 'Has dejado de seguir a otheruser'
    }));
  });

  it('should show error Swal when toggleFollow returns false', () => {
    authServiceSpy.toggleFollow = jasmine.createSpy().and.returnValue(of(false));
    component.currentUser = mockUser;
    component.toggleFollow(mockOtherUsers[0]);
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error'
    }));
  });

  it('should show error Swal when toggleFollow throws error', () => {
    authServiceSpy.toggleFollow = jasmine.createSpy().and.returnValue(throwError(() => new Error('fail')));
    component.currentUser = mockUser;
    component.toggleFollow(mockOtherUsers[0]);
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({
      icon: 'error',
      title: 'Error'
    }));
  });

  it('should unsubscribe toggleFollowSubscription on destroy', () => {
    const sub = new Subscription();
    component['toggleFollowSubscription'] = sub;
    spyOn(sub, 'unsubscribe');
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
  });

  it('should handle error in loadAllOtherUsers', () => {
    authServiceSpy.getAllOtherUsers.and.returnValue(throwError(() => new Error('Error loading users')));
    spyOn(console, 'error');

    (component as any).loadAllOtherUsers();

    expect(console.error).toHaveBeenCalledWith('Error loading other users:', jasmine.any(Error));
    expect(component.allUsers).toEqual([]); // Asegurar que allUsers esté vacío después del error
  });

  it('should handle empty searchTerm in applyFilter', () => {
    component.allUsers = mockOtherUsers;
    component.searchTerm = '';
    component.applyFilter();
    expect(component.filteredUsers.length).toBe(mockOtherUsers.length);
  });

  it('should handle no matches in applyFilter', () => {
    component.allUsers = mockOtherUsers;
    component.searchTerm = 'nonexistent';
    component.applyFilter();
    expect(component.filteredUsers.length).toBe(0);
  });

  it('should return false in isFollowing for invalid user', () => {
    component.currentUser = { ...mockUser, following: ['other@example.com'] };
    const invalidUser = null as unknown as User; // Simular usuario inválido
    expect(component.isFollowing(invalidUser)).toBeFalse();
  });

  it('should call getAllOtherUsers from AuthService', () => {
    (component as any).loadAllOtherUsers();
    expect(authServiceSpy.getAllOtherUsers).toHaveBeenCalled();
  });
});

