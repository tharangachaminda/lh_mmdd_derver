/**
 * Authentication Interceptor
 *
 * Automatically adds Bearer token to HTTP requests and handles auth errors
 */

import { Injectable, inject } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly authService = inject(AuthService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get the auth token
    const token = this.authService.getToken();

    // Clone the request and add the authorization header if token exists
    let authRequest = request;
    if (token && !this.isAuthEndpoint(request.url)) {
      authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Handle the request and catch auth errors
    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Token expired or invalid, attempt refresh
          return this.handle401Error(authRequest, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if the request is to an auth endpoint (login/register)
   */
  private isAuthEndpoint(url: string): boolean {
    return (
      url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh')
    );
  }

  /**
   * Handle 401 Unauthorized errors
   */
  private handle401Error(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Try to refresh the token
    return this.authService.refreshToken().pipe(
      switchMap((response) => {
        // Retry the original request with new token
        const newAuthRequest = request.clone({
          setHeaders: {
            Authorization: `Bearer ${response.accessToken}`,
          },
        });
        return next.handle(newAuthRequest);
      }),
      catchError((error) => {
        // Refresh failed, logout user
        this.authService.logout();
        return throwError(() => error);
      })
    );
  }
}
