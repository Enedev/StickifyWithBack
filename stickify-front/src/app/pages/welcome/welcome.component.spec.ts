import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WelcomeComponent } from './welcome.component';
import { WelcomeHeaderComponent } from '../../shared/components/welcome-header/welcome-header.component';
import { WelcomeFooterComponent } from '../../shared/components/welcome-footer/welcome-footer.component';
import { RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        WelcomeComponent,
        RouterLink,
        WelcomeHeaderComponent,
        WelcomeFooterComponent
      ],
      providers: [
        { provide: ActivatedRoute, useValue: {} }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should attach click listener to .button[href="#"] and scroll to .features', () => {
    // Simula los elementos y el comportamiento sin depender del DOM real
    const buttonMock = { addEventListener: jasmine.createSpy('addEventListener') };
    const featuresMock = { getBoundingClientRect: () => ({ top: 300 }), className: 'features' };
    spyOn(document, 'querySelector').and.callFake((selector: string) => {
      if (selector === '.button[href="#"]') return buttonMock as any;
      if (selector === '.features') return featuresMock as any;
      return null;
    });
    const scrollSpy = spyOn(window, 'scrollTo').and.callFake(() => {});

    fixture.detectChanges();
    component.ngAfterViewInit();

    // Simula el click llamando manualmente el callback registrado
    expect(buttonMock.addEventListener).toHaveBeenCalledWith('click', jasmine.any(Function));
    const clickHandler = buttonMock.addEventListener.calls.mostRecent().args[1];
    // Simula el evento click
    clickHandler({ preventDefault: () => {} });

    const expectedTop = 300 + window.scrollY - 50;
    expect(scrollSpy).toHaveBeenCalled();
    const callArgs = scrollSpy.calls.mostRecent().args[0];
    expect(callArgs).toEqual(jasmine.objectContaining({
      top: expectedTop,
      behavior: 'smooth'
    }));
  });


  it('should not throw if .button[href="#"] is missing', () => {
    expect(() => component.ngAfterViewInit()).not.toThrow();
  });

  it('should not scroll if .features section is missing', () => {
    const button = document.createElement('a');
    button.className = 'button';
    button.setAttribute('href', '#');
    document.body.appendChild(button);

    const scrollSpy = spyOn(window, 'scrollTo').and.callFake(() => {});

    fixture.detectChanges();
    component.ngAfterViewInit();
    button.click();

    expect(scrollSpy).not.toHaveBeenCalled();

    document.body.removeChild(button);
  });
});
