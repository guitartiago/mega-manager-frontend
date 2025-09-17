import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenStorage } from './token-storage';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

// Anexa o Bearer token
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorage).get();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};

// Trata 401/403 globalmente
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(TokenStorage);
  const router = inject(Router);

  return next(req).pipe(
    catchError(err => {
      if (err.status === 401 || err.status === 403) {
        token.clear();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};