/**
 * Student Route Guard
 *
 * Protects student-only routes and redirects unauthorized users
 */

import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class StudentGuard implements CanActivate {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  canActivate(): boolean {
    const user = this.authService.getCurrentUser();

    // Check if user is authenticated and has student role
    if (user && user.role === UserRole.STUDENT) {
      return true;
    }

    // If not authenticated, redirect to login
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return false;
    }

    // If authenticated but wrong role, redirect to appropriate dashboard
    if (user?.role === UserRole.ADMIN) {
      this.router.navigate(['/admin/dashboard']);
      return false;
    }

    // Default fallback
    this.router.navigate(['/auth/login']);
    return false;
  }
}
