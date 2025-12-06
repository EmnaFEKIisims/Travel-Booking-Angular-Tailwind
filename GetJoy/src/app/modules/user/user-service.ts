import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable , throwError } from 'rxjs';
import { tap , switchMap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class UserService {

  private apiUrl = 'http://localhost:3000/users';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}


     signup(userData: { fullName: string; email: string; password: string }): Observable<any> {
      return this.http.get<any[]>(this.apiUrl).pipe(
        switchMap(users => {
          // Check if email already exists
          const existingUser = users.find(user => user.email === userData.email);
          if (existingUser) {
            return throwError(() => ({ customError: 'Email already exists' }));
          }

          // Get the last user ID and add 1
          const lastUserId = users.length > 0 ? Math.max(...users.map(user => user.id)) : 0;
          const newUserId = lastUserId + 1;

          // Create new user with the new ID
          const newUser = {
            ...userData,
            id: newUserId
          };

          // Create the user
          return this.http.post<any>(this.apiUrl, newUser);
        }),
        tap((newUser: any) => {
          // Auto-login after successful signup
          this.currentUserSubject.next(newUser);
          localStorage.setItem('currentUser', JSON.stringify(newUser));
        })
      );
  }



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
