import { QuestionService } from './question.service';
import { TestBed } from '@angular/core/testing';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LearningStyle, QuestionGenerationRequest } from '../models/question.model';
import { NgZone, ɵNoopNgZone } from '@angular/core'; // Note: ɵNoopNgZone is a private Angular API
import { provideHttpClient } from '@angular/common/http';

/**
 * QuestionService Spec
 *
 * MMDD/TDD Audit: Verifies that persona data is sent in the backend request payload.
 * Uses Zone.js-free Angular 20+ test environment for maintainability.
 */
describe('QuestionService', () => {
  let service: QuestionService;
  let httpMock: HttpTestingController;

  /**
   * Setup Angular DI for Zone.js-free service testing.
   * Includes HttpClient and HttpClientTesting providers.
   */
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuestionService,
        { provide: NgZone, useClass: ɵNoopNgZone }, // Using private API for Zone.js-free tests
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(QuestionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  /**
   * Ensure all HTTP requests are verified after each test.
   */
  afterEach(() => {
    httpMock.verify();
  });

  /**
   * Test: Should send persona data in question generation request
   *
   * @description
   * Verifies that the persona object is present and correct in the backend payload.
   * MMDD/TDD: This test enforces backend integration and payload correctness.
   *
   * @example
   * const request = { ...persona fields... };
   * service.generateQuestions(request).subscribe(...);
   */
  it('should send persona data in backend question generation payload', () => {
    // Arrange: Create a sample request with persona
    const request: QuestionGenerationRequest = {
      subject: 'mathematics',
      topic: 'Addition',
      difficulty: 'beginner',
      questionType: 'multiple_choice',
      numQuestions: 5,
      persona: {
        userId: 'user1',
        grade: 5,
        learningStyle: LearningStyle.VISUAL,
        interests: ['Sports'],
        motivationalFactors: ['Achievement'],
        culturalContext: 'NZ',
        preferredQuestionTypes: ['multiple_choice'],
        performanceLevel: 'average',
        strengths: [],
        improvementAreas: [],
      },
    };
    // Act: Call generateQuestions and intercept the backend request
    service.generateQuestions(request).subscribe((response) => {
      expect(response).toBeDefined();
    });
    // Assert: Validate persona in backend payload
    const req = httpMock.expectOne((r) => r.url.includes('/questions/generate'));
    expect(req.request.body.persona).toBeDefined();
    expect(req.request.body.persona.userId).toBe('user1');
    req.flush({ success: true, data: { questions: [] }, message: '' });
  });
});
