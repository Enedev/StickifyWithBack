import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();
    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update pagination on changes', () => {
    component.totalItems = 40;
    component.itemsPerPage = 10;
    component.ngOnChanges({ totalItems: { currentValue: 40, previousValue: 0, firstChange: false, isFirstChange: () => false }, itemsPerPage: { currentValue: 10, previousValue: 20, firstChange: false, isFirstChange: () => false } });
    expect(component.totalPagesArray).toEqual([1,2,3,4]);
  });

  it('should emit pageChanged when changing page', () => {
    spyOn(component.pageChanged, 'emit');
    component.totalItems = 40;
    component.itemsPerPage = 10;
    component.ngOnChanges({ totalItems: { currentValue: 40, previousValue: 0, firstChange: false, isFirstChange: () => false }, itemsPerPage: { currentValue: 10, previousValue: 20, firstChange: false, isFirstChange: () => false } });
    component.changePage(2);
    expect(component.currentPage).toBe(2);
    expect(component.pageChanged.emit).toHaveBeenCalledWith(2);
  });

  it('should not emit pageChanged if page is invalid or same', () => {
    spyOn(component.pageChanged, 'emit');
    component.totalItems = 40;
    component.itemsPerPage = 10;
    component.ngOnChanges({ totalItems: { currentValue: 40, previousValue: 0, firstChange: false, isFirstChange: () => false }, itemsPerPage: { currentValue: 10, previousValue: 20, firstChange: false, isFirstChange: () => false } });
    component.changePage(1); // same page
    expect(component.pageChanged.emit).not.toHaveBeenCalled();
    component.changePage(0); // invalid page
    expect(component.pageChanged.emit).not.toHaveBeenCalled();
    component.changePage(5); // invalid page
    expect(component.pageChanged.emit).not.toHaveBeenCalled();
  });

  it('should reset currentPage and emit when currentPage > totalPages', () => {
    spyOn(component.pageChanged, 'emit');
    component.totalItems = 10;
    component.itemsPerPage = 10;
    component.currentPage = 5;
    component.ngOnChanges({ totalItems: { currentValue: 10, previousValue: 40, firstChange: false, isFirstChange: () => false } });
    expect(component.currentPage).toBe(1);
    expect(component.pageChanged.emit).toHaveBeenCalledWith(1);
  });
});
