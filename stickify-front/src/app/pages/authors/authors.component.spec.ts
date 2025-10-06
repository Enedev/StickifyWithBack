import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthorsComponent } from './authors.component';

import { MusicService } from '../../services/music.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Subscription } from 'rxjs';

describe('AuthorsComponent', () => {
  let component: AuthorsComponent;
  let fixture: ComponentFixture<AuthorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthorsComponent, HttpClientTestingModule, RouterTestingModule]
    }).compileComponents();

    // Arrange (configuración e inicialización común para todos los tests)
    fixture = TestBed.createComponent(AuthorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {

    // Assert
    expect(component).toBeTruthy();
  });

  it('should subscribe and set authors on init', () => {
    
    // Act
    component.ngOnInit();
    
     // Assert
    expect(Array.isArray(component.authors)).toBeTrue();
  });

  it('should unsubscribe on destroy', () => {
    // Arrange
    const sub = new Subscription();
    component['artistsSubscription'] = sub;
    spyOn(sub, 'unsubscribe');

    // Act
    component.ngOnDestroy();

    // Assert
    expect(sub.unsubscribe).toHaveBeenCalled();
  });
});
