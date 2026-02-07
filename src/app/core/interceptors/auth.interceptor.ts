import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';

// Public endpoints that don't require authentication
const publicEndpoints = [
  '/Products/',
  '/Categories/',
  '/Home/'
];

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = tokenService.getAccessToken();
  const refreshToken = tokenService.getRefreshToken();
  
  // Skip for login, register, and refresh token endpoints
  const isAuthEndpoint = req.url.includes('/Account/Login') || 
                          req.url.includes('/Account/Register') ||
                          req.url.includes('/Account/RefreshToken');
  
  // Check if this is a public endpoint
  const isPublicEndpoint = publicEndpoints.some(endpoint => req.url.includes(endpoint));
  
  // Add token to request if available
  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized
      if (error.status === 401 && !isAuthEndpoint) {
        // For public endpoints, just pass through without redirecting
        // This allows public pages to work even with expired/invalid token
        if (isPublicEndpoint) {
          return throwError(() => error);
        }
        
        // For protected endpoints (Cart, etc.), try token refresh
        if (refreshToken) {
          return authService.refreshToken().pipe(
            switchMap((response) => {
              // Token refreshed successfully
              tokenService.setTokens(response.token, response.refreshToken || refreshToken);
              
              // Retry current request with new token
              const clonedReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.token}`
                }
              });
              return next(clonedReq);
            }),
            catchError((refreshError: HttpErrorResponse) => {
              // Check if refresh failed with "You should Login" or 401
              const errorMessage = refreshError.error?.message || refreshError.message || '';
              const shouldRedirectToLogin = 
                refreshError.status === 401 ||
                errorMessage === 'You should Login' ||
                errorMessage.includes('You should Login');
              
              if (shouldRedirectToLogin) {
                authService.logout();
                const lang = localStorage.getItem('language') || 'en';
                router.navigate([`/${lang}/auth/login`]);
              }
              
              return throwError(() => refreshError);
            })
          );
        } else {
          // No refresh token - redirect to login
          authService.logout();
          const lang = localStorage.getItem('language') || 'en';
          router.navigate([`/${lang}/auth/login`]);
        }
      }
      
      // For other errors, just pass through
      return throwError(() => error);
    })
  );
};
