import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { NoAuthGuard } from './guards/no-auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/destination', pathMatch: 'full' },
  { 
    path: 'signin', 
    loadComponent: () => import('./modules/user/components/sign-in/sign-in').then(m => m.SignIn),
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./modules/user/components/sign-up/sign-up').then(m => m.SignUp),
    canActivate: [NoAuthGuard]
  },
  { 
    path: 'destination', 
    loadComponent: () => import('./modules/destinations/components/feed/feed').then(m => m.Feed)
  },
  { 
    path: 'destination/:id', 
    loadComponent: () => import('./modules/destinations/components/destination-details/destination-details').then(m => m.DestinationDetails)
  },
  // Protected routes that require authentication
  { 
    path: 'liked', 
    loadComponent: () => import('./modules/user/components/liked/liked').then(m => m.Liked),
    canActivate: [AuthGuard]
  },
  { 
    path: 'booking', 
    loadComponent: () => import('./modules/booking/components/booking-list/booking-list').then(m => m.BookingList),
    canActivate: [AuthGuard]
  },
  { 
    path: 'add-booking', 
    loadComponent: () => import('./modules/booking/components/add-booking/add-booking').then(m => m.AddBooking),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/destination' }
];
