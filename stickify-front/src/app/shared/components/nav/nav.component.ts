import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FilterComponent } from '../filter/filter.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, FilterComponent, CommonModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css'
})
export class NavComponent {
  @Output() filterChanged = new EventEmitter<any>();
  isHomePage: boolean = false;
  public authService: AuthService;
  private router: Router;

  constructor() {
    const startTime = performance.now(); // Cuantitativa: inicio de medición

    this.authService = inject(AuthService);
    this.router = inject(Router);

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.isHomePage = event.urlAfterRedirects === '/home';
        console.log(`[Cualitativa] Navegación detectada: ${event.urlAfterRedirects}`);
        console.log(`[Cualitativa] ¿Es página de inicio?: ${this.isHomePage}`);
      }
    });

    const duration = performance.now() - startTime;
    console.log(`[Cuantitativa] Tiempo de inicialización del constructor: ${duration.toFixed(2)} ms`);
  }


  onFilterChange(filters: any) {
    this.filterChanged.emit(filters);
  }

  logout(): void {
    this.authService.logOut();
  }
}
