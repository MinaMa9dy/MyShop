import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError, BehaviorSubject, shareReplay, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  LoginDto, 
  RegisterDto, 
  AuthenticationResponseDto, 
  TokenModelDto,
  User,
  UserProfile,
  ConfirmEmailDto,
  ResendEmailConfirmationDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  GoogleLoginDto
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
  
  private apiUrl = `${environment.apiUrl}/Auth`;
  
  // Signals for user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  
  private isLoggedInSignal = signal<boolean>(this.tokenService.isAuthenticated());
  
  isLoggedIn = this.isLoggedInSignal.asReadonly();
  
  // Event for cart sync
  public loginSuccess = new BehaviorSubject<boolean>(false);
  
  // Track ongoing refresh request to prevent multiple concurrent calls
  private refreshTokenInProgress$: Observable<AuthenticationResponseDto> | null = null;
  
  login(credentials: LoginDto): Observable<AuthenticationResponseDto> {
    return this.http.post<AuthenticationResponseDto>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          console.log('Login response:', response);
          if (response && response.accessToken) {
            this.tokenService.setTokens(response.accessToken, response.refreshToken || '');
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
    return this.http.post<AuthenticationResponseDto>(`${this.apiUrl}/register`, user)
      .pipe(
        tap(response => {
          console.log('Register response:', response);
          if (response && response.accessToken) {
            this.tokenService.setTokens(response.accessToken, response.refreshToken || '');
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
    if (this.refreshTokenInProgress$) {
      console.log('AuthService - Refresh already in progress, returning existing observable');
      return this.refreshTokenInProgress$;
    }

    const token = this.tokenService.getAccessToken();
    const refreshToken = this.tokenService.getRefreshToken();
    
    if (!refreshToken) {
      console.error('AuthService - No refresh token available');
      return throwError(() => new Error('No refresh token available'));
    }
    
    const tokenModel = {
      accessToken: token || '',
      refreshToken: refreshToken
    };
    
    console.log('AuthService - Initiating token refresh');
    
    this.refreshTokenInProgress$ = this.http.post<AuthenticationResponseDto>(`${this.apiUrl}/refresh`, tokenModel)
      .pipe(
        tap(response => {
          console.log('AuthService - Refresh token response received');
          if (response && response.accessToken) {
            const newRefreshToken = response.refreshToken || refreshToken;
            this.tokenService.setTokens(response.accessToken, newRefreshToken);
            console.log('AuthService - Tokens updated successfully');
          }
        }),
        catchError((error: any) => {
          console.error('AuthService - Refresh token failed, logging out:', error);
          this.logout();
          return throwError(() => error);
        }),
        finalize(() => {
          this.refreshTokenInProgress$ = null;
        }),
        shareReplay(1)
      );

    return this.refreshTokenInProgress$;
  }
  
  confirmEmail(dto: ConfirmEmailDto): Observable<string> {
    return this.http.get(`${this.apiUrl}/ConfirmEmail`, {
      params: { userId: dto.userId, token: dto.token },
      responseType: 'text'
    });
  }

  resendEmailConfirmation(dto: ResendEmailConfirmationDto): Observable<string> {
    return this.http.post(`${this.apiUrl}/ResendEmailConfirmation`, dto, { responseType: 'text' });
  }

  forgotPassword(dto: ForgotPasswordDto): Observable<string> {
    return this.http.post(`${this.apiUrl}/ForgotPassword`, dto, { responseType: 'text' });
  }

  resetPassword(dto: ResetPasswordDto): Observable<string> {
    return this.http.post(`${this.apiUrl}/ResetPassword`, dto, { responseType: 'text' });
  }

  googleLogin(dto: GoogleLoginDto): Observable<AuthenticationResponseDto> {
    return this.http.post<AuthenticationResponseDto>(`${this.apiUrl}/google-login`, dto)
      .pipe(
        tap(response => {
          console.log('Google login response:', response);
          if (response && response.accessToken) {
            this.tokenService.setTokens(response.accessToken, response.refreshToken || '');
            this.isLoggedInSignal.set(true);
            this.loadCurrentUser();
            // Trigger cart sync
            this.loginSuccess.next(true);
          } else {
            console.error('No token in google login response:', response);
          }
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
