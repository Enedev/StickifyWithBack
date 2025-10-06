import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    //Arrange
    const fixture = TestBed.createComponent(AppComponent);
    //Act
    const app = fixture.componentInstance;
    //Assert
    expect(app).toBeTruthy();
  });

  it(`should have the 'stickify-app' title`, () => {
    //Arrange
    const fixture = TestBed.createComponent(AppComponent);
    //Act
    const app = fixture.componentInstance;
    //Assert
    expect(app.title).toEqual('stickify-app');
  });
});
