import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BookingService } from '../../booking-service';
import { UserService } from '../../../user/user-service';
import { DestinationService } from '../../../destinations/destination-service';
import { TruncatePipe } from '../../../../shared/pipes/truncate.pipe';
import { TimeAgoPipe } from '../../../../shared/pipes/time-ago.pipe';
import { SafePipe } from '../../../../shared/pipes/safe.pipe';

@Component({
  selector: 'app-booking-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TruncatePipe, TimeAgoPipe, SafePipe],
  templateUrl: './booking-list.html',
  styleUrl: './booking-list.css',
})
export class BookingList implements OnInit {
  bookings: any[] = [];
  loading = true;
  currentUser: any = null;

  constructor(
    private router: Router,
    private bookingService: BookingService,
    private userService: UserService,
    private destinationService: DestinationService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    const userData = this.userService.getCurrentUser();
    if (userData) {
      this.currentUser = userData;
      this.loadUserBookings();
    } else {
      this.loading = false;
    }
  }

  loadUserBookings() {
    this.bookingService.getUserBookings(this.currentUser.email).subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        // Load hotel details for each booking to get images
        this.loadHotelDetailsForBookings();
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
        this.loading = false;
      }
    });
  }

  loadHotelDetailsForBookings() {
    if (this.bookings.length === 0) {
      this.loading = false;
      return;
    }

    // Load hotel details for each booking to get hotel images
    const hotelPromises = this.bookings.map(booking => {
      return this.destinationService.getHotelById(booking.hotelId).toPromise().then((hotel: any) => {
        if (hotel) {
          booking.hotelImage = hotel.image;
          booking.hotelStars = hotel.stars;
        }
        return booking;
      }).catch((error: any) => {
        console.error(`Failed to load hotel ${booking.hotelId}:`, error);
        return booking;
      });
    });

    Promise.all(hotelPromises).then(() => {
      this.loading = false;
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(word => word[0]).join('').toUpperCase();
  }

  getCurrentDate(): string {
    return this.formatDate(new Date().toISOString());
  }

  goBack() {
    this.router.navigate(['/destination']);
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }

  getStarArray(stars: number): number[] {
    return Array(stars).fill(0);
  }
}
