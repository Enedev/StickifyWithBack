import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeHeaderComponent } from './welcome-header.component';
import { WelcomeNavComponent } from '../welcome-nav/welcome-nav.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('WelcomeHeaderComponent', () => {
  let component: WelcomeHeaderComponent;
  let fixture: ComponentFixture<WelcomeHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeHeaderComponent, WelcomeNavComponent, RouterTestingModule]
    }).compileComponents();
    fixture = TestBed.createComponent(WelcomeHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //Assert
    expect(component).toBeTruthy();
  });
});
