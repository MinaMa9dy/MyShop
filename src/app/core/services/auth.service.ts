import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  LoginDto, 
  RegisterDto, 
  AuthenticationResponseDto, 
  TokenModelDto,
  User 
} from '../models/auth.model';
import { TokenService } from './token.service';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private tokenService = inject(TokenService);
  private cartService = inject(CartService);
  
  private apiUrl = `${environment.apiUrl}/Account`;
  
  // Signals for user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private isLoggedInSignal = signal<boolean>(this.tokenService.isAuthenticated());
  
  isLoggedIn = this.isLoggedInSignal.asReadonly();
  
  // Event for cart sync
  public loginSuccess = new BehaviorSubject<boolean>(false);
  
  login(credentials: LoginDto): Observable<AuthenticationResponseDto> {
    return this.http.post<AuthenticationResponseDto>(`${this.apiUrl}/Login`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          if (response && response.token) {
            this.tokenService.setTokens(response.token, response.refreshToken || '');
            this.isLoggedInSignal.set(true);
            this.loadCurrentUser();
            // Trigger cart sync
            this.loginSuccess.next(true);
          } else {
            console.error('No token in login response:', response);
          }
        })
      );
  }
  
  register(user: RegisterDto): Observable<AuthenticationResponseDto> {
    return this.http.post<AuthenticationResponseDto>(`${this.apiUrl}/Register`, user)
      .pipe(
        tap(response => {
          console.log('Register response:', response);
          if (response && response.token) {
            this.tokenService.setTokens(response.token, response.refreshToken || '');
            this.isLoggedInSignal.set(true);
            this.loadCurrentUser();
            // Trigger cart sync
            this.loginSuccess.next(true);
          } else {
            console.error('No token in register response:', response);
          }
        })
      );
  }
  
  refreshToken(): Observable<AuthenticationResponseDto> {
    const token = this.tokenService.getAccessToken();
    const refreshToken = this.tokenService.getRefreshToken();
    
    console.log('AuthService - refreshToken - token exists:', !!token, 'refreshToken exists:', !!refreshToken);
    
    if (!refreshToken) {
      console.error('AuthService - No refresh token available');
      return throwError(() => new Error('No refresh token available'));
    }
    
    const tokenModel = {
      token: token || '',
      refreshToken: refreshToken
    };
    
    console.log('AuthService - Sending refresh request to:', `${this.apiUrl}/RefreshToken`);
    console.log('AuthService - Token model:', tokenModel);
    
    return this.http.post<AuthenticationResponseDto>(`${this.apiUrl}/RefreshToken`, tokenModel)
      .pipe(
        tap(response => {
          console.log('AuthService - Refresh token response received:', response);
          if (response && response.token) {
            // Update with new access token and existing refresh token
            const newRefreshToken = response.refreshToken || refreshToken;
            this.tokenService.setTokens(response.token, newRefreshToken);
            console.log('AuthService - Tokens updated successfully');
          } else {
            console.warn('AuthService - No token in refresh response');
          }
        }),
        catchError((error: any) => {
          console.error('AuthService - Refresh token HTTP error:', error);
          this.logout();
          return throwError(() => error);
        })
      );
  }
  
  logout(): void {
    this.tokenService.clearTokens();
    this.isLoggedInSignal.set(false);
    this.currentUserSubject.next(null);
    // Clear cart data on logout to prevent stale data persistence
    this.cartService.clear();
  }
  
  loadCurrentUser(): void {
    if (!this.tokenService.isAuthenticated()) {
      return;
    }
    
    // You can add an endpoint to get current user info
    // For now, we'll decode the token to get basic user info
    const token = this.tokenService.getAccessToken();
    if (token) {
      const user = this.decodeTokenUser(token);
      if (user) {
        this.currentUserSubject.next(user);
      }
    }
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
  
  getUserId(): string {
    const user = this.currentUserSubject.value;
    return user?.id || '';
  }
  
  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated() && !this.tokenService.isTokenExpired();
  }
  
  private decodeTokenUser(token: string): User | null {
    try {
      const payload = this.tokenService.decodeTokenPayload(token);
      if (!payload) return null;
      
      return {
        id: payload.nameid || payload.sub,
        email: payload.email || payload.unique_name,
        roles: payload.role ? [payload.role] : (payload.roles || []),
        firstName: payload.given_name,
        lastName: payload.family_name
      };
    } catch {
      return null;
    }
  }
  
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return user.roles.includes(role);
  }
}
