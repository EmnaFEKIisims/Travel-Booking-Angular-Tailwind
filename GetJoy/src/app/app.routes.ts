import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/destination', pathMatch: 'full' },
  { 
    path: 'signin', 
    loadComponent: () => import('./modules/user/components/sign-in/sign-in').then(m => m.SignIn)
  },
  { 
    path: 'signup', 
    loadComponent: () => import('./modules/user/components/sign-up/sign-up').then(m => m.SignUp)
  },
  { 
    path: 'destination', 
    loadComponent: () => import('./modules/destinations/components/feed/feed').then(m => m.Feed)
  },
  { 
    path: 'destination/:id', 
    loadComponent: () => import('./modules/destinations/components/destination-details/destination-details').then(m => m.DestinationDetails)
  },
  { path: '**', redirectTo: '/destination' }
];
