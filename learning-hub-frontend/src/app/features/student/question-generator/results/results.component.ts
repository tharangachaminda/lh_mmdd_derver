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
import { ResultsService } from '../../../../core/services/results.service';

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
    sessionId: 'enhanced-1760246644385-o4r8vq9t4',
    totalScore: 66,
    maxScore: 100,
    percentageScore: 66,
    questions: [
      {
        questionId: 'ai_1760246717505_0',
        questionText:
          'A bookshelf has 18 boxes, each containing 12 books. How many books are on the bookshelf in total?',
        studentAnswer: '216',
        score: 9,
        maxScore: 10,
        feedback:
          'Excellent job multiplying the number of boxes by the number of books per box! To take it to perfection, remember that multiplication is commutative, so you can also multiply the number of books per box by the total number of boxes. This will help you double-check your answer.',
        isCorrect: true,
      },
      {
        questionId: 'ai_1760246717505_1',
        questionText: 'What is 147 + 253 - 97?',
        studentAnswer: '400-97=303',
        score: 6,
        maxScore: 10,
        feedback:
          'You correctly performed the subtraction operation (97) but missed simplifying the addition step before subtracting. To improve, make sure to follow the order of operations: first add 147 and 253, then perform the subtraction.',
        isCorrect: false,
      },
      {
        questionId: 'ai_1760246717505_2',
        questionText: 'What is 5 × 46 + 27?',
        studentAnswer: '257',
        score: 7,
        maxScore: 10,
        feedback:
          "Good effort! To improve, remember to follow the order of operations (PEMDAS) and calculate the multiplication first: 5 × 46 = 230. Then add 27 to get a final answer of 257. Keep practicing and you'll become more confident with math problems like this!",
        isCorrect: true,
      },
      {
        questionId: 'ai_1760246717505_3',
        questionText: 'What is 75 + 247 - 123?',
        studentAnswer: '199',
        score: 7,
        maxScore: 10,
        feedback:
          "Excellent effort! To get to the correct answer, let's break it down step by step: 75 + 247 = 322, then subtract 123 from that result (322 - 123 = 199). You were close, but remember to follow the order of operations!",
        isCorrect: false,
      },
      {
        questionId: 'ai_1760246717505_4',
        questionText:
          'A bookshelf has 145 books on it. If 27 more books are added to the shelf, and then 17 books are removed, how many books will be left on the shelf?',
        studentAnswer: '155',
        score: 6,
        maxScore: 10,
        feedback:
          "You're close! To solve this problem, you need to follow the order of operations: add 27 books and then subtract 17 books from the original total of 145 books. Try re-reading the question and using a step-by-step approach to get the correct answer.",
        isCorrect: false,
      },
      {
        questionId: 'ai_1760246717505_5',
        questionText: 'What is 4 × 96 + 15?',
        studentAnswer: '399',
        score: 8,
        maxScore: 10,
        feedback:
          "You're very close! To get to the correct answer, let's break it down: 4 × 96 = 384 (use multiplication facts or a calculator). Then add 15 to that result: 384 + 15 = 399. However, you forgot to calculate the product of 4 and 96 first.",
        isCorrect: false,
      },
      {
        questionId: 'ai_1760246717505_6',
        questionText: 'What is 15 × 17 + 23 - 8?',
        studentAnswer: '270',
        score: 7,
        maxScore: 10,
        feedback:
          'The student demonstrated a good understanding of basic arithmetic operations, but made a small calculation error in their multiplication step. To improve, they should double-check their calculations and consider using a calculator or breaking down the problem into smaller steps.',
        isCorrect: false,
      },
      {
        questionId: 'ai_1760246717505_7',
        questionText: 'What is 4 × (23 + 17) - 21?',
        studentAnswer: '50',
        score: 8,
        maxScore: 10,
        feedback:
          'Great effort! To improve, remember to follow the order of operations (PEMDAS): first evaluate the expression inside the parentheses (23 + 17 = 40), then multiply by 4 (4 × 40 = 160), and finally subtract 21. This will give you a final answer of 139.',
        isCorrect: false,
      },
      {
        questionId: 'ai_1760246717505_8',
        questionText: 'What is 456 + 279 - 175?',
        studentAnswer: '560',
        score: 6,
        maxScore: 10,
        feedback:
          'The student showed a good attempt at solving the problem, but made an error in their calculation. To improve, they should double-check their work and make sure to follow the order of operations (PEMDAS). A correct solution would be: 456 + 279 = 735, then subtract 175 from that result: 735 - 175 = 560.',
        isCorrect: false,
      },
      {
        questionId: 'ai_1760246717506_9',
        questionText: 'What is 12 × 19 + 75?',
        studentAnswer: '25',
        score: 2,
        maxScore: 10,
        feedback:
          'You multiplied 12 and 19 correctly to get 228, but then you added 75 incorrectly. Try reevaluating the expression by following the order of operations (PEMDAS). Remember to add 75 to the product of 12 and 19.',
        isCorrect: false,
      },
    ],
    overallFeedback:
      "📚 Fair performance. You scored 66% (2/10 questions correct). You're on the right track, but need more practice in some areas. Focus on the improvement areas below.",
    strengths: ['Understanding of A bookshelf has', 'Addition operations'],
    areasForImprovement: ['Addition operations'],
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private resultService: ResultsService
  ) {}

  ngOnInit(): void {
    // Get validation result from router state or route data
    try {
      this.validationResult = this.resultService.getValidationResult();
    } catch (error) {
      console.error('Failed to load validation result:', error);
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
