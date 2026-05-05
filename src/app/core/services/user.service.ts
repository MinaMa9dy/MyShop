import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Result } from '../models/result.model';
import { UserProfile } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Profile`;

  searchUsers(query: string): Observable<Result<UserProfile[]>> {
    return this.http.get<Result<UserProfile[]>>(`${this.apiUrl}/Search`, { params: { query } });
  }

  getAllUsers(): Observable<Result<UserProfile[]>> {
    return this.http.get<Result<UserProfile[]>>(`${this.apiUrl}/All`);
  }

  searchCustomers(query: string): Observable<Result<UserProfile[]>> {
    return this.http.get<Result<UserProfile[]>>(`${this.apiUrl}/Customers/Search`, { params: { query } });
  }

  getAllCustomers(): Observable<Result<UserProfile[]>> {
    return this.http.get<Result<UserProfile[]>>(`${this.apiUrl}/Customers/All`);
  }

  getUserById(id: string): Observable<Result<UserProfile>> {
    return this.http.get<Result<UserProfile>>(`${this.apiUrl}/${id}`);
  }
}

