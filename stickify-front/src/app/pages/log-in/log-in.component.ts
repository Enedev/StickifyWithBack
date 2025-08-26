import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { User } from '../../shared/interfaces/user.interface'; // Import User interface

@Component({
  selector: 'app-log-in',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  async onLogin(): Promise<void> {

    console.log('[Métrica cualitativa] Intento de login iniciado');

    const startTime = performance.now(); // Cuantitativa: medir duración
    if (this.loginForm.invalid) {
      await Swal.fire({
        title: "Error",
        text: "Por favor complete todos los campos correctamente",
        icon: "error",
        color: "#716add",
        backdrop: `rgba(0,0,123,0.4) left top no-repeat`
      });
      return;
    }

    const credentials: Pick<User, 'email' | 'password'> = {
      email: this.loginForm.value.email!,
      password: this.loginForm.value.password!
    };

    console.log('[Métrica cualitativa] Credenciales capturadas:', credentials);

    this.authService.logIn(credentials).subscribe({
      next: async (success) => {

        const duration = performance.now() - startTime;
        console.log(`[Métrica cuantitativa] Tiempo de respuesta: ${duration.toFixed(2)} ms`);
        if (success) {
          await Swal.fire({
            title: "Éxito",
            text: "Inicio de sesión exitoso!",
            icon: "success",
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
          this.router.navigate(['/home']);
        } else {
          console.log('[Métrica cualitativa] Login fallido: credenciales inválidas');
          // This else block might be hit if the service's catchError emits 'false'
          await Swal.fire({
            title: "Error",
            text: "Credenciales inválidas. Por favor verifique su correo y contraseña.",
            icon: "error",
            color: "#716add",
            backdrop: `rgba(0,0,123,0.4) left top no-repeat`
          });
        }
      },
      error: async (err) => {

        const duration = performance.now() - startTime;
        console.log(`[Métrica cuantitativa] Tiempo hasta error: ${duration.toFixed(2)} ms`);
        // Handle specific HTTP errors from the backend
        console.error('Login component error:', err);
        let errorMessage = "Error en el inicio de sesión. Por favor intente nuevamente.";

        if (err.status === 404 && err.error && err.error.detail === 'Invalid credentials') {
          errorMessage = "Correo electrónico o contraseña incorrectos.";
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