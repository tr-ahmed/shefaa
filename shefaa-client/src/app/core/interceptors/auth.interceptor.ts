import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const token = auth.token();
  let cloned = req;
  if (token) {
    cloned = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(cloned).pipe(
    catchError(err => {
      if (err.status === 401 && !req.url.includes('/auth/login')) {
        auth.logout();
        router.navigate(['/auth/login']);
      }
      return throwError(() => err);
    })
  );
};