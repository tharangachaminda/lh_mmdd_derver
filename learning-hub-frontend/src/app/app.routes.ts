/**
 * Application Routes
 *
 * Role-based routing structure for Learning Hub platform
 */

import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { StudentGuard } from './core/guards/student.guard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Default redirect to login
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },

  // Authentication routes (public)
  {
    path: 'auth/login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'auth/register',
    loadComponent: () =>
      import('./features/auth/register/register').then((m) => m.RegisterComponent),
  },

  // Student routes (protected by AuthGuard and StudentGuard)
  {
    path: 'student',
    canActivate: [AuthGuard, StudentGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/student/dashboard/dashboard').then((m) => m.Dashboard),
      },
      {
        path: 'question-generator',
        loadComponent: () =>
          import('./features/student/question-generator/question-generator').then(
            (m) => m.QuestionGenerator
          ),
      },
    ],
  },

  // Admin routes (protected by AuthGuard and AdminGuard)
  {
    path: 'admin',
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
      },
    ],
  },

  // 404 fallback
  {
    path: '**',
    redirectTo: '/auth/login',
  },
];
