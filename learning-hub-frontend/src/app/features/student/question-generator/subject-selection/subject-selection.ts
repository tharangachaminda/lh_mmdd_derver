import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';

/**
 * Subject metadata interface
 */
export interface SubjectInfo {
  key: string;
  name: string;
  description: string;
  icon: string;
  color?: string; // Optional theme color for visual distinction
}

/**
 * SubjectSelectionComponent
 *
 * Phase 2 - Subject Selection View (REFACTOR Phase)
 * Displays available subjects as Material Design cards for students to choose from.
 * Features responsive grid layout, Material Design styling, and accessibility support.
 *
 * @remarks
 * Enhanced with Angular Material components following Material Design guidelines.
 * Includes proper ARIA labels, keyboard navigation support, and responsive breakpoints.
 *
 * @example
 * ```typescript
 * // Standalone usage
 * <app-subject-selection (subjectSelected)="onSubjectChange($event)"></app-subject-selection>
 *
 * // With router outlet
 * <router-outlet></router-outlet>
 * ```
 */
@Component({
  selector: 'app-subject-selection',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatRippleModule],
  templateUrl: './subject-selection.html',
  styleUrls: ['./subject-selection.scss'],
})
export class SubjectSelectionComponent {
  /**
   * Component title displayed to users
   */
  title = 'Select a Subject';

  /**
   * Available subjects for question generation
   * Each subject includes metadata for display and navigation
   */
  subjects: SubjectInfo[] = [
    {
      key: 'mathematics',
      name: 'Mathematics',
      description: 'Practice math questions across all topics',
      icon: 'calculate',
      color: '#1976d2', // Material Blue 700
    },
  ];

  /**
   * Event emitter for subject selection
   * Allows parent components to react to user's subject choice
   */
  @Output() subjectSelected = new EventEmitter<string>();

  constructor(private router: Router, private route: ActivatedRoute) {}

  /**
   * Handle subject selection and navigate to category view
   *
   * @param subjectKey - The selected subject identifier (e.g., 'mathematics')
   *
   * @example
   * ```typescript
   * onSubjectSelect('mathematics');
   * // Navigates to: /student/question-generator/categories?subject=mathematics
   * // Emits: 'mathematics' via subjectSelected EventEmitter
   * ```
   */
  onSubjectSelect(subjectKey: string): void {
    this.subjectSelected.emit(subjectKey);
    this.router.navigate(['/student/question-generator/categories'], {
      queryParams: { subject: subjectKey, grade: this.route.snapshot.queryParams['grade'] || '' },
    });
  }
}
