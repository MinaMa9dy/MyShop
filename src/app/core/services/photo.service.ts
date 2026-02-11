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

  // Helper method to get photo URL from a path (handles full URLs or partial paths)
  getPhotoUrlFromPath(path: string): string {
    if (!path) {
      return 'assets/images/placeholder.svg';
    }
    
    // Backend returns full URLs like http://192.168.1.8:4100/api/Photo/filename.jpg
    // If it's already a full URL (contains http), return as-is
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    
    // Extract just the filename from the path
    let fileName = path;
    
    // Find the last slash and get everything after it
    const lastSlashIndex = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    if (lastSlashIndex >= 0) {
      fileName = path.substring(lastSlashIndex + 1);
    }
    
    return `${this.apiUrl}/${fileName}`;
  }
}
