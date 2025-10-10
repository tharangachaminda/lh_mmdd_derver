/**
 * Answer Validation Results Component Tests
 *
 * Tests for displaying AI validation results with scores, feedback,
 * strengths, and improvement areas.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { ResultsComponent } from './results.component';
import { provideZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;

  const mockValidationResult = {
    success: true,
    sessionId: 'test-session-123',
    totalScore: 20,
    maxScore: 30,
    percentageScore: 67,
    questions: [
      {
        questionId: 'q1',
        questionText: 'What is 2 + 2?',
        studentAnswer: '4',
        score: 10,
        maxScore: 10,
        feedback: 'Excellent work!',
        isCorrect: true,
      },
      {
        questionId: 'q2',
        questionText: 'What is 3 × 3?',
        studentAnswer: '9',
        score: 10,
        maxScore: 10,
        feedback: 'Great job!',
        isCorrect: true,
      },
      {
        questionId: 'q3',
        questionText: 'What is 10 - 5?',
        studentAnswer: '4',
        score: 0,
        maxScore: 10,
        feedback: 'The correct answer is 5.',
        isCorrect: false,
      },
    ],
    overallFeedback: '📚 Fair performance. You scored 67%...',
    strengths: ['Addition operations', 'Multiplication operations'],
    areasForImprovement: ['Subtraction operations'],
  };

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      queryParams: of({}),
      snapshot: {
        data: { validationResult: mockValidationResult },
      },
    };

    await TestBed.configureTestingModule({
      imports: [ResultsComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ============================================================================
  // Component Initialization
  // ============================================================================

  describe('Component Creation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should load validation result from route state', () => {
      expect(component.validationResult).toBeDefined();
      expect(component.validationResult?.sessionId).toBe('test-session-123');
    });

    it('should calculate performance metrics', () => {
      expect(component.validationResult?.percentageScore).toBe(67);
      expect(component.validationResult?.totalScore).toBe(20);
      expect(component.validationResult?.maxScore).toBe(30);
    });
  });

  // ============================================================================
  // Overall Score Display
  // ============================================================================

  describe('Overall Score Display', () => {
    it('should display percentage score', () => {
      expect(component.validationResult?.percentageScore).toBe(67);
    });

    it('should display total score fraction', () => {
      const result = component.validationResult!;
      expect(result.totalScore).toBe(20);
      expect(result.maxScore).toBe(30);
    });

    it('should display overall feedback', () => {
      expect(component.validationResult?.overallFeedback).toContain('Fair performance');
    });
  });

  // ============================================================================
  // Performance Color Coding
  // ============================================================================

  describe('Performance Color Coding', () => {
    it('should return green for excellent performance (90%+)', () => {
      const color = component.getPerformanceColor(95);
      expect(color).toBe('green');
    });

    it('should return blue for good performance (75-89%)', () => {
      const color = component.getPerformanceColor(80);
      expect(color).toBe('blue');
    });

    it('should return orange for fair performance (60-74%)', () => {
      const color = component.getPerformanceColor(67);
      expect(color).toBe('orange');
    });

    it('should return red for needs improvement (<60%)', () => {
      const color = component.getPerformanceColor(45);
      expect(color).toBe('red');
    });
  });

  // ============================================================================
  // Question Score Color Coding
  // ============================================================================

  describe('Question Score Color Coding', () => {
    it('should return green for high scores (8+)', () => {
      const color = component.getScoreColor(10);
      expect(color).toBe('green');
    });

    it('should return orange for medium scores (5-7)', () => {
      const color = component.getScoreColor(6);
      expect(color).toBe('orange');
    });

    it('should return red for low scores (<5)', () => {
      const color = component.getScoreColor(3);
      expect(color).toBe('red');
    });
  });

  // ============================================================================
  // Strengths Display
  // ============================================================================

  describe('Strengths Display', () => {
    it('should display all strengths', () => {
      const strengths = component.validationResult?.strengths || [];
      expect(strengths.length).toBe(2);
      expect(strengths).toContain('Addition operations');
      expect(strengths).toContain('Multiplication operations');
    });

    it('should check if strengths exist', () => {
      const hasStrengths = component.hasStrengths();
      expect(hasStrengths).toBe(true);
    });
  });

  // ============================================================================
  // Improvements Display
  // ============================================================================

  describe('Improvements Display', () => {
    it('should display all improvement areas', () => {
      const improvements = component.validationResult?.areasForImprovement || [];
      expect(improvements.length).toBe(1);
      expect(improvements).toContain('Subtraction operations');
    });

    it('should check if improvements exist', () => {
      const hasImprovements = component.hasImprovements();
      expect(hasImprovements).toBe(true);
    });
  });

  // ============================================================================
  // Question-by-Question Results
  // ============================================================================

  describe('Question Results Display', () => {
    it('should display all questions', () => {
      const questions = component.validationResult?.questions || [];
      expect(questions.length).toBe(3);
    });

    it('should display correct answers with green', () => {
      const question = component.validationResult?.questions[0];
      expect(question?.isCorrect).toBe(true);
      const color = component.getScoreColor(question?.score || 0);
      expect(color).toBe('green');
    });

    it('should display incorrect answers with red', () => {
      const question = component.validationResult?.questions[2];
      expect(question?.isCorrect).toBe(false);
      const color = component.getScoreColor(question?.score || 0);
      expect(color).toBe('red');
    });

    it('should display individual feedback for each question', () => {
      const questions = component.validationResult?.questions || [];
      questions.forEach((q) => {
        expect(q.feedback).toBeDefined();
        expect(q.feedback.length).toBeGreaterThan(0);
      });
    });
  });

  // ============================================================================
  // Navigation Actions
  // ============================================================================

  describe('Navigation Actions', () => {
    it('should navigate to new questions', () => {
      component.tryAgain();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/student/questions/generate']);
    });

    it('should navigate to dashboard', () => {
      component.goToDashboard();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/student/dashboard']);
    });

    it('should navigate back to generator with subject/category', () => {
      component.generateNewQuestions();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/student/questions/generate']);
    });
  });

  // ============================================================================
  // Empty State Handling
  // ============================================================================

  describe('Empty State Handling', () => {
    it('should handle no validation result', () => {
      component.validationResult = null;
      const hasResult = component.hasValidationResult();
      expect(hasResult).toBe(false);
    });

    it('should handle empty strengths', () => {
      component.validationResult = { ...mockValidationResult, strengths: [] };
      const hasStrengths = component.hasStrengths();
      expect(hasStrengths).toBe(false);
    });

    it('should handle empty improvements', () => {
      component.validationResult = { ...mockValidationResult, areasForImprovement: [] };
      const hasImprovements = component.hasImprovements();
      expect(hasImprovements).toBe(false);
    });
  });

  // ============================================================================
  // Helper Methods
  // ============================================================================

  describe('Helper Methods', () => {
    it('should check if validation result exists', () => {
      expect(component.hasValidationResult()).toBe(true);
    });

    it('should get correct performance emoji', () => {
      expect(component.getPerformanceEmoji(95)).toBe('🎉');
      expect(component.getPerformanceEmoji(80)).toBe('👍');
      expect(component.getPerformanceEmoji(67)).toBe('📚');
      expect(component.getPerformanceEmoji(45)).toBe('💪');
    });

    it('should format score as percentage', () => {
      const formatted = component.formatPercentage(67);
      expect(formatted).toBe('67%');
    });
  });
});
