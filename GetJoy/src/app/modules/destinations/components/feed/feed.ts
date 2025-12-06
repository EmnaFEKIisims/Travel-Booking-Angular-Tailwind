import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DestinationService } from '../../destination-service';
import { UserService } from '../../../user/user-service';
import { RouterModule } from '@angular/router';

interface Destination {
  id: number;
  name: string;
  description: string;
  imageUrl?: string;
  image?: string; // Legacy field
  location?: string;
  country?: string; // Legacy field
  price?: number;
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
    private userService: UserService
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadDestinations();
  }

  loadCurrentUser() {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
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
      },
      error: (error) => {
        console.error('Failed to load destinations:', error);
        this.loading = false;
      }
    });
  }

  toggleLike(destination: Destination) {
    if (!this.currentUser) {
      // Redirect to login if not authenticated
      return;
    }

    const wasLiked = destination.isLiked;
    destination.isLiked = !destination.isLiked;
    
    if (destination.isLiked) {
      this.userService.likeDestination(this.currentUser.id, destination.id).subscribe({
        next: (updatedDestination) => {
          console.log('Destination liked successfully');
          // Update local likes count
          destination.likes = updatedDestination.likes;
        },
        error: (error: any) => {
          console.error('Failed to like destination:', error);
          destination.isLiked = wasLiked; // Revert on error
        }
      });
    } else {
      this.userService.unlikeDestination(this.currentUser.id, destination.id).subscribe({
        next: (updatedDestination) => {
          console.log('Destination unliked successfully');
          // Update local likes count
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
    console.log('View destination:', destinationId);
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
