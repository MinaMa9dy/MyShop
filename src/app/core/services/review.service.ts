import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review } from '../models/review.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/Reviews`;

  addReview(review: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, review);
  }

  getReviewsByProductId(productId: string, page: number = 1, pageSize: number = 4): Observable<any> {
    return this.http.get<any>(
      `${this.baseUrl}/Product/${productId}`, {
        params: {
          page: page.toString(),
          pageSize: pageSize.toString()
        }
      }
    );
  }
}
