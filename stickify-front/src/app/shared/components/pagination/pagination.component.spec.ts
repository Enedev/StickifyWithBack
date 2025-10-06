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
    //Assert
    expect(component).toBeTruthy();
  });

  it('should update pagination on changes', () => {
    //Arrange
    component.totalItems = 40;
    component.itemsPerPage = 10;
    //Act
    component.ngOnChanges({ totalItems: { currentValue: 40, previousValue: 0, firstChange: false, isFirstChange: () => false }, itemsPerPage: { currentValue: 10, previousValue: 20, firstChange: false, isFirstChange: () => false } });
    //Assert
    expect(component.totalPagesArray).toEqual([1,2,3,4]);
  });

  it('should emit pageChanged when changing page', () => {
    //Arrange
    spyOn(component.pageChanged, 'emit');
    component.totalItems = 40;
    component.itemsPerPage = 10;
    //Act
    component.ngOnChanges({ totalItems: { currentValue: 40, previousValue: 0, firstChange: false, isFirstChange: () => false }, itemsPerPage: { currentValue: 10, previousValue: 20, firstChange: false, isFirstChange: () => false } });
    component.changePage(2);
    //Assert
    expect(component.currentPage).toBe(2);
    //Assert
    expect(component.pageChanged.emit).toHaveBeenCalledWith(2);
  });

  it('should not emit pageChanged if page is invalid or same', () => {
    //Arrange
    spyOn(component.pageChanged, 'emit');
    component.totalItems = 40;
    component.itemsPerPage = 10;
    //Act
    component.ngOnChanges({ totalItems: { currentValue: 40, previousValue: 0, firstChange: false, isFirstChange: () => false }, itemsPerPage: { currentValue: 10, previousValue: 20, firstChange: false, isFirstChange: () => false } });
    component.changePage(1); // same page
    //Assert
    expect(component.pageChanged.emit).not.toHaveBeenCalled();
    //Act
    component.changePage(0); // invalid page
    //Assert
    expect(component.pageChanged.emit).not.toHaveBeenCalled();
    //Act
    component.changePage(5); // invalid page
    //Assert
    expect(component.pageChanged.emit).not.toHaveBeenCalled();
  });

  it('should reset currentPage and emit when currentPage > totalPages', () => {
    //Arrange
    spyOn(component.pageChanged, 'emit');
    component.totalItems = 10;
    component.itemsPerPage = 10;
    component.currentPage = 5;
    //Act
    component.ngOnChanges({ totalItems: { currentValue: 10, previousValue: 40, firstChange: false, isFirstChange: () => false } });
    //Assert
    expect(component.currentPage).toBe(1);
    //Assert
    expect(component.pageChanged.emit).toHaveBeenCalledWith(1);
  });
});
