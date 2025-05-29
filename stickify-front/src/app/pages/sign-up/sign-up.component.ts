import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { PremiumPaymentComponent } from '../../shared/components/premium-payment/premium-payment.component';
import { CommonModule } from '@angular/common';

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

    // New logic: Warn if not premium
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
        // User cancelled, so do not proceed with registration
        return;
      }
    }

    const userData = {
      username,
      email,
      password,
      premium: this.isPremium || undefined
    };

    const success = this.authService.signUp(userData);

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
      const users = this.authService.users;
      if (users.some(user => user.email === email)) {
        await Swal.fire({
          title: "Error",
          text: "Este correo electrónico ya está registrado",
          icon: "error",
          color: "#716add",
          backdrop: `rgba(0,0,123,0.4) left top no-repeat`
        });
      } else {
        await Swal.fire({
          title: "Error",
          text: "Error en el registro. Por favor intente nuevamente.",
          icon: "error",
          color: "#716add",
          backdrop: `rgba(0,0,123,0.4) left top no-repeat`
        });
      }
    }
  }
}