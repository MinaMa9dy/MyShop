import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';

// Public endpoints that don't require authentication
const publicEndpoints = [
  '/Products/',
  '/Categories/',
  '/Home/',
  '/Photo/'
];

/**
 * Check if user is authenticated based on token presence
 * User is considered authenticated only if BOTH access token and refresh token exist
 */
function isUserAuthenticated(tokenService: TokenService): boolean {
  const hasAccessToken = !!tokenService.getAccessToken();
  const hasRefreshToken = !!tokenService.getRefreshToken();
  return hasAccessToken && hasRefreshToken;
}

/**
 * Check if request should be silently handled for unauthenticated users
 * GET Cart requests should not redirect unauthenticated users
 */
function shouldHandleSilentlyForUnauthenticated(req: HttpRequest<unknown>): boolean {
  return (req.url.includes('/Cart') && req.method === 'GET') || 
         req.url.includes('/Profile');
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const tokenService = inject(TokenService);
  const authService = inject(AuthService);
  const cartService = inject(CartService);
  const router = inject(Router);
  
  const token = tokenService.getAccessToken();
  const refreshToken = tokenService.getRefreshToken();
  const isAuthenticated = isUserAuthenticated(tokenService);
  
  // Check if this is an authentication-related endpoint (login, register, refresh, etc.)
  // These should not have the current token added to them and should not trigger a refresh 401 loop
  const authEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/confirmemail',
    '/auth/forgotpassword',
    '/auth/resetpassword',
    '/auth/resendemailconfirmation',
    '/auth/google-login'
  ];
  
  const isAuthEndpoint = authEndpoints.some(path => req.url.toLowerCase().includes(path));
  
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
        
        // CASE 1: User is not authenticated (missing access token or refresh token)
        // Redirect to login immediately without attempting refresh
        if (!isAuthenticated) {
          // Do NOT redirect guests/unauthenticated users to login automatically.
          // This allows public pages to call endpoints that might return 401 without forcing a redirect.
          // Navigation to login should be handled by Auth Guards or specific component logic.
          console.log('AuthInterceptor - User not authenticated (missing tokens) and 401 received, passing through without redirect');
          return throwError(() => error);
        }
        
        // CASE 2: User IS authenticated (has both tokens)
        // Attempt to refresh the access token
        console.log('AuthInterceptor - Authenticated user with 401, attempting token refresh');
        
        return authService.refreshToken().pipe(
          switchMap((response) => {
            // Refresh succeeded (2xx status)
            console.log('AuthInterceptor - Token refresh succeeded');
            
            // Update tokens with new values
            const newRefreshToken = response.data?.refreshToken || refreshToken || '';
            tokenService.setTokens(response.data?.accessToken || '', newRefreshToken);
            
            // Retry original request with new token
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${response.data?.accessToken}`
              }
            });
            return next(clonedReq);
          }),
          catchError((refreshError: HttpErrorResponse) => {
            // Only logout if refresh token ALSO returns 401
            // This indicates the session is fully compromised (both tokens invalid)
            if (refreshError.status === 401) {
              console.log('AuthInterceptor - Token refresh returned 401, logging out user');
              authService.logout();
            } else {
              // Refresh returned other error (404, 400, etc.)
              // Don't logout automatically - just pass the error through
              console.log('AuthInterceptor - Token refresh returned non-401 error, passing through');
            }
            
            return throwError(() => refreshError);
          })
        );
      }
      
      // For other errors, pass through
      return throwError(() => error);
    })
  );
};
