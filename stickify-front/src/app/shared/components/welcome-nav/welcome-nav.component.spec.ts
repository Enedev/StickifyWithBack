import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeNavComponent } from './welcome-nav.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('WelcomeNavComponent', () => {
  let component: WelcomeNavComponent;
  let fixture: ComponentFixture<WelcomeNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WelcomeNavComponent, RouterTestingModule]
    }).compileComponents();
    fixture = TestBed.createComponent(WelcomeNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //Assert
    expect(component).toBeTruthy();
  });
});
