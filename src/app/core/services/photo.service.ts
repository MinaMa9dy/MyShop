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

  private getServerRoot(): string {
    return environment.apiUrl.replace('/api', '');
  }

  getPhotoUrl(fileName: string | undefined, type: 'product' | 'user' = 'product'): string {
    if (!fileName) {
      return type === 'user' ? 'assets/images/user-placeholder.svg' : 'assets/images/placeholder.svg';
    }
    if (fileName.startsWith('http')) return fileName;
    
    // Normalize path: replace backslashes and remove leading slash
    let normalizedPath = fileName.replace(/\\/g, '/').replace(/^\//, '');
    
    let root = this.getServerRoot();
    
    // Deduplicate 'Photos/' if it appears both in the root (via environment/server config) 
    // and in the returned fileName/path from the backend
    if (root.endsWith('/Photos') && normalizedPath.startsWith('Photos/')) {
      normalizedPath = normalizedPath.substring(7);
    }
    
    // Safety check: if for some reason we still have double slashes or double Photos
    const fullUrl = `${root}/${normalizedPath}`;
    return fullUrl.replace(/\/Photos\/Photos\//g, '/Photos/');
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
    return mainPhoto ? this.getPhotoUrl(mainPhoto.url || (mainPhoto as any).fileName) : this.getPhotoUrl(photos[0].url || (photos[0] as any).fileName);
  }

  // Helper method to get photo URL from a path (handles full URLs or partial paths)
  getPhotoUrlFromPath(path: string): string {
    return this.getPhotoUrl(path);
  }
}
