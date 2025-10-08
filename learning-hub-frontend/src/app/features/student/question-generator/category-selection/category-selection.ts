import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { QUESTION_CATEGORIES, CategoryInfo } from '../../../../core/models/question.model';

/**
 * Category with progress tracking
 */
export interface CategoryWithProgress extends CategoryInfo {
  key: string; // Category identifier (e.g., 'number-operations')
  progress: {
    completed: number;
    total: number;
  };
}

/**
 * CategorySelectionComponent
 *
 * Phase 3 - Category Selection View (REFACTOR Phase)
 * Displays 8 mathematics question categories as Material Design cards.
 * Features responsive grid layout, progress indicators, and accessibility support.
 *
 * @remarks
 * Enhanced with Angular Material components following Material Design 3 guidelines.
 * Includes proper ARIA labels, keyboard navigation support, and responsive breakpoints.
 *
 * @example
 * ```typescript
 * // Standalone usage with query params
 * // Navigate from: /student/question-generator/select-subject?subject=mathematics
 * // Component reads subject from query params and displays relevant categories
 * <app-category-selection (categorySelected)="onCategoryChange($event)"></app-category-selection>
 * ```
 */
@Component({
  selector: 'app-category-selection',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatRippleModule,
    MatChipsModule,
  ],
  templateUrl: './category-selection.html',
  styleUrls: ['./category-selection.scss'],
})
export class CategorySelectionComponent implements OnInit {
  /**
   * Component title displayed to users
   */
  title = 'Select a Category';

  /**
   * Subtitle with contextual information
   */
  subtitle = 'Choose a mathematics topic to practice';

  /**
   * Selected subject from query params (e.g., 'mathematics')
   */
  selectedSubject = '';

  /**
   * Categories with progress tracking
   * Loaded from Phase 1 QUESTION_CATEGORIES with mock progress data
   */
  categories: CategoryWithProgress[] = [];

  /**
   * Event emitter for category selection
   * Allows parent components to react to user's category choice
   */
  @Output() categorySelected = new EventEmitter<string>();

  constructor(private router: Router, private route: ActivatedRoute) {}

  /**
   * Initialize component and load data
   * Reads query params and transforms Phase 1 categories with progress data
   */
  ngOnInit(): void {
    // Read subject from query params
    this.route.queryParams.subscribe((params) => {
      this.selectedSubject = params['subject'] || '';
    });

    // Load categories from Phase 1 with mock progress
    this.categories = Object.keys(QUESTION_CATEGORIES).map((key) => ({
      key, // Explicitly add the key property
      ...QUESTION_CATEGORIES[key],
      progress: {
        completed: 0,
        total: 100,
      },
    }));
  }

  /**
   * Calculate progress percentage for a category
   *
   * @param category - Category with progress data
   * @returns Progress percentage (0-100)
   *
   * @example
   * ```typescript
   * const category = { progress: { completed: 25, total: 100 } };
   * const percentage = getProgressPercentage(category);
   * // Returns: 25
   * ```
   */
  getProgressPercentage(category: CategoryWithProgress): number {
    if (!category.progress || category.progress.total === 0) {
      return 0;
    }
    return Math.round((category.progress.completed / category.progress.total) * 100);
  }

  /**
   * Handle category selection and navigate to question type view
   *
   * @param categoryKey - The selected category identifier (e.g., 'number-operations')
   *
   * @example
   * ```typescript
   * onCategorySelect('number-operations');
   * // Navigates to: /student/question-generator/types?subject=mathematics&category=number-operations
   * // Emits: 'number-operations' via categorySelected EventEmitter
   * ```
   */
  onCategorySelect(categoryKey: string): void {
    this.categorySelected.emit(categoryKey);
    this.router.navigate(['/student/question-generator/types'], {
      queryParams: {
        subject: this.selectedSubject,
        category: categoryKey,
      },
    });
  }
}
