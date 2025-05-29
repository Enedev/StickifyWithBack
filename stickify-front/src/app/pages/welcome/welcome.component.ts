import { AfterViewInit, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { WelcomeHeaderComponent } from '../../shared/components/welcome-header/welcome-header.component';
import { WelcomeFooterComponent } from '../../shared/components/welcome-footer/welcome-footer.component';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, WelcomeHeaderComponent, WelcomeFooterComponent],
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements AfterViewInit {

  ngAfterViewInit(): void {
    const exploreButton = document.querySelector('.button[href="#"]');

    if (exploreButton) {
      exploreButton.addEventListener('click', (e) => {
        e.preventDefault();

        const nextSection = document.querySelector('.features');
        if (nextSection) {
          window.scrollTo({
            top: nextSection.getBoundingClientRect().top + window.scrollY - 50,
            behavior: 'smooth'
          });
        }
      });
    }
  }
}