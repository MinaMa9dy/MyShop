import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order, AddOrderDto } from '../models/order.model';
import { TokenService } from './token.service';
import { Result } from '../models/result.model';
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private apiUrl = `${environment.apiUrl}/Orders`;

  private getCurrentUserId(): string {
    const userId = this.tokenService.getUserId();
    return userId || '';
  }

  // Get all orders (Admin only)
  getAllOrders(page: number = 1, pageSize: number = 10): Observable<Result<Order[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<Result<Order[]>>(this.apiUrl, { params });
  }

  // Get orders for the current user
  getMyOrders(): Observable<Result<Order[]>> {
    return this.http.get<Result<Order[]>>(`${this.apiUrl}/my-orders`);
  }

  // Legacy support or specific user lookup (if allowed)
  getOrdersByUserId(userId?: string): Observable<Result<Order[]>> {
    const id = userId || this.getCurrentUserId();
    return this.http.get<Result<Order[]>>(`${this.apiUrl}/my-orders`); // Simplified to my-orders for now
  }

  // Get order by ID
  getOrderById(id: string): Observable<Result<Order>> {
    return this.http.get<Result<Order>>(`${this.apiUrl}/${id}`);
  }

  // Create a new order
  createOrder(order: AddOrderDto): Observable<Result<Order>> {
    return this.http.post<Result<Order>>(this.apiUrl, order);
  }

  // Get orders for the current logged-in seller
  getCurrentSellerOrders(): Observable<Result<Order[]>> {
    return this.http.get<Result<Order[]>>(`${this.apiUrl}/SellerOrders`);
  }

  // Get orders by seller ID (Legacy support, now uses current user context)
  getOrdersBySellerId(sellerId?: string): Observable<Result<Order[]>> {
    return this.getCurrentSellerOrders();
  }

  // Update order status (Admin only)
  updateOrderStatus(id: string, status: number): Observable<Result<Order>> {
    return this.http.patch<Result<Order>>(`${this.apiUrl}/${id}/status`, { orderId: id, status });
  }

  // Cancel order
  cancelOrder(id: string): Observable<Result<Order>> {
    return this.http.patch<Result<Order>>(`${this.apiUrl}/${id}/cancel`, {});
  }
}

