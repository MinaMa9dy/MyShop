import { Injectable, signal, computed } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private accessTokenKey = 'accessToken';
  private refreshTokenKey = 'refreshToken';
  
  // Signals for reactive state
  private accessTokenSignal = signal<string | null>(this.getAccessToken());
  private refreshTokenSignal = signal<string | null>(this.getRefreshToken());
  
  // Computed values
  isAuthenticated = computed(() => !!this.accessTokenSignal());
  
  constructor() {}
  
  getAccessToken(): string | null {
    return localStorage.getItem(this.accessTokenKey);
  }
  
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }
  
  setTokens(accessToken: string, refreshToken: string): void {
    console.log('TokenService - Setting tokens:', { accessToken: accessToken ? 'exists' : 'null', refreshToken: refreshToken ? 'exists' : 'null' });
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
    console.log('TokenService - Tokens saved to localStorage');
  }
  
  updateAccessToken(accessToken: string): void {
    localStorage.setItem(this.accessTokenKey, accessToken);
    this.accessTokenSignal.set(accessToken);
  }
  
  clearTokens(): void {
    localStorage.removeItem(this.accessTokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
  }
  
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    
    try {
      const payload = this.decodeToken(token);
      // If no exp claim, assume token is valid (not expired)
      if (!payload || !payload.exp) {
        console.log('Token has no exp claim, assuming not expired');
        return false;
      }
      
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      
      const isExpired = expirationDate < now;
      console.log('Token expiration check:', { expirationDate, now, isExpired });
      
      return isExpired;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }
  
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
  
  public decodeTokenPayload(token: string): any {
    return this.decodeToken(token);
  }
  
  getTokenExpiration(): Date | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return null;
      
      return new Date(payload.exp * 1000);
    } catch {
      return null;
    }
  }
}
