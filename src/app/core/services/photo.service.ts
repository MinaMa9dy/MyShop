import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PhotoUploadDto {
  productId: string;
  isMain: boolean;
}

export interface ProductPhoto {
  id: string;
  productId: string;
  fileName: string;
  relativePath: string;
  contentType: string;
  fileSize: number;
  isMain: boolean;
  createdAt: string;
  // Helper property for display URL
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/Photo`;

  uploadPhoto(file: File, productId: string, isMain: boolean = false): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('productId', productId);
    formData.append('isMain', isMain.toString());

    return this.http.post<any>(this.apiUrl, formData);
  }

  getPhotoUrl(fileName: string): string {
    return `${this.apiUrl}/${fileName}`;
  }

  getPhotosByProductId(productId: string): Observable<ProductPhoto[]> {
    return this.http.get<ProductPhoto[]>(`${this.apiUrl}/product/${productId}`);
  }

  deletePhoto(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Helper method to get main photo URL for a product
  getMainPhotoUrl(photos: ProductPhoto[]): string | null {
    if (!photos || photos.length === 0) return null;
    const mainPhoto = photos.find(p => p.isMain);
    return mainPhoto ? this.getPhotoUrl(mainPhoto.fileName) : this.getPhotoUrl(photos[0].fileName);
  }
}
