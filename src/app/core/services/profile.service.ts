import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/auth.model';

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Profile`;

  getProfile(userId?: string): Observable<UserProfile> {
    const url = userId ? `${this.apiUrl}/${userId}` : `${this.apiUrl}/me`;
    return this.http.get<UserProfile>(url);
  }

  updateProfile(dto: UpdateProfileDto): Observable<any> {
    return this.http.put(this.apiUrl, dto);
  }

  changePassword(dto: ChangePasswordDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/Change-Password`, dto);
  }

  uploadImage(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/Upload-Image`, formData);
  }

  deleteImage(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Delete-Image`);
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/Delete-Account`);
  }
}
