import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestinationService } from '../../destination-service';
import { UserService } from '../../../user/user-service';
import { RouterModule, Router } from '@angular/router';

interface Destination {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  image?: string; // Legacy field
  location?: string;
  country?: string; // Legacy field
  rating?: number;
  likes?: number;
  liked?: boolean;
  isLiked?: boolean;
}

interface Like {
  id?: number;
  userId: number;
  destinationId?: number;
  hotelId?: number;
}

@Component({
  selector: 'app-feed',
  imports: [CommonModule, RouterModule],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  destinations: Destination[] = [];
  loading = true;
  currentUser: any = null;

  constructor(
    private destinationService: DestinationService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadDestinations();
  }

  loadCurrentUser() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      // Reload destinations when user changes to update liked status
      if (this.destinations.length > 0) {
        this.loadUserLikes();
      }
    });
  }

  loadDestinations() {
    this.destinationService.getDestinations().subscribe({
      next: (destinations) => {
        this.destinations = destinations.map(dest => ({
          ...dest,
          location: dest.location || dest.country || 'Unknown',
          imageUrl: dest.imageUrl || dest.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          isLiked: false
        }));
        this.loading = false;
        
        // Load user likes if user is logged in
        if (this.currentUser) {
          this.loadUserLikes();
        }
      },
      error: (error) => {
        console.error('Failed to load destinations:', error);
        this.loading = false;
      }
    });
  }

  loadUserLikes() {
    if (!this.currentUser) return;
    
    this.userService.getUserLikes(this.currentUser.id).subscribe({
      next: (likes) => {
        // Update isLiked status for each destination
        this.destinations.forEach(destination => {
          destination.isLiked = likes.some(like => like.destinationId === destination.id);
        });
      },
      error: (error) => {
        console.error('Failed to load user likes:', error);
      }
    });
  }

  toggleLike(destination: Destination) {
    if (!this.currentUser) {
      // TODO: Redirect to login if not authenticated
      console.log('User not logged in');
      return;
    }

    const wasLiked = destination.isLiked;
    // Optimistic update
    destination.isLiked = !destination.isLiked;
    
    if (destination.isLiked) {
      // Like the destination
      this.userService.likeDestination(this.currentUser.id, destination.id).subscribe({
        next: (updatedDestination) => {
          console.log('Destination liked successfully');
          // Update local likes count from server response
          destination.likes = updatedDestination.likes;
        },
        error: (error: any) => {
          console.error('Failed to like destination:', error);
          destination.isLiked = wasLiked; // Revert on error
        }
      });
    } else {
      // Unlike the destination
      this.userService.unlikeDestination(this.currentUser.id, destination.id).subscribe({
        next: (updatedDestination) => {
          console.log('Destination unliked successfully');
          // Update local likes count from server response
          destination.likes = updatedDestination.likes;
        },
        error: (error: any) => {
          console.error('Failed to unlike destination:', error);
          destination.isLiked = wasLiked; // Revert on error
        }
      });
    }
  }

  viewDestination(destinationId: number) {
    // Navigate to destination details
    console.log('Navigating to destination details for ID:', destinationId);
    this.router.navigate(['/destination', destinationId]);
  }

  navigateToSignIn() {
    this.router.navigate(['/signin']);
  }

  navigateToSignUp() {
    this.router.navigate(['/signup']);
  }

  navigateToExplore() {
    // Navigate to favorites/liked destinations
    this.router.navigate(['/liked']);
  }

  handleExploreMore(destinationId: number) {
    if (this.currentUser) {
      // User is logged in, allow navigation to destination details
      this.viewDestination(destinationId);
    } else {
      // User not logged in, redirect to sign-in
      console.log('User not logged in, redirecting to sign-in');
      this.navigateToSignIn();
    }
  }

  getStarArray(rating: number): boolean[] {
    return Array(5).fill(false).map((_, index) => index < Math.floor(rating));
  }

  onImageError(event: any) {
    // Fallback to a default travel image when the original image fails to load
    event.target.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }

  trackByDestination(index: number, destination: Destination): number {
    return destination.id;
  }

}
