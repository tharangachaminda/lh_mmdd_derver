/**
 * Answer Validation Results Component
 *
 * Displays AI validation results with:
 * - Overall score and performance feedback
 * - Question-by-question breakdown with color coding
 * - Strengths identified by AI
 * - Areas for improvement
 * - Action buttons (Try Again, New Questions, Dashboard)
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * Individual question validation result
 */
interface QuestionValidationResult {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  score: number;
  maxScore: number;
  feedback: string;
  isCorrect: boolean;
}

/**
 * Complete validation result from AI
 */
interface ValidationResult {
  success: boolean;
  sessionId: string;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  questions: QuestionValidationResult[];
  overallFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
}

@Component({
  selector: 'app-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressBarModule,
  ],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent implements OnInit {
  // ============================================================================
  // VALIDATION RESULT
  // ============================================================================

  /** Complete validation result from AI */
  validationResult: ValidationResult | null = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get validation result from router state or route data
    try {
      const navigation = this.router.getCurrentNavigation?.();
      if (navigation?.extras?.state?.['validationResult']) {
        this.validationResult = navigation.extras.state['validationResult'];
      } else if (this.route.snapshot.data['validationResult']) {
        this.validationResult = this.route.snapshot.data['validationResult'];
      }
    } catch (error) {
      // Fallback to route data in test environment
      if (this.route.snapshot.data['validationResult']) {
        this.validationResult = this.route.snapshot.data['validationResult'];
      }
    }
  }

  // ============================================================================
  // VALIDATION CHECKS
  // ============================================================================

  /**
   * Check if validation result exists
   */
  hasValidationResult(): boolean {
    return this.validationResult !== null;
  }

  /**
   * Check if there are any strengths
   */
  hasStrengths(): boolean {
    return (this.validationResult?.strengths?.length || 0) > 0;
  }

  /**
   * Check if there are any areas for improvement
   */
  hasImprovements(): boolean {
    return (this.validationResult?.areasForImprovement?.length || 0) > 0;
  }

  // ============================================================================
  // COLOR CODING
  // ============================================================================

  /**
   * Get color based on overall percentage score
   *
   * @param percentage - Overall percentage score (0-100)
   * @returns Color string for styling
   */
  getPerformanceColor(percentage: number): string {
    if (percentage >= 90) return 'green';
    if (percentage >= 75) return 'blue';
    if (percentage >= 60) return 'orange';
    return 'red';
  }

  /**
   * Get color based on individual question score
   *
   * @param score - Question score (0-10)
   * @returns Color string for styling
   */
  getScoreColor(score: number): string {
    if (score >= 8) return 'green';
    if (score >= 5) return 'orange';
    return 'red';
  }

  /**
   * Get emoji based on performance level
   *
   * @param percentage - Overall percentage score (0-100)
   * @returns Emoji string
   */
  getPerformanceEmoji(percentage: number): string {
    if (percentage >= 90) return '🎉';
    if (percentage >= 75) return '👍';
    if (percentage >= 60) return '📚';
    return '💪';
  }

  // ============================================================================
  // FORMATTING
  // ============================================================================

  /**
   * Format number as percentage
   *
   * @param value - Percentage value
   * @returns Formatted string
   */
  formatPercentage(value: number): string {
    return `${value}%`;
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  /**
   * Try the same questions again
   */
  tryAgain(): void {
    this.router.navigate(['/student/questions/generate']);
  }

  /**
   * Generate new questions
   */
  generateNewQuestions(): void {
    this.router.navigate(['/student/questions/generate']);
  }

  /**
   * Go back to dashboard
   */
  goToDashboard(): void {
    this.router.navigate(['/student/dashboard']);
  }
}
