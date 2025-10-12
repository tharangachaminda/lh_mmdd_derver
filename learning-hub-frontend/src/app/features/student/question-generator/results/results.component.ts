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

  sampleValidationResult: ValidationResult = {
    success: true,
    sessionId: 'enhanced-1760239039471-9jr5rtq73',
    totalScore: 100,
    maxScore: 100,
    percentageScore: 100,
    questions: [
      {
        questionId: 'ai_1760239108069_0',
        questionText:
          'Ben has 25 pencils in his pencil case. His friend gives him 17 more. How many pencils does Ben have now?',
        studentAnswer: '42',
        score: 10,
        maxScore: 10,
        feedback:
          'Excellent work! You correctly added 25 and 17 to arrive at the right answer. Keep up the good work, and remember to always double-check your calculations to ensure accuracy, even for simple problems.',
        isCorrect: true,
      },
      {
        questionId: 'ai_1760239108069_1',
        questionText:
          'Ben has 25 pencils in his pencil case. His friend gives him 17 more. How many pencils does Ben have now?',
        studentAnswer: '42',
        score: 10,
        maxScore: 10,
        feedback:
          'Great job! You correctly added 25 and 17 to arrive at the right answer, 42. Keep up the good work!',
        isCorrect: true,
      },
      {
        questionId: 'ai_1760239108069_2',
        questionText:
          'Tom has 25 pencils in his pencil case. His friend gives him 12 more pencils. How many pencils does Tom have now?',
        studentAnswer: '37',
        score: 10,
        maxScore: 10,
        feedback:
          'Great job! Your answer is correct. Keep practicing addition problems to build confidence.',
        isCorrect: true,
      },
      {
        questionId: 'ai_1760239108069_3',
        questionText:
          'Tom has 15 pencils in his pencil case. His friend gives him 22 more. How many pencils does Tom have now?',
        studentAnswer: '37',
        score: 10,
        maxScore: 10,
        feedback:
          'Your answer is correct! You properly added 15 and 22 to arrive at 37. Keep up the good work! To further strengthen your skills, try solving similar addition problems with larger numbers or multiple steps.',
        isCorrect: true,
      },
      {
        questionId: 'ai_1760239108069_4',
        questionText:
          'Olivia has 23 pencils in her pencil case. She finds 15 more pencils under her desk. How many pencils does Olivia have now?',
        studentAnswer: '38',
        score: 10,
        maxScore: 10,
        feedback:
          'Great job! You correctly added the pencils. Next time, showing your work can help ensure accuracy.',
        isCorrect: true,
      },
      {
        questionId: 'ai_1760239108069_5',
        questionText:
          'Tom has 25 pencils in his pencil case. His friend gives him 17 more pencils. How many pencils does Tom have now?',
        studentAnswer: '42',
        score: 10,
        maxScore: 10,
        feedback:
          'Your answer is correct! You successfully added 25 and 17 to arrive at the right total. Keep up the good work! A tip for future problems: always double-check your addition to ensure accuracy, even for straightforward questions.',
        isCorrect: true,
      },
      {
        questionId: 'ai_1760239108069_6',
        questionText:
          'Ben has 17 pencils in his pencil case. His friend gives him 21 more pencils. How many pencils does Ben have now?',
        studentAnswer: '38',
        score: 10,
        maxScore: 10,
        feedback:
          'Your answer is correct! You successfully added 17 and 21 to get 38. Keep up the good work! A small tip: always double-check your calculations to ensure accuracy, even for simple problems.',
        isCorrect: true,
      },
      {
        questionId: 'ai_1760239108069_7',
        questionText:
          'Tom has 25 pencils in his pencil case. His friend gives him 17 more pencils to share. How many pencils does Tom have now?',
        studentAnswer: '42',
        score: 10,
        maxScore: 10,
        feedback:
          "Your answer is correct! Adding 25 and 17 gives 42. Great job solving the problem. To further improve, you might explain your steps clearly next time, like writing '25 + 17 = 42' to show your work.",
        isCorrect: true,
      },
      {
        questionId: 'ai_1760239108069_8',
        questionText:
          'Emily has 25 pencils in her pencil case. Her friend gives her 17 more pencils. How many pencils does Emily have now?',
        studentAnswer: '42',
        score: 10,
        maxScore: 10,
        feedback:
          'Your answer is correct! You successfully added 25 and 17 to get 42. Great job! To further strengthen your math skills, try explaining your steps aloud or using visual aids like counters to verify your calculations in the future.',
        isCorrect: true,
      },
      {
        questionId: 'ai_1760239108069_9',
        questionText:
          'Tom has 25 pencils in his pencil case. His friend gives him 12 more. How many pencils does Tom have now?',
        studentAnswer: '37',
        score: 10,
        maxScore: 10,
        feedback:
          'Excellent work! You correctly added 25 and 12 to find the total number of pencils. Keep up the great problem-solving habits!',
        isCorrect: true,
      },
    ],
    overallFeedback:
      '🎉 Excellent work! You scored 100% (10/10 questions correct). Your understanding is very strong. Keep up the great work!',
    strengths: [
      'Understanding of Ben has 25',
      'Understanding of Tom has 25',
      'Understanding of Tom has 15',
      'Understanding of Olivia has 23',
      'Understanding of Ben has 17',
      'Understanding of Emily has 25',
    ],
    areasForImprovement: [],
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get validation result from router state or route data
    try {
      const navigation = this.router.currentNavigation();
      if (navigation?.extras?.state?.['validationResult']) {
        this.validationResult = this.sampleValidationResult; //navigation.extras.state['validationResult'];
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
