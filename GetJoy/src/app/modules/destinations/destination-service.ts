import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Destination {
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
}

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  private apiUrl = 'http://localhost:3000/destinations';

  constructor(private http: HttpClient) {}

  getDestinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>(this.apiUrl);
  }

  getDestinationById(id: number): Observable<Destination> {
    return this.http.get<Destination>(`${this.apiUrl}/${id}`);
  }

  updateDestinationLikes(destinationId: number, increment: boolean): Observable<Destination> {
    return this.getDestinationById(destinationId).pipe(
      switchMap(destination => {
        const updatedDestination = {
          ...destination,
          likes: increment 
            ? (destination.likes || 0) + 1 
            : Math.max((destination.likes || 0) - 1, 0)
        };
        return this.http.put<Destination>(`${this.apiUrl}/${destinationId}`, updatedDestination);
      })
    );
  }
}
