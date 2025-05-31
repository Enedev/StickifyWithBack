import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { PremiumPaymentComponent } from '../../shared/components/premium-payment/premium-payment.component';
import { CommonModule } from '@angular/common';
import { User } from '../../shared/interfaces/user.interface'; // Import User interface

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, PremiumPaymentComponent, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.css'
})
export class SignUpComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isPremium = false;
  showPremiumModal = false;

  registryForm = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    repeatPassword: ['', [Validators.required]]
  });

  async openPremiumModal(): Promise<void> {
    if (this.registryForm.invalid) {
      await Swal.fire({
        title: "Completa el formulario",
        text: "Por favor completa todos los campos antes de seleccionar premium",
        icon: "warning",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });
      return;
    }

    if (this.isPremium) {
      const result = await Swal.fire({
        title: "¿Ya eres Premium?",
        text: "Ya has activado el modo Premium. ¿Quieres volver a introducir la información de pago?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, volver a introducir",
        cancelButtonText: "No, continuar",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });

      if (result.isConfirmed) {
        this.showPremiumModal = true;
      } else {
        return;
      }
    } else {
      this.showPremiumModal = true;
    }
  }

  closePremiumModal(isConfirmed: boolean): void {
    this.isPremium = isConfirmed;
    this.showPremiumModal = false;

    if (isConfirmed) {
      Swal.fire({
        title: "¡Premium activado!",
        text: "Continúa con tu registro para completar el proceso",
        icon: "success",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });
    }
  }

  async onRegistry(): Promise<void> {
    if (this.registryForm.invalid) {
      await Swal.fire({
        title: "Error",
        text: "Por favor complete todos los campos correctamente",
        icon: "error",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });
      return;
    }

    const { username, email, password, repeatPassword } = this.registryForm.getRawValue();

    if (password !== repeatPassword) {
      await Swal.fire({
        title: "Error",
        text: "Las contraseñas no coinciden",
        icon: "error",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });
      return;
    }

    if (!this.isPremium) {
      const result = await Swal.fire({
        title: "¿Estás seguro?",
        text: "No has activado el modo Premium. ¿Quieres registrarte sin acceso a las funciones Premium?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, registrarme sin Premium",
        cancelButtonText: "Cancelar",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });

      if (!result.isConfirmed) {
        return;
      }
    }

    const userData: User = {
      username,
      email,
      password,
      premium: this.isPremium
    };

    this.authService.signUp(userData).subscribe({
      next: async (success) => {
        if (success) {
          await Swal.fire({
            title: "Éxito",
            text: `Registro exitoso! ${this.isPremium ? 'Eres usuario Premium.' : ''} Redirigiendo...`,
            icon: "success",
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
          this.router.navigate(['/log-in']);
        } else {
          // This else block might be hit if the service's catchError emits 'false'
          // This generic message covers cases not specifically caught by HTTP error.
          await Swal.fire({
            title: "Error",
            text: "Error en el registro. Por favor intente nuevamente.",
            icon: "error",
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
        }
      },
      error: async (err) => {
        // Handle specific HTTP errors from the backend
        console.error('Sign-up component error:', err);
        let errorMessage = "Error en el registro. Por favor intente nuevamente.";

        // Check if the error object has a detail property (from BadRequestException)
        if (err.error && err.error.detail) {
          errorMessage = err.error.detail;
          // You can add more specific error checks if your backend sends specific codes
          if (err.status === 400 && err.error.code === '23505') { // Example: PostgreSQL unique violation code
            errorMessage = "Este correo electrónico ya está registrado.";
          }
        } else if (err.message) {
            errorMessage = err.message;
        }

        await Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error",
          color: "#716add",
          backdrop: `rgba(0,0,123,0.4) left top no-repeat`
        });
      }
    });
  }
}