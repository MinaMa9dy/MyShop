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
  
  // Get email from JWT token claims
  getEmail(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    const payload = this.decodeToken(token);
    if (!payload) return null;
    
    // Try common claim names for email
    if (payload.email) return payload.email;
    if (payload.emailaddress) return payload.emailaddress;
    if (payload.mail) return payload.mail;
    
    // Check for namespaced email claim
    for (const key of Object.keys(payload)) {
      if (key.toLowerCase().includes('emailaddress') || key.toLowerCase().includes('email')) {
        return payload[key];
      }
    }
    
    return null;
  }
  
  // Get name from JWT token claims
  getName(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    const payload = this.decodeToken(token);
    if (!payload) return null;
    
    // Try common claim names for name
    if (payload.name) return payload.name;
    if (payload.fullName) return payload.fullName;
    if (payload.firstName) {
      const lastName = payload.lastName || '';
      return `${payload.firstName} ${lastName}`.trim();
    }
    
    // Check for namespaced name claim
    for (const key of Object.keys(payload)) {
      if (key.toLowerCase().includes('name') && !key.toLowerCase().includes('identifier')) {
        return payload[key];
      }
    }
    
    return null;
  }

  // Get role from JWT token claims
  getRole(): string | null {
    const token = this.getAccessToken();
    if (!token) return null;
    
    const payload = this.decodeToken(token);
    if (!payload) return null;
    
    // Try common claim names for role
    if (payload.role) return payload.role;
    if (payload.roles) return Array.isArray(payload.roles) ? payload.roles[0] : payload.roles;
    if (payload.roleclaimtype) return payload.roleclaimtype;
    
    // Check for namespaced role claim
    for (const key of Object.keys(payload)) {
      if (key.toLowerCase().includes('role')) {
        return payload[key];
      }
    }
    
    return null;
  }

  // Check if user has a specific role
  hasRole(role: string): boolean {
    const userRole = this.getRole();
    if (!userRole) return false;
    
    if (Array.isArray(userRole)) {
      return userRole.includes(role);
    }
    
    return userRole.toLowerCase() === role.toLowerCase();
  }

  // Check if user is a Seller
  isSeller(): boolean {
    return this.hasRole('Seller');
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
