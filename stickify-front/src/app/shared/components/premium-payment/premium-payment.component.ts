import { Component, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import Swal from 'sweetalert2';

@Component({
  selector: 'app-premium-payment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './premium-payment.component.html',
  styleUrls: ['./premium-payment.component.css']
})
export class PremiumPaymentComponent {
  cardNumber = '';
  expiryDate = '';
  cvv = '';
  cardHolder = '';

  @Output() closeModal = new EventEmitter<boolean>();

  async submitPayment(): Promise<void> {
    if (this.cardNumber && this.expiryDate && this.cvv && this.cardHolder) {
       await Swal.fire({
        title: "¡Pago exitoso!",
        text: "Ahora eres usuario Premium",
        icon: "success",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });
      this.closeModal.emit(true);
    } else {
      await Swal.fire({
        title: "Error",
        text: "Por favor complete todos los campos de pago",
        icon: "error",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });
    }
  }

  cancelPayment(): void {
    this.closeModal.emit(false);
  }
}