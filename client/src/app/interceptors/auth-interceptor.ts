import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Exclude authentication routes from the interceptor
  const exludedUrls = ['/auth', '/register', '/refresh'];
  const isExluded = exludedUrls.some(url => req.url.includes(url));

  if (isExluded) return next(req);

  // Add the token if present
  const token = authService.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }, 
      withCredentials: true
    });
  }

  return next(req).pipe(
    catchError(error => {
      // If you receive a 401 (Unauthorized) error, try refreshing the token.
      if (error.status === 401 && !req.url.includes('/refresh')) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            const newToken = authService.getAccessToken();
            const clonedReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });
            return next(clonedReq);
          }),
          catchError(refreshError => {
            authService.logout().subscribe();
            router.navigate(['/logout']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
