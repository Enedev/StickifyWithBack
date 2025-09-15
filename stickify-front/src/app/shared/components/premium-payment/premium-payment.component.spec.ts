import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PremiumPaymentComponent } from './premium-payment.component';
import Swal from 'sweetalert2';

describe('PremiumPaymentComponent', () => {
  let component: PremiumPaymentComponent;
  let fixture: ComponentFixture<PremiumPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremiumPaymentComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(PremiumPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit true and show success on valid payment', async () => {
  spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    spyOn(component.closeModal, 'emit');
    component.cardNumber = '1234';
    component.expiryDate = '12/25';
    component.cvv = '123';
    component.cardHolder = 'Test User';
    await component.submitPayment();
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'success' }));
    expect(component.closeModal.emit).toHaveBeenCalledWith(true);
  });

  it('should show error and not emit on invalid payment', async () => {
  spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false } as any));
    spyOn(component.closeModal, 'emit');
    component.cardNumber = '';
    component.expiryDate = '';
    component.cvv = '';
    component.cardHolder = '';
    await component.submitPayment();
    expect(Swal.fire).toHaveBeenCalledWith(jasmine.objectContaining({ icon: 'error' }));
    expect(component.closeModal.emit).not.toHaveBeenCalled();
  });

  it('should emit false on cancelPayment', () => {
    spyOn(component.closeModal, 'emit');
    component.cancelPayment();
    expect(component.closeModal.emit).toHaveBeenCalledWith(false);
  });
});
