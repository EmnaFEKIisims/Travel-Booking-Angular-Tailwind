import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Booking {
  id?: string;
  userId: string;
  hotelId: string;
  destinationId: string;
  hotelName: string;
  destinationName: string;
  firstName: string;
  lastName: string;
  email: string;
  roomType: string;
  numberOfGuests: number;
  numberOfRooms: number;
  arrivalDate: string;
  arrivalTime: string;
  departureDate: string;
  includeFlight: boolean;
  flightType: string; // 'oneWay' or 'roundTrip'
  freePickup: boolean;
  specialRequests: string;
  roomTotal: number;
  flightTotal: number;
  totalPrice: number;
  bookingDate: string;
  status: string; // 'pending', 'confirmed', 'cancelled'
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  // Get all bookings
  getBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings`);
  }

  // Get bookings by user ID
  getBookingsByUser(userId: string): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/bookings?userId=${userId}`);
  }

  // Get booking by ID
  getBookingById(id: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/bookings/${id}`);
  }

  // Create a new booking
  createBooking(booking: Booking): Observable<Booking> {
    // Remove ID if it exists - let the backend generate it
    const bookingData = { ...booking };
    delete (bookingData as any).id;
    
    bookingData.status = 'confirmed';
    bookingData.bookingDate = new Date().toISOString();
    
    return this.http.post<Booking>(`${this.apiUrl}/bookings`, bookingData);
  }

  // Update an existing booking
  updateBooking(id: string, booking: Partial<Booking>): Observable<Booking> {
    return this.http.put<Booking>(`${this.apiUrl}/bookings/${id}`, booking);
  }

  // Delete a booking
  deleteBooking(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/bookings/${id}`);
  }

  // Cancel a booking (soft delete)
  cancelBooking(id: string): Observable<Booking> {
    return this.updateBooking(id, { status: 'cancelled' });
  }

  // Generate a unique booking ID
  private generateBookingId(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `BK${timestamp}${random}`;
  }

  // Calculate total price for a booking
  calculateTotalPrice(
    roomPrice: number, 
    numberOfRooms: number, 
    flightPrice: number, 
    numberOfGuests: number, 
    includeFlight: boolean, 
    isRoundTrip: boolean
  ): { roomTotal: number, flightTotal: number, totalPrice: number } {
    const roomTotal = roomPrice * numberOfRooms;
    
    let flightTotal = 0;
    if (includeFlight) {
      const multiplier = isRoundTrip ? 2 : 1;
      flightTotal = flightPrice * numberOfGuests * multiplier;
    }
    
    const totalPrice = roomTotal + flightTotal;
    
    return { roomTotal, flightTotal, totalPrice };
  }
}
