import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome-nav',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './welcome-nav.component.html',
  styleUrls: ['./welcome-nav.component.css']
})
export class WelcomeNavComponent { }