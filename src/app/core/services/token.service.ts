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
    localStorage.setItem(this.accessTokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    this.accessTokenSignal.set(accessToken);
    this.refreshTokenSignal.set(refreshToken);
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
      if (!payload || !payload.exp) return false;
      
      const expirationDate = new Date(payload.exp * 1000);
      const now = new Date();
      return expirationDate < now;
    } catch {
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
  
  // Get userId from JWT token claims
  getUserId(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    const payload = this.decodeToken(token);
    if (!payload) return null;
    
    // Log payload for debugging (remove in production)
    console.log('Token payload:', JSON.stringify(payload, null, 2));
    
    // Try common claim names for userId
    return payload.sub || payload.userId || payload.nameid || payload.id || payload.UserId || payload.UserID || payload.uid || null;
  }
  
  // Get all claims from token (for debugging)
  getAllClaims(): any {
    const token = this.getAccessToken();
    if (!token) return null;
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
