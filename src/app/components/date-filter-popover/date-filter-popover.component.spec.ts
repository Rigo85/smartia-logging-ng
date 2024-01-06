import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateFilterPopoverComponent } from './date-filter-popover.component';

describe('DateFilterPopoverComponent', () => {
  let component: DateFilterPopoverComponent;
  let fixture: ComponentFixture<DateFilterPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateFilterPopoverComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DateFilterPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
