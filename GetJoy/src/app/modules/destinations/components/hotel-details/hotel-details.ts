import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DestinationService, Hotel, Room } from '../../destination-service';
import { UserService } from '../../../user/user-service';

@Component({
  selector: 'app-hotel-details',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './hotel-details.html',
  styleUrl: './hotel-details.css',
})
export class HotelDetails implements OnInit {
  hotel: Hotel | null = null;
  rooms: Room[] = [];
  loading = true;
  currentUser: any = null;
  selectedRoom: Room | null = null;
  checkInDate: string = '';
  checkOutDate: string = '';
  guests: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destinationService: DestinationService,
    private userService: UserService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.route.params.subscribe(params => {
      const hotelId = params['id'];
      this.loadHotelDetails(hotelId);
      this.loadRooms(hotelId);
    });
    
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.checkInDate = today.toISOString().split('T')[0];
    this.checkOutDate = tomorrow.toISOString().split('T')[0];
  }

  loadCurrentUser() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadHotelDetails(hotelId: string) {
    // Get all hotels and find the one we need
    this.destinationService.getDestinations().subscribe({
      next: (destinations) => {
        let foundHotel = false;
        let destinationsProcessed = 0;
        
        destinations.forEach(destination => {
          this.destinationService.getHotelsByDestination(destination.id).subscribe({
            next: (hotels) => {
              const hotel = hotels.find(h => h.id === hotelId);
              if (hotel && !foundHotel) {
                this.hotel = hotel;
                foundHotel = true;
              }
              destinationsProcessed++;
              
              if (destinationsProcessed === destinations.length && !foundHotel) {
                console.error('Hotel not found');
                this.router.navigate(['/destination']);
              }
            },
            error: () => {
              destinationsProcessed++;
              if (destinationsProcessed === destinations.length && !foundHotel) {
                this.router.navigate(['/destination']);
              }
            }
          });
        });
      },
      error: (error) => {
        console.error('Failed to load destinations:', error);
        this.router.navigate(['/destination']);
      }
    });
  }

  loadRooms(hotelId: string) {
    this.destinationService.getRoomsByHotel(hotelId).subscribe({
      next: (rooms) => {
        this.rooms = rooms;
        this.loading = false;
        // Select first room by default
        if (rooms.length > 0) {
          this.selectedRoom = rooms[0];
        }
      },
      error: (error) => {
        console.error('Failed to load rooms:', error);
        this.loading = false;
      }
    });
  }

  selectRoom(room: Room) {
    this.selectedRoom = room;
  }

  getStarArray(stars: number): number[] {
    return Array(stars).fill(0);
  }

  bookNow() {
    if (!this.selectedRoom || !this.currentUser) {
      if (!this.currentUser) {
        this.router.navigate(['/sign-in']);
      }
      return;
    }
    
    // TODO: Implement actual booking logic
    console.log('Booking room:', this.selectedRoom);
    console.log('Check-in:', this.checkInDate);
    console.log('Check-out:', this.checkOutDate);
    console.log('Guests:', this.guests);
    
    alert('Booking successful! (Demo)');
  }

  goBack() {
    history.back();
  }

  onImageError(event: any) {
    event.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }

  getMapUrl(address: string): SafeResourceUrl {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://maps.google.com/maps?q=${encodedAddress}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
