import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  user: User | null = null;
  loading = true;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  /**
   * Load current user profile information
   */
  private loadUserProfile(): void {
    // First try to get user from current state
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = currentUser;
      this.loading = false;
      return;
    }

    // If no current user, fetch from backend
    this.authService.getProfile().subscribe({
      next: (response: any) => {
        this.user = response.data.user;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Failed to load user profile:', error);
        this.loading = false;
        // If profile loading fails, user might not be authenticated
        this.authService.logout();
      }
    });
  }

  /**
   * Handle user logout
   */
  onLogout(): void {
    this.authService.logout();
  }
}
