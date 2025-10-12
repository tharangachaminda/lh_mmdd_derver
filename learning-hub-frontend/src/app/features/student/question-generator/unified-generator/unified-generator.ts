/**
 * Unified Generator Component
 *
 * Phase B1 GREEN - Implementation
 * Session 08 - TN-FEATURE-NEW-QUESTION-GENERATION-UI
 * Phase A6 Update - Short Answer Only (2025-10-11)
 *
 * Combines Type Selection + Persona Form + Question Configuration
 * into a single unified interface for multi-type AI question generation.
 *
 * Features:
 * - Multi-type selection (1-5 question types)
 * - Short answer format only (Phase A6 - AI validation system)
 * - Complete persona fields (interests, motivators, learning styles)
 * - Form validation with constraints
 * - Integration with enhanced API endpoint
 *
 * @remarks
 * Question format is fixed to SHORT_ANSWER since Phase A6 introduced
 * AI-validated short answer system with partial credit scoring.
 *
 * @example
 * ```typescript
 * // Route with query params
 * /question-generator/unified?subject=mathematics&category=number-operations
 * ```
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { QuestionService } from '../../../../core/services/question.service';
import { AuthService } from '../../../../core/services/auth.service';
import {
  EnhancedQuestionGenerationRequest,
  QuestionFormat,
  EnhancedDifficultyLevel,
  LearningStyle,
  INTEREST_OPTIONS,
  MOTIVATOR_OPTIONS,
  ENHANCED_REQUEST_CONSTRAINTS,
  QUESTION_CATEGORIES,
  getQuestionTypesForCategory,
  getDisplayNameForQuestionType,
  QuestionSession,
  GeneratedQuestion,
  getQuestionTypesForCategoryAndGrade,
} from '../../../../core/models/question.model';

/**
 * Question type display interface
 */
export interface QuestionTypeDisplay {
  dbType: string; // Database type (e.g., 'ADDITION')
  displayName: string; // Human-readable name (e.g., 'Addition')
}

/**
 * UnifiedGeneratorComponent
 *
 * Single-page component for complete question generation workflow.
 * Replaces separate type selection and persona form steps.
 *
 * @remarks
 * Implements TDD approach with comprehensive test coverage.
 * All form validation follows ENHANCED_REQUEST_CONSTRAINTS.
 *
 * @since Session 08
 * @version 1.0.0
 */
@Component({
  selector: 'app-unified-generator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './unified-generator.html',
  styleUrls: ['./unified-generator.scss'],
})
export class UnifiedGeneratorComponent implements OnInit {
  /**
   * Context Properties
   * Populated from route query parameters during ngOnInit
   */

  /** Selected academic subject (e.g., 'mathematics', 'science') */
  selectedSubject: string = '';

  /** Selected question category (e.g., 'number-operations', 'algebraic-thinking') */
  selectedCategory: string = '';

  /** Student's grade level (1-12), defaults to 5 */
  gradeLevel: number = 5;

  /**
   * Question Type Selection
   * Multi-select functionality with 1-5 type constraint
   */

  /** Available question types for the selected category */
  questionTypes: QuestionTypeDisplay[] = [];

  /** Currently selected question type IDs (1-5 types allowed) */
  selectedTypes: string[] = [];

  /**
   * Question Configuration
   * Defines difficulty and count (format is always SHORT_ANSWER in Phase A6)
   */

  /** Question format: Always SHORT_ANSWER (Phase A6 - AI validation system) */
  questionFormat: QuestionFormat = QuestionFormat.SHORT_ANSWER;

  /** Difficulty level: Easy, Medium, or Hard */
  difficultyLevel: EnhancedDifficultyLevel = EnhancedDifficultyLevel.MEDIUM;

  /** Total number of questions to generate (5, 10, 15, 20, 25, or 30) */
  numberOfQuestions: number = 10;

  /**
   * Persona Fields
   * Used for AI personalization and adaptive learning
   */

  /** Learning style preference: Visual, Auditory, Kinesthetic, or Reading/Writing (VARK model) */
  learningStyle: LearningStyle = LearningStyle.VISUAL;

  /** Selected student interests (1-5 from 17 available options) */
  selectedInterests: string[] = [];

  /** Selected motivational factors (0-3 from 8 available options) */
  selectedMotivators: string[] = [];

  /**
   * Available Options for Dropdowns/Selection
   * Populated from model constants
   */

  /** 17 interest options for personalization (Sports, Technology, Arts, etc.) */
  availableInterests = Array.from(INTEREST_OPTIONS);

  /** 8 motivator options for engagement (Competition, Achievement, etc.) */
  availableMotivators = Array.from(MOTIVATOR_OPTIONS);

  /** Difficulty level options with labels for dropdown (3 levels) */
  availableDifficulties = [
    { value: EnhancedDifficultyLevel.EASY, label: 'Easy' },
    { value: EnhancedDifficultyLevel.MEDIUM, label: 'Medium' },
    { value: EnhancedDifficultyLevel.HARD, label: 'Hard' },
  ];

  /** Learning style options with labels for dropdown (4 VARK styles) */
  availableLearningStyles = [
    { value: LearningStyle.VISUAL, label: 'Visual' },
    { value: LearningStyle.AUDITORY, label: 'Auditory' },
    { value: LearningStyle.KINESTHETIC, label: 'Kinesthetic' },
    { value: LearningStyle.READING_WRITING, label: 'Reading/Writing' },
  ];

  /** Available question count options: [5, 10, 15, 20, 25, 30] */
  availableQuestionCounts = ENHANCED_REQUEST_CONSTRAINTS.NUMBER_OF_QUESTIONS;

  /**
   * UI State Management
   */

  /** Loading state indicator for async question generation */
  isGenerating: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private questionService: QuestionService,
    private authService: AuthService
  ) {}

  /**
   * Initialize component with query params and load question types
   */
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.selectedSubject = params['subject'] || '';
      this.selectedCategory = params['category'] || '';
      this.gradeLevel = parseInt(params['grade'] || '5', 10);

      // Load question types for selected category
      this.loadQuestionTypes();
    });
  }

  /**
   * Load available question types for the selected category
   *
   * @private
   */
  private loadQuestionTypes(): void {
    if (!this.selectedCategory) {
      return;
    }

    const types = getQuestionTypesForCategoryAndGrade(this.selectedCategory, this.gradeLevel);
    this.questionTypes = types.map((type) => ({
      dbType: type,
      displayName: getDisplayNameForQuestionType(type),
    }));
  }

  /**
   * Toggle selection of a question type
   *
   * @param {string} type - Question type database key (e.g., 'ADDITION')
   *
   * @remarks
   * Enforces maximum 5 types constraint from ENHANCED_REQUEST_CONSTRAINTS
   */
  toggleTypeSelection(type: string): void {
    const index = this.selectedTypes.indexOf(type);
    if (index > -1) {
      // Deselect
      this.selectedTypes.splice(index, 1);
    } else {
      // Select (if under limit)
      if (this.canSelectMoreTypes()) {
        this.selectedTypes.push(type);
      }
    }
  }

  /**
   * Check if a question type is currently selected
   *
   * @param {string} type - Question type to check
   * @returns {boolean} True if selected
   */
  isTypeSelected(type: string): boolean {
    return this.selectedTypes.includes(type);
  }

  /**
   * Check if more question types can be selected
   *
   * @returns {boolean} True if under the maximum limit (5)
   */
  canSelectMoreTypes(): boolean {
    return this.selectedTypes.length < ENHANCED_REQUEST_CONSTRAINTS.QUESTION_TYPES.MAX;
  }

  /**
   * Get count of selected question types
   *
   * @returns {number} Number of selected types
   */
  getSelectedTypesCount(): number {
    return this.selectedTypes.length;
  }

  /**
   * Toggle selection of an interest
   *
   * @param {string} interest - Interest to toggle
   *
   * @remarks
   * Enforces maximum 5 interests constraint
   */
  toggleInterest(interest: string): void {
    const index = this.selectedInterests.indexOf(interest);
    if (index > -1) {
      // Deselect
      this.selectedInterests.splice(index, 1);
    } else {
      // Select (if under limit)
      if (this.canSelectMoreInterests()) {
        this.selectedInterests.push(interest);
      }
    }
  }

  /**
   * Check if an interest is currently selected
   *
   * @param {string} interest - Interest to check
   * @returns {boolean} True if selected
   */
  isInterestSelected(interest: string): boolean {
    return this.selectedInterests.includes(interest);
  }

  /**
   * Check if more interests can be selected
   *
   * @returns {boolean} True if under the maximum limit (5)
   */
  canSelectMoreInterests(): boolean {
    return this.selectedInterests.length < ENHANCED_REQUEST_CONSTRAINTS.INTERESTS.MAX;
  }

  /**
   * Check if minimum interests are selected
   *
   * @returns {boolean} True if at least 1 interest selected
   */
  hasMinimumInterests(): boolean {
    return this.selectedInterests.length >= ENHANCED_REQUEST_CONSTRAINTS.INTERESTS.MIN;
  }

  /**
   * Get count of selected interests
   *
   * @returns {number} Number of selected interests
   */
  getSelectedInterestsCount(): number {
    return this.selectedInterests.length;
  }

  /**
   * Toggle selection of a motivator
   *
   * @param {string} motivator - Motivator to toggle
   *
   * @remarks
   * Enforces maximum 3 motivators constraint (optional field)
   */
  toggleMotivator(motivator: string): void {
    const index = this.selectedMotivators.indexOf(motivator);
    if (index > -1) {
      // Deselect
      this.selectedMotivators.splice(index, 1);
    } else {
      // Select (if under limit)
      if (this.canSelectMoreMotivators()) {
        this.selectedMotivators.push(motivator);
      }
    }
  }

  /**
   * Check if a motivator is currently selected
   *
   * @param {string} motivator - Motivator to check
   * @returns {boolean} True if selected
   */
  isMotivatorSelected(motivator: string): boolean {
    return this.selectedMotivators.includes(motivator);
  }

  /**
   * Check if more motivators can be selected
   *
   * @returns {boolean} True if under the maximum limit (3)
   */
  canSelectMoreMotivators(): boolean {
    return this.selectedMotivators.length < ENHANCED_REQUEST_CONSTRAINTS.MOTIVATORS.MAX;
  }

  /**
   * Get count of selected motivators
   *
   * @returns {number} Number of selected motivators
   */
  getSelectedMotivatorsCount(): number {
    return this.selectedMotivators.length;
  }

  /**
   * Validate if the form is complete and ready for submission
   *
   * @returns {boolean} True if all required fields are valid
   *
   * @remarks
   * Validation rules:
   * - 1-5 question types selected
   * - 1-5 interests selected
   * - 0-3 motivators selected
   * - All required fields have values
   */
  isFormValid(): boolean {
    const hasTypes =
      this.selectedTypes.length >= ENHANCED_REQUEST_CONSTRAINTS.QUESTION_TYPES.MIN &&
      this.selectedTypes.length <= ENHANCED_REQUEST_CONSTRAINTS.QUESTION_TYPES.MAX;

    const hasInterests =
      this.selectedInterests.length >= ENHANCED_REQUEST_CONSTRAINTS.INTERESTS.MIN &&
      this.selectedInterests.length <= ENHANCED_REQUEST_CONSTRAINTS.INTERESTS.MAX;

    const hasValidMotivators =
      this.selectedMotivators.length >= ENHANCED_REQUEST_CONSTRAINTS.MOTIVATORS.MIN &&
      this.selectedMotivators.length <= ENHANCED_REQUEST_CONSTRAINTS.MOTIVATORS.MAX;

    const hasRequiredFields =
      !!this.selectedSubject &&
      !!this.selectedCategory &&
      this.gradeLevel > 0 &&
      this.numberOfQuestions > 0;

    return hasTypes && hasInterests && hasValidMotivators && hasRequiredFields;
  }

  /**
   * Generate questions using enhanced API endpoint
   *
   * @remarks
   * Calls QuestionService.generateQuestionsEnhanced() with complete request
   * Navigates to question display on success
   */
  generateQuestions(): void {
    if (!this.isFormValid()) {
      console.warn('Form validation failed');
      return;
    }

    this.isGenerating = true;

    // E2E FIX (Phase A4): Include rich category metadata for better question generation
    const categoryInfo = QUESTION_CATEGORIES[this.selectedCategory];

    const request: EnhancedQuestionGenerationRequest = {
      subject: this.selectedSubject,
      category: this.selectedCategory,
      gradeLevel: this.gradeLevel,
      questionTypes: this.selectedTypes,
      questionFormat: this.questionFormat,
      difficultyLevel: this.difficultyLevel,
      numberOfQuestions: this.numberOfQuestions,
      learningStyle: this.learningStyle,
      interests: this.selectedInterests,
      motivators: this.selectedMotivators,
      includeExplanations: true,
      // E2E FIX: Pass category metadata to backend for contextual question generation
      categoryMetadata: categoryInfo
        ? {
            name: categoryInfo.name,
            description: categoryInfo.description,
            skillsFocus: categoryInfo.skillsFocus,
          }
        : undefined,
    };

    console.log('📤 Sending enhanced request with category metadata:', {
      category: request.category,
      categoryName: request.categoryMetadata?.name,
      hasMetadata: !!request.categoryMetadata,
    });

    this.questionService.generateQuestionsEnhanced(request).subscribe({
      next: (response: any) => {
        console.log('✅ Questions generated:', response);
        this.isGenerating = false;

        const questions = response.data.questions as GeneratedQuestion[];
        const currentUser = this.authService.getCurrentUser();

        // PHASE A6.3: Create session and store in service for persistence
        const session: QuestionSession = {
          id: response.data.sessionId || `session-${Date.now()}`,
          userId: currentUser?.id || '',
          questions: questions,
          answers: [],
          startedAt: new Date(),
          totalScore: 0,
          maxScore: questions.length * 10, // 10 points per question
          timeSpentMinutes: 0,
          subject: this.selectedSubject || 'mathematics',
          topic: this.selectedCategory || '',
        };

        // Store session in service (persists across navigation)
        this.questionService.startSession(session);
        console.log('✅ Session stored in service:', session.id);

        // Navigate to question display (no state needed - service has it)
        this.router.navigate(['/student/question-generator']);
      },
      error: (error: any) => {
        console.error('❌ Question generation failed:', error);
        this.isGenerating = false;
      },
    });
  }

  /**
   * Navigate back to previous page (category selection)
   */
  goBack(): void {
    this.router.navigate(['/student/question-generator/categories'], {
      queryParams: { subject: this.selectedSubject },
    });
  }
}
