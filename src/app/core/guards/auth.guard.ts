import { inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenService } from '../services/token.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const tokenService = inject(TokenService);
  const router = inject(Router);
  
  // Get current language from localStorage
  const currentLang = localStorage.getItem('language') || 'en';
  
  // Check for required roles
  const requiredRoles = route.data['roles'] as string[] | undefined;
  
  // Check if a token exists (even if expired, we'll try to refresh it)
  const hasToken = !!tokenService.getAccessToken();
  const hasRefreshToken = !!tokenService.getRefreshToken();
  
  if (!hasToken || !hasRefreshToken) {
    // No tokens at all, redirect to login with language prefix
    router.navigate([`/${currentLang}/auth/login`], { 
      queryParams: { returnUrl: route.url.map(segment => segment.path).join('/') } 
    });
    return false;
  }
  
  // If token exists but is expired, we'll let the interceptor try to refresh it
  // The guard allows navigation, interceptor will handle 401 and refresh
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRole = requiredRoles.some(role => authService.hasRole(role));
    if (!hasRole) {
      router.navigate([`/${currentLang}/unauthorized`]);
      return false;
    }
  }
  
  return true;
};
