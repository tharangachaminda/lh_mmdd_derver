/**
 * Admin Route Guard
 *
 * Protects admin-only routes and redirects unauthorized users
 */

import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    // Check if user is authenticated and has admin role
    if (user && user.role === UserRole.ADMIN) {
      return true;
    }

    // If not authenticated, redirect to login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // If authenticated but wrong role, redirect to appropriate dashboard
    if (user?.role === UserRole.STUDENT) {
      this.router.navigate(['/student/dashboard']);
      return false;
    }

    // Default fallback
    this.router.navigate(['/auth/login']);
    return false;
  }
}
