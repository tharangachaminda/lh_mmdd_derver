import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  getQuestionTypesForCategory,
  getDisplayNameForQuestionType,
  getCategoryInfo,
} from '../../../../core/models/question.model';

/**
 * Question type display interface
 */
export interface QuestionTypeDisplay {
  dbType: string; // Database type (e.g., 'ADDITION')
  displayName: string; // Human-readable name (e.g., 'Addition')
}

/**
 * TypeSelectionComponent
 *
 * Phase 4 - Question Type Selection View (REFACTOR Phase)
 * Displays question types for selected category as Material Design selectable chips.
 * Features multi-select support, responsive grid layout, and comprehensive accessibility.
 *
 * @remarks
 * Enhanced with Angular Material components following Material Design 3 guidelines.
 * Includes proper ARIA labels, keyboard navigation support, and responsive breakpoints.
 *
 * @example
 * ```typescript
 * // Standalone usage with query params
 * // Navigate from: /student/question-generator/categories?subject=mathematics&category=number-operations
 * // Component reads subject + category from query params and displays question types
 * <app-type-selection (typesSelected)="onTypesChange($event)"></app-type-selection>
 * ```
 */
@Component({
  selector: 'app-type-selection',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatButtonModule, MatIconModule],
  templateUrl: './type-selection.html',
  styleUrls: ['./type-selection.scss'],
})
export class TypeSelectionComponent implements OnInit {
  /**
   * Component title displayed to users
   */
  title = 'Select Question Types';

  /**
   * Subtitle with contextual information
   */
  subtitle = 'Choose one or more question types to practice';

  /**
   * Selected subject from query params (e.g., 'mathematics')
   */
  selectedSubject = '';

  /**
   * Selected category from query params (e.g., 'number-operations')
   */
  selectedCategory = '';

  /**
   * Question types available for the selected category
   * Loaded from Phase 1 QUESTION_CATEGORIES using helper functions
   */
  questionTypes: QuestionTypeDisplay[] = [];

  /**
   * Array of selected question type database keys
   * Supports multi-select functionality
   */
  selectedTypes: string[] = [];

  /**
   * Event emitter for type selection
   * Allows parent components to react to user's type choices
   */
  @Output() typesSelected = new EventEmitter<string[]>();

  constructor(private router: Router, private route: ActivatedRoute) {}

  /**
   * Initialize component and load data
   * Reads query params and loads question types for selected category
   */
  ngOnInit(): void {
    // Read subject and category from query params
    this.route.queryParams.subscribe((params) => {
      this.selectedSubject = params['subject'] || '';
      this.selectedCategory = params['category'] || '';

      // Load question types for category using Phase 1 helper
      this.loadQuestionTypes();
    });
  }

  /**
   * Load question types for the selected category
   * Uses Phase 1 helper functions to get types and transform to display names
   */
  loadQuestionTypes(): void {
    if (!this.selectedCategory) {
      this.questionTypes = [];
      return;
    }

    try {
      // Get question types for category from Phase 1
      const dbTypes = getQuestionTypesForCategory(this.selectedCategory);

      // Transform to display format with friendly names
      this.questionTypes = dbTypes.map((dbType) => ({
        dbType,
        displayName: getDisplayNameForQuestionType(dbType),
      }));
    } catch (error) {
      // Handle invalid category gracefully
      this.questionTypes = [];
    }
  }

  /**
   * Toggle selection state for a question type
   * Supports multi-select: clicking adds/removes from selection
   *
   * @param dbType - The database type identifier to toggle (e.g., 'ADDITION')
   *
   * @example
   * ```typescript
   * toggleTypeSelection('ADDITION');
   * // If not selected: adds to selectedTypes array
   * // If already selected: removes from selectedTypes array
   * ```
   */
  toggleTypeSelection(dbType: string): void {
    const index = this.selectedTypes.indexOf(dbType);
    if (index === -1) {
      // Not selected, add it
      this.selectedTypes.push(dbType);
    } else {
      // Already selected, remove it
      this.selectedTypes.splice(index, 1);
    }
  }

  /**
   * Check if a question type is currently selected
   *
   * @param dbType - The database type identifier to check
   * @returns True if the type is in selectedTypes array
   *
   * @example
   * ```typescript
   * const isSelected = isTypeSelected('ADDITION');
   * // Returns: true or false
   * ```
   */
  isTypeSelected(dbType: string): boolean {
    return this.selectedTypes.includes(dbType);
  }

  /**
   * Navigate to persona form with selected types
   * Passes subject, category, and selected types as query params
   *
   * @example
   * ```typescript
   * proceedToPersonaForm();
   * // Navigates to: /student/question-generator/persona
   * // Query params: ?subject=mathematics&category=number-operations&types=ADDITION,SUBTRACTION
   * // Emits: ['ADDITION', 'SUBTRACTION'] via typesSelected EventEmitter
   * ```
   */
  proceedToPersonaForm(): void {
    // Emit selection event
    this.typesSelected.emit(this.selectedTypes);

    // Navigate to persona form with all context
    this.router.navigate(['/student/question-generator/persona'], {
      queryParams: {
        subject: this.selectedSubject,
        category: this.selectedCategory,
        types: this.selectedTypes.join(','),
      },
    });
  }
}
