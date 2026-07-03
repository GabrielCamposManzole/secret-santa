import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Injeção global de token JWT fictício ou do Supabase caso use requisições HttpClient REST
  let clonedRequest = req;
  const userId = authService.getCurrentUserId();
  if (userId) {
    clonedRequest = req.clone({
      headers: req.headers.set('X-User-ID', userId),
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error(
        '%c[HTTP Error Interceptor] Requisição falhou:',
        'color: #ffffff; background-color: #ef4444; font-weight: bold; padding: 4px; border-radius: 4px;',
        {
          url: req.url,
          status: error.status,
          message: error.message,
        },
      );

      if (error.status === 401) {
        // Trata erros de autenticação expirada / não autorizada de forma centralizada
        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
    }),
  );
};
