import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DestinationService } from '../../../destinations/destination-service';
import { BookingService } from '../../booking-service';
import { UserService } from '../../../user/user-service';

@Component({
  selector: 'app-add-booking',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-booking.html',
  styleUrl: './add-booking.css',
})
export class AddBooking implements OnInit {
  bookingForm!: FormGroup;
  hotelId!: string;
  destinationId!: string;
  hotel: any = null;
  destination: any = null;
  selectedRoomId!: string;
  numberOfGuests: number = 1;
  numberOfRooms: number = 1;
  currentUser: any = null;
  
  // Pricing calculation
  totalPrice: number = 0;
  roomTotal: number = 0;
  flightTotal: number = 0;
  
  // Alert system
  showAlert = false;
  alertType: 'success' | 'error' | 'warning' = 'success';
  alertMessage = '';
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private destinationService: DestinationService,
    private bookingService: BookingService,
    private userService: UserService
  ) {
    this.initForm();
  }

  ngOnInit() {
    this.loadCurrentUser();
    this.route.queryParams.subscribe(params => {
      this.hotelId = params['hotelId'];
      this.destinationId = params['destinationId'];
      this.selectedRoomId = params['roomId'];
      
      if (this.hotelId && this.destinationId) {
        this.loadData();
      }
    });
  }

  loadCurrentUser() {
    this.currentUser = this.userService.getCurrentUser();
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
    
    this.destinationService.getHotelById(this.hotelId).subscribe(hotel => {
      this.hotel = hotel;
      console.log('Loaded hotel with rooms:', hotel);
      if (this.hotel && this.selectedRoomId) {
        const selectedRoom = this.hotel.rooms?.find((r: any) => r.id === this.selectedRoomId);
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
    
    // Calculate number of nights
    const arrivalDate = formValue.arrivalDate;
    const departureDate = formValue.departureDate;
    let numberOfNights = 1; // Default to 1 night
    
    if (arrivalDate && departureDate) {
      const arrival = new Date(arrivalDate);
      const departure = new Date(departureDate);
      const timeDiff = departure.getTime() - arrival.getTime();
      numberOfNights = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
    }
    
    // Calculate room total (price per night * number of nights * number of rooms)
    const selectedRoom = this.hotel.rooms?.find((r: any) => r.type === formValue.roomType);
    if (selectedRoom) {
      this.roomTotal = selectedRoom.price * numberOfNights * (formValue.numberOfRooms || 1);
    }
    
    // Calculate flight total
    this.flightTotal = 0;
    if (formValue.includeFlight) {
      const flightPrice = this.destination.flightPrice || 0;
      const numberOfGuests = formValue.numberOfGuests || 1;
      
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
    if (this.bookingForm.valid && this.currentUser) {
      const bookingData = {
        ...this.bookingForm.value,
        userId: this.currentUser.id,
        hotelId: this.hotelId,
        destinationId: this.destinationId,
        hotelName: this.hotel?.name,
        destinationName: this.destination?.name,
        roomTotal: this.roomTotal,
        flightTotal: this.flightTotal,
        totalPrice: this.totalPrice,
        bookingDate: new Date().toISOString()
      };
      
      // Save booking using the BookingService
      this.bookingService.createBooking(bookingData).subscribe({
        next: (savedBooking) => {
          console.log('Booking saved:', savedBooking);
          this.showAlertMessage('success', 'Booking added successfully!');
          setTimeout(() => {
            this.router.navigate(['/feed']);
          }, 3000);
        },
        error: (error) => {
          console.error('Error saving booking:', error);
          this.showAlertMessage('error', 'There was an error processing your booking. Please try again.');
        }
      });
    } else {
      if (!this.currentUser) {
        this.showAlertMessage('warning', 'Please sign in to make a booking.');
        setTimeout(() => {
          this.router.navigate(['/signin']);
        }, 2000);
      } else {
        this.showAlertMessage('warning', 'Please fill in all required fields correctly.');
      }
    }
  }

  onCancel() {
    if (this.hotelId && this.destinationId) {
      this.router.navigate(['/hotel', this.hotelId]);
    } else {
      this.router.navigate(['/feed']);
    }
  }

  goBack() {
    if (this.hotelId && this.destinationId) {
      this.router.navigate(['/hotel', this.hotelId]);
    } else {
      this.router.navigate(['/feed']);
    }
  }

  showAlertMessage(type: 'success' | 'error' | 'warning', message: string) {
    this.alertType = type;
    this.alertMessage = message;
    this.showAlert = true;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.showAlert = false;
    }, 5000);
  }
}
