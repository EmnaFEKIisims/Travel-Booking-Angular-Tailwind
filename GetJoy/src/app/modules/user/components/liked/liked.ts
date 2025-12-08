import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DestinationService } from '../../../destinations/destination-service';
import { UserService } from '../../user-service';

@Component({
  selector: 'app-liked',
  imports: [CommonModule, RouterModule],
  templateUrl: './liked.html',
  styleUrl: './liked.css',
})
export class Liked implements OnInit {
  likedDestinations: any[] = [];
  likedHotels: any[] = [];
  loading = true;
  currentUser: any = null;
  activeTab: 'destinations' | 'hotels' = 'destinations';

  constructor(
    private destinationService: DestinationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
  }

  loadCurrentUser() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.loadLikedItems();
      }
    });
  }

  loadLikedItems() {
    if (!this.currentUser) return;
    
    this.loading = true;
    
    // First get user's likes
    this.userService.getUserLikes(this.currentUser.id).subscribe({
      next: (userLikes) => {
        console.log('User likes:', userLikes);
        
        // Extract liked destination IDs and hotel IDs
        const likedDestinationIds = userLikes
          .filter(like => like.destinationId !== null && like.destinationId !== undefined)
          .map(like => +like.destinationId); // Convert to number
        
        const likedHotelIds = userLikes
          .filter(like => like.hotelId !== null && like.hotelId !== undefined)
          .map(like => +like.hotelId); // Convert to number
        
        console.log('Liked destination IDs:', likedDestinationIds);
        console.log('Liked hotel IDs:', likedHotelIds);
        
        // Load all destinations and filter liked ones
        this.destinationService.getDestinations().subscribe(destinations => {
          this.likedDestinations = destinations.filter(dest => 
            likedDestinationIds.includes(+dest.id)
          );
          console.log('Liked destinations:', this.likedDestinations);
        });

        // Load all hotels and filter liked ones
        this.destinationService.getDestinations().subscribe(destinations => {
          const allHotelPromises = destinations.map(dest => 
            this.destinationService.getHotelsByDestination(dest.id).toPromise()
          );
          
          Promise.all(allHotelPromises).then(hotelArrays => {
            const allHotels = hotelArrays.flat();
            this.likedHotels = allHotels.filter(hotel => 
              hotel && likedHotelIds.includes(+hotel.id)
            );
            console.log('Liked hotels:', this.likedHotels);
            this.loading = false;
          }).catch(() => {
            this.loading = false;
          });
        });
      },
      error: (error) => {
        console.error('Failed to load user likes:', error);
        this.loading = false;
      }
    });
  }

  toggleLike(item: any, type: 'destination' | 'hotel') {
    if (type === 'destination') {
      this.destinationService.toggleDestinationLike(item.id).subscribe(() => {
        item.liked = !item.liked;
        if (!item.liked) {
          this.likedDestinations = this.likedDestinations.filter(d => d.id !== item.id);
        }
      });
    } else {
      this.destinationService.toggleHotelLike(item.id).subscribe(() => {
        item.liked = !item.liked;
        if (!item.liked) {
          this.likedHotels = this.likedHotels.filter(h => h.id !== item.id);
        }
      });
    }
  }

  navigateToDestination(id: number) {
    this.router.navigate(['/destination', id]);
  }

  navigateToHotel(hotelId: string) {
    this.router.navigate(['/hotel', hotelId]);
  }

  setActiveTab(tab: 'destinations' | 'hotels') {
    this.activeTab = tab;
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
