/**
 * Application Routes
 *
 * Role-based routing structure for Learning Hub platform
 */

import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { StudentGuard } from './core/guards/student.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { UnifiedGeneratorComponent } from './features/student/question-generator/unified-generator/unified-generator';

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
      // Phase 5: Question Generator - New multi-step flow
      {
        path: 'question-generator/select-subject',
        loadComponent: () =>
          import('./features/student/question-generator/subject-selection/subject-selection').then(
            (m) => m.SubjectSelectionComponent
          ),
      },
      {
        path: 'question-generator/categories',
        loadComponent: () =>
          import(
            './features/student/question-generator/category-selection/category-selection'
          ).then((m) => m.CategorySelectionComponent),
      },
      // Session 08: Unified Generator - Combines type selection + persona + configuration
      {
        path: 'question-generator/unified',
        loadComponent: () => UnifiedGeneratorComponent,
      },
      // Phase A6.5: Results display for AI-validated answers
      {
        path: 'question-generator/results',
        loadComponent: () =>
          import('./features/student/question-generator/results/results.component').then(
            (m) => m.ResultsComponent
          ),
      },
      // Existing question generator (persona, generating, questions, results steps)
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
