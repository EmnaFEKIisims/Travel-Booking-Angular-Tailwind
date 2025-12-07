import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DestinationService } from '../../../destinations/destination-service';

@Component({
  selector: 'app-hotel-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hotel-booking.html',
  styleUrl: './hotel-booking.css'
})
export class HotelBookingComponent implements OnInit {
  bookingForm!: FormGroup;
  hotelId!: string;
  destinationId!: string;
  hotel: any = null;
  destination: any = null;
  selectedRoomId!: string;
  numberOfGuests: number = 1;
  numberOfRooms: number = 1;
  
  // Pricing calculation
  totalPrice: number = 0;
  roomTotal: number = 0;
  flightTotal: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private destinationService: DestinationService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.hotelId = this.route.snapshot.params['hotelId'];
    this.destinationId = this.route.snapshot.params['destinationId'];
    this.selectedRoomId = this.route.snapshot.params['roomId'];
    
    this.loadData();
  }

  initForm() {
    this.bookingForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      roomType: ['', [Validators.required]],
      numberOfGuests: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      numberOfRooms: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
      arrivalDate: ['', [Validators.required]],
      arrivalTime: ['', [Validators.required]],
      departureDate: ['', [Validators.required]],
      includeFlight: [false],
      flightType: ['oneWay'], // 'oneWay' or 'roundTrip'
      freePickup: [false],
      specialRequests: ['']
    });
    
    // Subscribe to form changes to calculate prices
    this.bookingForm.valueChanges.subscribe(() => {
      this.calculateTotalPrice();
    });
  }

  loadData() {
    this.destinationService.getDestinations().subscribe(destinations => {
      this.destination = destinations.find(d => d.id == +this.destinationId);
    });
    
    this.destinationService.getHotelsByDestination(+this.destinationId).subscribe(hotels => {
      this.hotel = hotels.find(h => h.id === this.hotelId);
      if (this.hotel && this.selectedRoomId) {
        const selectedRoom = this.hotel.rooms.find((r: any) => r.id === this.selectedRoomId);
        if (selectedRoom) {
          this.bookingForm.patchValue({
            roomType: selectedRoom.type
          });
        }
      }
    });
  }

  calculateTotalPrice() {
    if (!this.hotel || !this.destination) return;
    
    const formValue = this.bookingForm.value;
    
    // Calculate room total
    const selectedRoom = this.hotel.rooms.find((r: any) => r.type === formValue.roomType);
    if (selectedRoom) {
      this.roomTotal = selectedRoom.price * formValue.numberOfRooms;
    }
    
    // Calculate flight total
    this.flightTotal = 0;
    if (formValue.includeFlight) {
      const flightPrice = this.destination.flightPrice;
      const numberOfGuests = formValue.numberOfGuests;
      
      if (formValue.flightType === 'oneWay') {
        this.flightTotal = flightPrice * numberOfGuests;
      } else { // roundTrip
        this.flightTotal = flightPrice * 2 * numberOfGuests;
      }
    }
    
    this.totalPrice = this.roomTotal + this.flightTotal;
  }

  onFlightIncludeChange() {
    const includeFlight = this.bookingForm.get('includeFlight')?.value;
    if (!includeFlight) {
      this.bookingForm.patchValue({
        flightType: 'oneWay'
      });
    }
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      const bookingData = {
        ...this.bookingForm.value,
        hotelId: this.hotelId,
        destinationId: this.destinationId,
        hotelName: this.hotel?.name,
        destinationName: this.destination?.name,
        roomTotal: this.roomTotal,
        flightTotal: this.flightTotal,
        totalPrice: this.totalPrice,
        bookingDate: new Date().toISOString()
      };
      
      console.log('Booking submitted:', bookingData);
      
      // Here you would typically send the data to your backend
      // For now, just show success message and redirect
      alert('Booking submitted successfully! You will receive a confirmation email shortly.');
      this.router.navigate(['/feed']);
    } else {
      alert('Please fill in all required fields correctly.');
    }
  }

  onCancel() {
    this.router.navigate(['/destinations', this.destinationId, 'hotels', this.hotelId]);
  }
}
