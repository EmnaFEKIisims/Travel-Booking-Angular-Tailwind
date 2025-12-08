import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

export interface Destination {
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
}

export interface Hotel {
  id: string;
  destinationId: number;
  name: string;
  address: string;
  stars: number;
  image: string;
  likes: number;
  liked: boolean;
  rooms?: Room[]; // Add rooms to hotel interface
}

export interface Room {
  id: string;
  hotelId: string;
  type: string;
  price: number;
  capacity: number;
}

@Injectable({
  providedIn: 'root',
})
export class DestinationService {
  private apiUrl = 'http://localhost:3000/destinations';
  private hotelsUrl = 'http://localhost:3000/hotels';
  private roomsUrl = 'http://localhost:3000/rooms';

  constructor(private http: HttpClient) {}

  getDestinations(): Observable<Destination[]> {
    return this.http.get<Destination[]>(this.apiUrl);
  }

  getDestinationById(id: number): Observable<Destination> {
    console.log('Getting destination by ID:', id);
    return this.http.get<Destination[]>(this.apiUrl).pipe(
      map((destinations: Destination[]) => {
        console.log('All destinations from API:', destinations);
        console.log('Destinations length:', destinations?.length);
        console.log('Looking for destination with ID:', id, 'Type:', typeof id);
        
        // Check if destinations is actually an array
        if (!Array.isArray(destinations)) {
          console.error('Destinations is not an array:', typeof destinations, destinations);
          throw new Error('Invalid destinations data received from API');
        }
        
        const destination = destinations.find((dest: Destination) => {
          console.log('Checking destination:', dest.id, 'vs', id);
          return Number(dest.id) === Number(id); // Ensure type matching
        });
        
        if (!destination) {
          console.error('Available destination IDs:', destinations.map(d => d.id));
          throw new Error(`Destination with id ${id} not found`);
        }
        console.log('Found destination:', destination);
        return destination;
      })
    );
  }

  getHotelsByDestination(destinationId: number): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(`${this.hotelsUrl}?destinationId=${destinationId}`);
  }

  getRoomsByHotel(hotelId: string): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.roomsUrl}?hotelId=${hotelId}`);
  }

  getHotelsWithRooms(destinationId: number): Observable<Hotel[]> {
    return this.getHotelsByDestination(destinationId).pipe(
      switchMap(hotels => {
        if (hotels.length === 0) {
          return forkJoin([]).pipe(map(() => []));
        }
        const hotelObservables = hotels.map(hotel =>
          this.getRoomsByHotel(hotel.id).pipe(
            map(rooms => ({ ...hotel, rooms }))
          )
        );
        return forkJoin(hotelObservables);
      })
    );
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

  getHotelById(hotelId: string): Observable<Hotel> {
    return this.http.get<Hotel[]>(this.hotelsUrl).pipe(
      map(hotels => {
        const hotel = hotels.find(h => h.id === hotelId);
        if (!hotel) {
          throw new Error(`Hotel with id ${hotelId} not found`);
        }
        return hotel;
      }),
      switchMap(hotel => 
        this.getRoomsByHotel(hotel.id).pipe(
          map(rooms => ({ ...hotel, rooms }))
        )
      )
    );
  }

  toggleDestinationLike(destination: Destination): Observable<Destination> {
    const updatedDestination = {
      ...destination,
      liked: !destination.liked,
      likes: destination.liked 
        ? Math.max((destination.likes || 0) - 1, 0)
        : (destination.likes || 0) + 1
    };
    return this.http.put<Destination>(`${this.apiUrl}/${destination.id}`, updatedDestination);
  }

  toggleHotelLike(hotel: Hotel): Observable<Hotel> {
    const updatedHotel = {
      ...hotel,
      liked: !hotel.liked,
      likes: hotel.liked 
        ? Math.max((hotel.likes || 0) - 1, 0)
        : (hotel.likes || 0) + 1
    };
    return this.http.put<Hotel>(`${this.hotelsUrl}/${hotel.id}`, updatedHotel);
  }
}
