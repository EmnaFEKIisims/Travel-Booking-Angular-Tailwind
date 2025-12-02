import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap , switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private apiUrl = 'http://localhost:3000/users';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}





  login(email: string, password: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?email=${email}&password=${password}`).pipe(
      tap(users => {
        if (users.length > 0) {
          this.currentUserSubject.next(users[0]);
          localStorage.setItem('currentUser', JSON.stringify(users[0]));
        }
      })
    );
  }

  isLoggedIn(): boolean {
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.currentUserSubject.next(JSON.parse(user));
      return true;
    }
    return false;
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem('currentUser');
  }


  
}
