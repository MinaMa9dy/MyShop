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
  private baseUrl = `${environment.apiUrl}/Review`;

  addReview(review: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, review);
  }

  getReviewsByProductId(productId: string): Observable<Review[]> {
    return this.http.get<Review[]>(
      `${this.baseUrl}/GetReviewsByProductId?productId=${productId}`
    );
  }
}
