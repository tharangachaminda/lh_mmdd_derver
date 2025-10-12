/**
 * Authentication Service
 *
 * Handles user authentication, role management, and automatic routing
 * based on user roles (Student vs Admin)
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import {
  User,
  UserRole,
  LoginCredentials,
  AuthResponse,
  StudentRegistration,
} from '../models/user.model';
import { environment } from '../../../environments/environment';
import { AuthToken } from '../models/auth.model';
import { jwtDecode, JwtPayload } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly TOKEN_KEY = AuthToken.LEARNING_HUB_TOKEN_KEY;
  private readonly REFRESH_TOKEN_KEY = AuthToken.LEARNING_HUB_REFRESH_TOKEN_KEY;
  private readonly USER_KEY = AuthToken.LEARNING_HUB_USER_KEY;

  // Current user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Authentication state
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {
    // Check for existing authentication on service initialization
    this.initializeAuthState();
  }

  /**
   * Initialize authentication state from stored tokens
   */
  private initializeAuthState(): void {
    const token = this.getToken();
    const storedUser = this.getStoredUser();

    // TODO: Consider token expiration check
    if (token && storedUser) {
      // && !this.isTokenExpired(token) --- IGNORE for now ---
      this.currentUserSubject.next(storedUser);
      this.isAuthenticatedSubject.next(true);
    } else {
      this.clearAuthData();
    }
  }

  /**
   * User Login with role-based redirection
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<any>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        console.log('Login response:', response);
        // Transform backend response to frontend format
        const authResponse: AuthResponse = {
          success: response.success,
          message: response.message,
          user: response.user,
          accessToken: response.accessToken,
          refreshToken: response.refreshToken || response.accessToken, // Use accessToken as fallback
        };
        this.handleAuthSuccess(authResponse);
        this.redirectBasedOnRole(response.user.role);
      })
    );
  }

  /**
   * Student Registration
   */
  registerStudent(registration: StudentRegistration): Observable<AuthResponse> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register/student`, registration).pipe(
      tap((response) => {
        // For registration, we don't get tokens immediately, so redirect to login
        if (response.success) {
          this.router.navigate(['/auth/login'], {
            queryParams: {
              message: 'Registration successful! Please login with your credentials.',
            },
          });
        }
      })
    );
  }

  /**
   * Logout user and clear authentication data
   */
  logout(): void {
    console.log('Clearing authentication data: Logout');
    this.clearAuthData();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(tap((response) => this.handleAuthSuccess(response)));
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get user profile from backend
   */
  getProfile(): Observable<AuthResponse> {
    return this.http.get<AuthResponse>(`${environment.apiUrl}/auth/profile`);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Check if current user has specific role
   */
  hasRole(role: UserRole): boolean {
    const user = this.getCurrentUser();
    return user ? user.role === role : false;
  }

  /**
   * Check if current user is a student
   */
  isStudent(): boolean {
    return this.hasRole(UserRole.STUDENT);
  }

  /**
   * Check if current user is an admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Handle successful authentication
   */
  private handleAuthSuccess(response: AuthResponse): void {
    this.setAuthToken(response.accessToken);
    this.setRefreshToken(response.refreshToken);
    this.setStoredUser(response.user);

    this.currentUserSubject.next(response.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Store authentication token
   */
  private setAuthToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Store refresh token
   */
  private setRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Store user data
   */
  private setStoredUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Get stored user data
   */
  private getStoredUser(): User | null {
    const storedUser = localStorage.getItem(this.USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = jwtDecode<JwtPayload>(token, { header: true });
      console.log('Token payload:', payload);
      const currentTime = Math.floor(Date.now() / 1000);
      return false;
      // return payload.exp < currentTime;
    } catch (e) {
      console.error('Error decoding token:', e);
      return false;
    }
  }

  /**
   * Redirect user based on their role
   */
  private redirectBasedOnRole(role: UserRole): void {
    switch (role) {
      case UserRole.STUDENT:
        this.router.navigate(['/student/dashboard']);
        break;
      case UserRole.ADMIN:
        this.router.navigate(['/admin/dashboard']);
        break;
      default:
        this.router.navigate(['/auth/login']);
    }
  }

  /**
   * Password reset request
   */
  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, {
      email,
    });
  }

  /**
   * Reset password with token
   */
  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, {
      token,
      newPassword,
    });
  }
}
