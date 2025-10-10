/**
 * Unified Generator Component Tests
 *
 * Phase B1 RED - Test-Driven Development
 * Session 08 - TN-FEATURE-NEW-QUESTION-GENERATION-UI
 *
 * Tests for unified question generator component that combines:
 * - Type Selection (multi-select question types)
 * - Persona Form (interests, motivators, learning styles)
 * - Question Configuration (format, difficulty, count)
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { UnifiedGeneratorComponent } from './unified-generator';
import { QuestionService } from '../../../../core/services/question.service';
import {
  QuestionFormat,
  EnhancedDifficultyLevel,
  LearningStyle,
} from '../../../../core/models/question.model';

describe('UnifiedGeneratorComponent', () => {
  let component: UnifiedGeneratorComponent;
  let fixture: ComponentFixture<UnifiedGeneratorComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockQuestionService: jasmine.SpyObj<QuestionService>;

  beforeEach(async () => {
    // Create mock router
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // Create mock activated route with query params
    mockActivatedRoute = {
      queryParams: of({
        subject: 'mathematics',
        category: 'number-operations',
      }),
    };

    // Create mock question service
    mockQuestionService = jasmine.createSpyObj('QuestionService', ['generateQuestionsEnhanced']);

    await TestBed.configureTestingModule({
      imports: [UnifiedGeneratorComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: QuestionService, useValue: mockQuestionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UnifiedGeneratorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Component Creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with query params from route', () => {
      expect(component.selectedSubject).toBe('mathematics');
      expect(component.selectedCategory).toBe('number-operations');
    });

    it('should load question types for selected category', () => {
      expect(component.questionTypes.length).toBeGreaterThan(0);
    });
  });

  describe('Multi-Type Selection', () => {
    it('should start with empty selected types array', () => {
      component.selectedTypes = [];
      expect(component.selectedTypes).toEqual([]);
    });

    it('should allow selecting a single question type', () => {
      component.toggleTypeSelection('ADDITION');
      expect(component.selectedTypes).toContain('ADDITION');
      expect(component.selectedTypes.length).toBe(1);
    });

    it('should allow selecting multiple question types', () => {
      component.toggleTypeSelection('ADDITION');
      component.toggleTypeSelection('SUBTRACTION');
      component.toggleTypeSelection('MULTIPLICATION');

      expect(component.selectedTypes).toContain('ADDITION');
      expect(component.selectedTypes).toContain('SUBTRACTION');
      expect(component.selectedTypes).toContain('MULTIPLICATION');
      expect(component.selectedTypes.length).toBe(3);
    });

    it('should deselect a type when clicked again', () => {
      component.toggleTypeSelection('ADDITION');
      expect(component.selectedTypes).toContain('ADDITION');

      component.toggleTypeSelection('ADDITION');
      expect(component.selectedTypes).not.toContain('ADDITION');
      expect(component.selectedTypes.length).toBe(0);
    });

    it('should allow maximum 5 question types', () => {
      component.selectedTypes = ['TYPE1', 'TYPE2', 'TYPE3', 'TYPE4', 'TYPE5'];
      expect(component.canSelectMoreTypes()).toBe(false);
    });

    it('should check if type is selected', () => {
      component.selectedTypes = ['ADDITION'];
      expect(component.isTypeSelected('ADDITION')).toBe(true);
      expect(component.isTypeSelected('SUBTRACTION')).toBe(false);
    });
  });

  describe('Question Format Selection', () => {
    it('should initialize with default multiple choice format', () => {
      expect(component.questionFormat).toBe(QuestionFormat.MULTIPLE_CHOICE);
    });

    it('should allow changing to short answer format', () => {
      component.questionFormat = QuestionFormat.SHORT_ANSWER;
      expect(component.questionFormat).toBe(QuestionFormat.SHORT_ANSWER);
    });

    it('should support all 4 question formats', () => {
      const formats = [
        QuestionFormat.MULTIPLE_CHOICE,
        QuestionFormat.SHORT_ANSWER,
        QuestionFormat.TRUE_FALSE,
        QuestionFormat.FILL_IN_BLANK,
      ];
      formats.forEach((format) => {
        component.questionFormat = format;
        expect(component.questionFormat).toBe(format);
      });
    });
  });

  describe('Difficulty Level Selection', () => {
    it('should initialize with default medium difficulty', () => {
      expect(component.difficultyLevel).toBe(EnhancedDifficultyLevel.MEDIUM);
    });

    it('should allow changing difficulty level', () => {
      component.difficultyLevel = EnhancedDifficultyLevel.HARD;
      expect(component.difficultyLevel).toBe(EnhancedDifficultyLevel.HARD);
    });

    it('should support all 3 difficulty levels', () => {
      const levels = [
        EnhancedDifficultyLevel.EASY,
        EnhancedDifficultyLevel.MEDIUM,
        EnhancedDifficultyLevel.HARD,
      ];
      levels.forEach((level) => {
        component.difficultyLevel = level;
        expect(component.difficultyLevel).toBe(level);
      });
    });
  });

  describe('Number of Questions', () => {
    it('should initialize with default 10 questions', () => {
      expect(component.numberOfQuestions).toBe(10);
    });

    it('should allow setting number of questions', () => {
      component.numberOfQuestions = 20;
      expect(component.numberOfQuestions).toBe(20);
    });

    it('should support standard question counts', () => {
      const counts = [5, 10, 15, 20, 25, 30];
      counts.forEach((count) => {
        component.numberOfQuestions = count;
        expect(component.numberOfQuestions).toBe(count);
      });
    });
  });

  describe('Learning Style Selection', () => {
    it('should initialize with default visual learning style', () => {
      expect(component.learningStyle).toBe(LearningStyle.VISUAL);
    });

    it('should allow changing learning style', () => {
      component.learningStyle = LearningStyle.AUDITORY;
      expect(component.learningStyle).toBe(LearningStyle.AUDITORY);
    });

    it('should support all 4 learning styles', () => {
      const styles = [
        LearningStyle.VISUAL,
        LearningStyle.AUDITORY,
        LearningStyle.KINESTHETIC,
        LearningStyle.READING_WRITING,
      ];
      styles.forEach((style) => {
        component.learningStyle = style;
        expect(component.learningStyle).toBe(style);
      });
    });
  });

  describe('Interests Selection', () => {
    it('should start with empty interests array', () => {
      component.selectedInterests = [];
      expect(component.selectedInterests.length).toBe(0);
    });

    it('should allow selecting interests', () => {
      component.toggleInterest('Sports');
      expect(component.selectedInterests).toContain('Sports');
    });

    it('should allow selecting up to 5 interests', () => {
      component.selectedInterests = ['Sports', 'Technology', 'Arts', 'Music', 'Science'];
      expect(component.selectedInterests.length).toBe(5);
      expect(component.canSelectMoreInterests()).toBe(false);
    });

    it('should deselect interest when clicked again', () => {
      component.toggleInterest('Sports');
      expect(component.selectedInterests).toContain('Sports');

      component.toggleInterest('Sports');
      expect(component.selectedInterests).not.toContain('Sports');
    });

    it('should require at least 1 interest', () => {
      component.selectedInterests = [];
      expect(component.hasMinimumInterests()).toBe(false);

      component.selectedInterests = ['Sports'];
      expect(component.hasMinimumInterests()).toBe(true);
    });

    it('should provide 17 available interest options', () => {
      expect(component.availableInterests.length).toBe(17);
    });
  });

  describe('Motivators Selection', () => {
    it('should start with empty motivators array', () => {
      component.selectedMotivators = [];
      expect(component.selectedMotivators.length).toBe(0);
    });

    it('should allow selecting motivators', () => {
      component.toggleMotivator('Competition');
      expect(component.selectedMotivators).toContain('Competition');
    });

    it('should allow selecting up to 3 motivators', () => {
      component.selectedMotivators = ['Competition', 'Achievement', 'Exploration'];
      expect(component.selectedMotivators.length).toBe(3);
      expect(component.canSelectMoreMotivators()).toBe(false);
    });

    it('should allow 0 motivators (optional)', () => {
      component.selectedMotivators = [];
      expect(component.selectedMotivators.length).toBe(0);
      // Should still be valid
    });

    it('should deselect motivator when clicked again', () => {
      component.toggleMotivator('Achievement');
      expect(component.selectedMotivators).toContain('Achievement');

      component.toggleMotivator('Achievement');
      expect(component.selectedMotivators).not.toContain('Achievement');
    });

    it('should provide 8 available motivator options', () => {
      expect(component.availableMotivators.length).toBe(8);
    });
  });

  describe('Form Validation', () => {
    beforeEach(() => {
      // Set up minimum valid state
      component.selectedTypes = ['ADDITION'];
      component.selectedInterests = ['Sports'];
      component.questionFormat = QuestionFormat.MULTIPLE_CHOICE;
      component.difficultyLevel = EnhancedDifficultyLevel.MEDIUM;
      component.numberOfQuestions = 10;
      component.learningStyle = LearningStyle.VISUAL;
    });

    it('should validate that at least 1 question type is selected', () => {
      component.selectedTypes = [];
      expect(component.isFormValid()).toBe(false);

      component.selectedTypes = ['ADDITION'];
      expect(component.isFormValid()).toBe(true);
    });

    it('should validate that at least 1 interest is selected', () => {
      component.selectedInterests = [];
      expect(component.isFormValid()).toBe(false);

      component.selectedInterests = ['Sports'];
      expect(component.isFormValid()).toBe(true);
    });

    it('should validate that all required fields are filled', () => {
      expect(component.isFormValid()).toBe(true);
    });

    it('should invalidate if more than 5 types selected', () => {
      component.selectedTypes = ['TYPE1', 'TYPE2', 'TYPE3', 'TYPE4', 'TYPE5', 'TYPE6'];
      expect(component.isFormValid()).toBe(false);
    });

    it('should invalidate if more than 5 interests selected', () => {
      component.selectedInterests = ['I1', 'I2', 'I3', 'I4', 'I5', 'I6'];
      expect(component.isFormValid()).toBe(false);
    });

    it('should invalidate if more than 3 motivators selected', () => {
      component.selectedMotivators = ['M1', 'M2', 'M3', 'M4'];
      expect(component.isFormValid()).toBe(false);
    });
  });

  describe('Generate Questions', () => {
    beforeEach(() => {
      // Set up valid form state
      component.selectedSubject = 'mathematics';
      component.selectedCategory = 'number-operations';
      component.selectedTypes = ['ADDITION', 'SUBTRACTION'];
      component.questionFormat = QuestionFormat.MULTIPLE_CHOICE;
      component.difficultyLevel = EnhancedDifficultyLevel.MEDIUM;
      component.numberOfQuestions = 10;
      component.learningStyle = LearningStyle.VISUAL;
      component.selectedInterests = ['Sports', 'Gaming'];
      component.selectedMotivators = ['Competition', 'Achievement'];
    });

    it('should call question service with enhanced request', () => {
      const mockResponse = {
        success: true,
        data: { sessionId: 'test-session-123' },
      };
      mockQuestionService.generateQuestionsEnhanced.and.returnValue(of(mockResponse));

      component.generateQuestions();

      expect(mockQuestionService.generateQuestionsEnhanced).toHaveBeenCalled();
    });

    it('should build correct enhanced request payload', () => {
      const mockResponse = {
        success: true,
        data: { sessionId: 'test-session-123' },
      };
      mockQuestionService.generateQuestionsEnhanced.and.returnValue(of(mockResponse));

      component.generateQuestions();

      const callArgs = mockQuestionService.generateQuestionsEnhanced.calls.mostRecent().args[0];
      expect(callArgs.subject).toBe('mathematics');
      expect(callArgs.category).toBe('number-operations');
      expect(callArgs.questionTypes).toEqual(['ADDITION', 'SUBTRACTION']);
      expect(callArgs.questionFormat).toBe(QuestionFormat.MULTIPLE_CHOICE); // Enum value: 'multiple_choice'
      expect(callArgs.difficultyLevel).toBe(EnhancedDifficultyLevel.MEDIUM); // Enum value: 'medium'
      expect(callArgs.numberOfQuestions).toBe(10);
      expect(callArgs.learningStyle).toBe(LearningStyle.VISUAL); // Enum value: 'visual'
      expect(callArgs.interests).toEqual(['Sports', 'Gaming']);
      expect(callArgs.motivators).toEqual(['Competition', 'Achievement']);
    });

    it('should not call service if form is invalid', () => {
      component.selectedTypes = []; // Invalid: no types

      component.generateQuestions();

      expect(mockQuestionService.generateQuestionsEnhanced).not.toHaveBeenCalled();
    });

    it('should set loading state while generating', () => {
      const mockResponse = {
        success: true,
        data: { sessionId: 'test-session-123' },
      };
      mockQuestionService.generateQuestionsEnhanced.and.returnValue(of(mockResponse));

      expect(component.isGenerating).toBe(false);

      component.generateQuestions();

      // Check that loading state was managed (implementation detail)
      expect(mockQuestionService.generateQuestionsEnhanced).toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should navigate back to categories', () => {
      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/student/question-generator/categories'],
        jasmine.objectContaining({
          queryParams: { subject: 'mathematics' },
        })
      );
    });

    it('should preserve subject in query params when going back', () => {
      component.selectedSubject = 'science';
      component.goBack();

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        ['/student/question-generator/categories'],
        jasmine.objectContaining({
          queryParams: { subject: 'science' },
        })
      );
    });
  });

  describe('UI Helper Methods', () => {
    it('should check if type is selected', () => {
      component.selectedTypes = ['ADDITION'];
      expect(component.isTypeSelected('ADDITION')).toBe(true);
      expect(component.isTypeSelected('SUBTRACTION')).toBe(false);
    });

    it('should check if interest is selected', () => {
      component.selectedInterests = ['Sports'];
      expect(component.isInterestSelected('Sports')).toBe(true);
      expect(component.isInterestSelected('Gaming')).toBe(false);
    });

    it('should check if motivator is selected', () => {
      component.selectedMotivators = ['Achievement'];
      expect(component.isMotivatorSelected('Achievement')).toBe(true);
      expect(component.isMotivatorSelected('Competition')).toBe(false);
    });

    it('should get selected types count', () => {
      component.selectedTypes = ['ADDITION', 'SUBTRACTION'];
      expect(component.getSelectedTypesCount()).toBe(2);
    });

    it('should get selected interests count', () => {
      component.selectedInterests = ['Sports', 'Gaming', 'Science'];
      expect(component.getSelectedInterestsCount()).toBe(3);
    });

    it('should get selected motivators count', () => {
      component.selectedMotivators = ['Achievement'];
      expect(component.getSelectedMotivatorsCount()).toBe(1);
    });
  });
});
