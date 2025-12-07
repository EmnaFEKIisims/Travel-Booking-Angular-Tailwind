import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { DestinationService, Hotel } from '../../destination-service';
import { UserService } from '../../../user/user-service';

interface Destination {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  image?: string;
  location?: string;
  country?: string;
  rating?: number;
  likes?: number;
  isLiked?: boolean;
}

interface ExtendedHotel extends Hotel {
  isLiked?: boolean;
}

@Component({
  selector: 'app-destination-details',
  imports: [CommonModule, RouterModule],
  templateUrl: './destination-details.html',
  styleUrl: './destination-details.css',
})
export class DestinationDetails implements OnInit {
  destination: Destination | null = null;
  hotels: ExtendedHotel[] = [];
  loading = true;
  currentUser: any = null;
  destinationId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private destinationService: DestinationService,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.route.params.subscribe(params => {
      this.destinationId = +params['id'];
      this.loadDestination();
      this.loadHotels();
    });
  }

  loadCurrentUser() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  loadDestination() {
    console.log('Loading destination with ID:', this.destinationId);
    this.destinationService.getDestinationById(this.destinationId).subscribe({
      next: (destination) => {
        console.log('Destination loaded successfully:', destination);
        this.destination = {
          ...destination,
          location: destination.location || destination.country || 'Unknown',
          imageUrl: destination.imageUrl || destination.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          isLiked: false
        };
        
        // Load user destination likes if user is logged in
        if (this.currentUser) {
          this.loadUserDestinationLikes();
        }
      },
      error: (error) => {
        console.error('Failed to load destination:', error);
        this.router.navigate(['/destination']);
      }
    });
  }

  loadHotels() {
    this.destinationService.getHotelsWithRooms(this.destinationId).subscribe({
      next: (hotels) => {
        this.hotels = hotels.map(hotel => ({
          ...hotel,
          isLiked: false
        }));
        this.loading = false;
        
        // Load user likes for hotels if user is logged in
        if (this.currentUser) {
          this.loadUserHotelLikes();
        }
      },
      error: (error) => {
        console.error('Failed to load hotels:', error);
        this.loading = false;
      }
    });
  }

  loadUserDestinationLikes() {
    if (!this.currentUser || !this.destination) return;
    
    this.userService.getUserLikes(this.currentUser.id).subscribe({
      next: (likes) => {
        // Update isLiked status for the destination
        if (this.destination) {
          this.destination.isLiked = likes.some(like => like.destinationId === this.destination!.id);
        }
      },
      error: (error) => {
        console.error('Failed to load user destination likes:', error);
      }
    });
  }

  loadUserHotelLikes() {
    if (!this.currentUser) return;
    
    this.userService.getUserLikes(this.currentUser.id).subscribe({
      next: (likes) => {
        // Update isLiked status for each hotel
        this.hotels.forEach(hotel => {
          hotel.isLiked = likes.some(like => like.hotelId === parseInt(hotel.id));
        });
      },
      error: (error) => {
        console.error('Failed to load user hotel likes:', error);
      }
    });
  }

  toggleHotelLike(hotel: ExtendedHotel) {
    if (!this.currentUser) {
      console.log('User not logged in');
      return;
    }

    const wasLiked = hotel.isLiked;
    hotel.isLiked = !hotel.isLiked;
    
    if (hotel.isLiked) {
      this.userService.likeHotel(this.currentUser.id, parseInt(hotel.id)).subscribe({
        next: () => {
          console.log('Hotel liked successfully');
          hotel.likes += 1;
        },
        error: (error: any) => {
          console.error('Failed to like hotel:', error);
          hotel.isLiked = wasLiked;
        }
      });
    } else {
      this.userService.unlikeHotel(this.currentUser.id, parseInt(hotel.id)).subscribe({
        next: () => {
          console.log('Hotel unliked successfully');
          hotel.likes = Math.max(hotel.likes - 1, 0);
        },
        error: (error: any) => {
          console.error('Failed to unlike hotel:', error);
          hotel.isLiked = wasLiked;
        }
      });
    }
  }

  bookHotel(hotel: ExtendedHotel) {
    if (!this.currentUser) {
      // Redirect to sign-in if user is not logged in
      this.router.navigate(['/sign-in'], { 
        queryParams: { returnUrl: `/destination-details/${this.destinationId}` } 
      });
      return;
    }
    
    console.log('Booking hotel:', hotel.name);
    // Navigate to booking page with hotel information
    this.router.navigate(['/booking'], { 
      queryParams: { 
        hotelId: hotel.id, 
        hotelName: hotel.name,
        destinationId: this.destinationId 
      } 
    });
  }

  toggleDestinationLike() {
    if (!this.currentUser || !this.destination) {
      console.log('User not logged in or destination not loaded');
      return;
    }

    const wasLiked = this.destination.isLiked;
    this.destination.isLiked = !this.destination.isLiked;
    
    if (this.destination.isLiked) {
      this.userService.likeDestination(this.currentUser.id, this.destination.id).subscribe({
        next: (updatedDestination) => {
          console.log('Destination liked successfully');
          if (this.destination) {
            this.destination.likes = updatedDestination.likes;
          }
        },
        error: (error: any) => {
          console.error('Failed to like destination:', error);
          if (this.destination) {
            this.destination.isLiked = wasLiked;
          }
        }
      });
    } else {
      this.userService.unlikeDestination(this.currentUser.id, this.destination.id).subscribe({
        next: (updatedDestination) => {
          console.log('Destination unliked successfully');
          if (this.destination) {
            this.destination.likes = updatedDestination.likes;
          }
        },
        error: (error: any) => {
          console.error('Failed to unlike destination:', error);
          if (this.destination) {
            this.destination.isLiked = wasLiked;
          }
        }
      });
    }
  }

  getStarArray(stars: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < stars);
  }

  getStarArrayForHotel(stars: number): number[] {
    return Array(stars).fill(0);
  }

  onHotelImageError(event: any) {
    // Fallback to a default hotel image when the original image fails to load
    event.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }

  onImageError(event: any) {
    // Fallback to a default travel image when the original image fails to load
    event.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }

  viewHotelDetails(hotelId: string | number) {
    // Navigate to hotel details page
    this.router.navigate(['/hotel', hotelId]);
    console.log('Navigate to hotel details:', hotelId);
  }

  goBack() {
    this.router.navigate(['/destination']);
  }

  getLowestRoomPrice(hotel: ExtendedHotel): number | null {
    if (!hotel.rooms || hotel.rooms.length === 0) {
      return null;
    }
    return Math.min(...hotel.rooms.map(room => room.price));
  }
  
  getRoomPriceRange(hotel: ExtendedHotel): string {
    if (!hotel.rooms || hotel.rooms.length === 0) {
      return 'Price on request';
    }
    
    const prices = hotel.rooms.map(room => room.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `€${minPrice}/night`;
    }
    
    return `€${minPrice} - €${maxPrice}/night`;
  }

  trackByHotel(index: number, hotel: Hotel): string | number {
    return hotel.id;
  }
}
