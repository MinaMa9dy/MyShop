import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, AddOrderDto } from '../models/order.model';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private apiUrl = `${environment.apiUrl}/order`;

  private getCurrentUserId(): string {
    const userId = this.tokenService.getUserId();
    return userId || '';
  }

  // Get orders by user ID - uses GET api/Order?userId={userId}
  getOrdersByUserId(userId?: string): Observable<Order[]> {
    const id = userId || this.getCurrentUserId();
    
    return this.http.get<Order[]>(`${this.apiUrl}?customerId=${id}`);
  }

  // Create a new order - uses POST api/Order
  createOrder(order: AddOrderDto): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order);
  }

  // Get orders by seller ID - uses GET api/Order/SellerOrders?sellerId={sellerId}
  getOrdersBySellerId(sellerId: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/SellerOrders?sellerId=${sellerId}`);
  }

  // Get orders for the current logged-in seller
  getCurrentSellerOrders(): Observable<Order[]> {
    const sellerId = this.getCurrentUserId();
    return this.getOrdersBySellerId(sellerId);
  }
}
