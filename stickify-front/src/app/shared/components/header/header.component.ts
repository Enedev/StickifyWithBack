import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() searchInputChanged = new EventEmitter<string>();

  onInputChange(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchInputChanged.emit(searchTerm);
  }
}