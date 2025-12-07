import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelDetails } from './hotel-details';

describe('HotelDetails', () => {
  let component: HotelDetails;
  let fixture: ComponentFixture<HotelDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
