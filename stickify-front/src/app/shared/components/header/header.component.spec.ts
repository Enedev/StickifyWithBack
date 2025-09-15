import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit searchInputChanged event on input change', () => {
    spyOn(component.searchInputChanged, 'emit');
    const mockEvent = { target: { value: 'test search' } } as any;
    component.onInputChange(mockEvent);
    expect(component.searchInputChanged.emit).toHaveBeenCalledWith('test search');
  });
});
