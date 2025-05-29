import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.css']
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 20;
  @Output() pageChanged = new EventEmitter<number>();

  totalPagesArray: number[] = [];
  currentPage: number = 1;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['totalItems'] || changes['itemsPerPage']) {
      this.updatePagination();
    }
  }

  private updatePagination(): void {
    const totalPages = Math.max(1, Math.ceil(this.totalItems / this.itemsPerPage));
    this.totalPagesArray = Array.from({ length: totalPages }, (_, i) => i + 1);
    if (this.currentPage > totalPages) {
      this.currentPage = 1;
      this.pageChanged.emit(this.currentPage);
    }
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPagesArray.length && page !== this.currentPage) {
      this.currentPage = page;
      this.pageChanged.emit(this.currentPage);
    }
  }
}