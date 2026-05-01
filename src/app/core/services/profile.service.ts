import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserProfile } from '../models/auth.model';
import { Result } from '../models/result.model';

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

  getProfile(userId?: string): Observable<Result<UserProfile>> {
    const url = userId ? `${this.apiUrl}/${userId}` : `${this.apiUrl}/me`;
    return this.http.get<Result<UserProfile>>(url);
  }

  updateProfile(dto: UpdateProfileDto): Observable<Result<any>> {
    return this.http.put<Result<any>>(this.apiUrl, dto);
  }

  changePassword(dto: ChangePasswordDto): Observable<Result<any>> {
    return this.http.put<Result<any>>(`${this.apiUrl}/Change-Password`, dto);
  }

  uploadImage(file: File): Observable<Result<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Result<any>>(`${this.apiUrl}/Upload-Image`, formData);
  }

  deleteImage(): Observable<Result<any>> {
    return this.http.delete<Result<any>>(`${this.apiUrl}/Delete-Image`);
  }

  deleteAccount(): Observable<Result<any>> {
    return this.http.delete<Result<any>>(`${this.apiUrl}/Delete-Account`);
  }
}
