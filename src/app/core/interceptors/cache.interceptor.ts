import { HttpInterceptorFn } from '@angular/common/http';

export const cacheInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip caching for non-GET requests
  if (req.method !== 'GET') {
    return next(req);
  }

  // Clone the request and add cache headers
  const modifiedReq = req.clone({
    setHeaders: {
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      'Vary': 'Accept-Encoding'
    }
  });

  return next(modifiedReq);
};
