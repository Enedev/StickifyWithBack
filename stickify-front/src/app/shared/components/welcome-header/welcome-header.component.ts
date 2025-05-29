import { Component } from '@angular/core';
import { WelcomeNavComponent } from '../welcome-nav/welcome-nav.component';

@Component({
  selector: 'app-welcome-header',
  standalone: true,
  imports: [WelcomeNavComponent],
  templateUrl: './welcome-header.component.html',
  styleUrls: ['./welcome-header.component.css']
})
export class WelcomeHeaderComponent { }