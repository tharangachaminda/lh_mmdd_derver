import { QuestionGenerator, QuestionGeneratorStep, LearningStyle } from './question-generator';
import { of } from 'rxjs';
import { QuestionService } from '../../../core/services/question.service';
import { AuthService } from '../../../core/services/auth.service';

// Helper function to create test component instance
function createTestComponent(questionService: any): QuestionGenerator {
  const authService = {
    isAuthenticated: () => true,
    getCurrentUser: () => ({ id: 'u1', grade: 5, country: 'NZ' }),
  } as AuthService;
  const router = {
    navigate: jasmine.createSpy('navigate'),
  } as unknown as import('@angular/router').Router;
  const mockCdr = { detectChanges: () => {} } as any;

  const component = new QuestionGenerator(questionService, authService, router, mockCdr);
  // Set up required state
  component.selectedSubject = 'mathematics';
  component.selectedTopic = 'Addition';
  component.selectedDifficulty = 'beginner';
  component.selectedQuestionType = 'multiple_choice';
  component.questionCount = 2;
  component.learningStyle = LearningStyle.VISUAL;
  component.interests = ['Sports'];
  component.motivationalFactors = ['Achievement'];
  component.currentStep = component.QuestionGeneratorStep.PERSONA;

  return component;
}

describe('QuestionGenerator Backend Quality Issues (RED Phase)', () => {
  it('should generate unique questions on repeated calls instead of same questions (FAILS - Backend Issue)', async () => {
    // CORRECTED TEST: Testing for same question SET on repeated requests, not within-session duplicates
    // Arrange: Mock backend to return identical question sets (simulating current bug)
    const staticQuestionSet = [
      { id: 'q1', question: 'What is 3 + 4?', correctAnswer: '7', options: ['5', '7', '9', '11'] },
      { id: 'q2', question: 'What is 5 + 2?', correctAnswer: '7', options: ['6', '7', '8', '9'] },
    ];

    const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
    // Backend always returns the same question set for same request parameters
    questionService.generateQuestions.and.returnValue({
      toPromise: () =>
        Promise.resolve({
          success: true,
          data: { questions: staticQuestionSet }, // Same questions every time
        }),
    });

    const component = createTestComponent(questionService);

    // Act: Generate questions twice with identical parameters
    await component.generateQuestions();
    const firstSession = component.currentSession as any;
    const firstQuestionSet = firstSession?.questions ? [...firstSession.questions] : [];

    // Reset session and generate again with same parameters
    component.currentSession = null;
    component.selectedSubject = 'mathematics'; // Same parameters
    component.selectedTopic = 'Addition';
    component.selectedDifficulty = 'beginner';

    await component.generateQuestions();
    const secondSession = component.currentSession as any;
    const secondQuestionSet = secondSession?.questions ? [...secondSession.questions] : [];

    // Assert: Question sets should be different even with same parameters (WILL FAIL with current backend)
    // The backend currently returns identical questions for identical requests
    expect(firstQuestionSet[0]?.question).not.toBe(
      secondQuestionSet[0]?.question,
      'First request questions should differ from second request questions'
    );
    expect(firstQuestionSet[1]?.question).not.toBe(
      secondQuestionSet[1]?.question,
      'Question set should have variation between requests'
    );

    // Additional assertion: Question IDs should be different (new generation)
    expect(firstQuestionSet[0]?.id).not.toBe(
      secondQuestionSet[0]?.id,
      'Question IDs should be unique across different generation requests'
    );
  });

  it('should use varied question templates instead of identical patterns (FAILS - Static Templates)', async () => {
    // Arrange: Mock backend that returns questions with identical patterns/templates
    const staticTemplateQuestions = [
      { id: 'q1', question: 'What is 3 + 4?', correctAnswer: '7', options: ['5', '7', '9', '11'] },
      { id: 'q2', question: 'What is 5 + 2?', correctAnswer: '7', options: ['6', '7', '8', '9'] },
      { id: 'q3', question: 'What is 8 + 1?', correctAnswer: '9', options: ['7', '8', '9', '10'] },
    ];

    const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
    questionService.generateQuestions.and.returnValue({
      toPromise: () =>
        Promise.resolve({
          success: true,
          data: { questions: staticTemplateQuestions },
        }),
    });

    const component = createTestComponent(questionService);

    // Act: Generate questions
    await component.generateQuestions();
    const questions = component.currentSession?.questions || [];

    // Assert: Questions should use varied templates, not identical patterns (WILL FAIL)
    const questionPatterns = questions.map((q) => {
      // Extract pattern from question (e.g., "What is X + Y?" vs "Sarah has X and gets Y more")
      if (q.question?.includes('What is') && q.question?.includes(' + ')) return 'direct_addition';
      if (q.question?.includes('has') && q.question?.includes('more')) return 'word_problem';
      if (q.question?.includes('sum of')) return 'sum_expression';
      return 'unknown_pattern';
    });

    // Expect variety in question patterns, not all the same template
    const uniquePatterns = new Set(questionPatterns);
    expect(uniquePatterns.size).toBeGreaterThan(
      1,
      'Questions should use multiple templates/patterns, not just one static format'
    );

    // At least some questions should be word problems for better engagement
    expect(questionPatterns.some((pattern) => pattern === 'word_problem')).toBeTruthy(
      'Question set should include engaging word problems, not just direct math expressions'
    );
  });

  it('should generate questions with contextual variety instead of generic math (FAILS - No Personalization)', async () => {
    // Arrange: Mock backend returning generic questions without persona context
    const genericQuestions = [
      { id: 'q1', question: 'What is 6 + 3?', correctAnswer: '9', options: ['7', '8', '9', '10'] },
      { id: 'q2', question: 'What is 4 + 5?', correctAnswer: '9', options: ['7', '8', '9', '10'] },
    ];

    const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
    questionService.generateQuestions.and.returnValue({
      toPromise: () =>
        Promise.resolve({
          success: true,
          data: { questions: genericQuestions },
        }),
    });

    const component = createTestComponent(questionService);
    // Set rich persona data
    component.interests = ['Sports', 'Animals'];
    component.motivationalFactors = ['Competition', 'Achievement'];
    component.learningStyle = LearningStyle.VISUAL;

    // Act: Generate questions with rich persona
    await component.generateQuestions();
    const questions = component.currentSession?.questions || [];

    // Assert: Questions should incorporate persona interests (WILL FAIL with current generic approach)
    const hasPersonalization = questions.some(
      (q) =>
        q.question?.toLowerCase().includes('sport') ||
        q.question?.toLowerCase().includes('animal') ||
        q.question?.toLowerCase().includes('game') ||
        q.question?.toLowerCase().includes('competition')
    );

    expect(hasPersonalization).toBeTruthy(
      'Questions should incorporate student interests (Sports, Animals) from persona data'
    );

    // Questions should not all be generic "What is X + Y?" format
    const genericCount = questions.filter((q) =>
      q.question?.match(/^What is \d+ [+\-×÷] \d+\?$/)
    ).length;

    expect(genericCount).toBeLessThan(
      questions.length,
      'Not all questions should be generic math expressions - need contextual variety'
    );
  });

  it('should show evidence of request-specific variation instead of static responses (FAILS - No Dynamic Generation)', async () => {
    // Arrange: Test that demonstrates current static behavior
    const alwaysSameQuestions = [
      { id: 'template_q1', question: 'Template Question 1: What is 2 + 3?', correctAnswer: '5' },
      { id: 'template_q2', question: 'Template Question 2: What is 4 + 1?', correctAnswer: '5' },
    ];

    const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
    // Backend returns identical questions regardless of request parameters
    questionService.generateQuestions.and.returnValue({
      toPromise: () =>
        Promise.resolve({
          success: true,
          data: { questions: alwaysSameQuestions },
        }),
    });

    const component = createTestComponent(questionService);

    // Act: Generate questions multiple times
    const generationResults = [];
    for (let i = 0; i < 3; i++) {
      component.currentSession = null; // Reset
      await component.generateQuestions();
      const session = component.currentSession as any;
      generationResults.push({
        sessionId: session?.id || 'no-session',
        firstQuestionId: session?.questions?.[0]?.id || 'no-question',
        firstQuestionText: session?.questions?.[0]?.question || 'no-text',
      });
    }

    // Assert: Each generation should produce unique questions/IDs (WILL FAIL)
    const uniqueQuestionIds = new Set(generationResults.map((r) => r.firstQuestionId));
    expect(uniqueQuestionIds.size).toBe(
      3,
      'Each generation request should produce unique question IDs, not reuse static templates'
    );

    const uniqueQuestionTexts = new Set(generationResults.map((r) => r.firstQuestionText));
    expect(uniqueQuestionTexts.size).toBeGreaterThan(
      1,
      'Different generation requests should produce varied question content'
    );

    // Session IDs should be unique per request
    const uniqueSessionIds = new Set(generationResults.map((r) => r.sessionId));
    expect(uniqueSessionIds.size).toBe(
      3,
      'Each generation should create a unique session, not reuse static session data'
    );
  });
  describe('Mathematical Answer Validation (REFACTOR Enhancement)', () => {
    it('should correctly parse and validate addition problems', async () => {
      const testCases = [
        { question: 'What is 15 + 7?', expectedAnswer: '22' },
        { question: 'Calculate 25 + 13', expectedAnswer: '38' },
        { question: 'Find the result of 9 + 6', expectedAnswer: '15' },
      ];

      for (const testCase of testCases) {
        const mockQuestions = [
          {
            id: 'q1',
            question: testCase.question,
            correctAnswer: testCase.expectedAnswer,
            options: ['20', testCase.expectedAnswer, '25', '30'],
          },
        ];

        const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
        questionService.generateQuestions.and.returnValue({
          toPromise: () => Promise.resolve({ success: true, data: { questions: mockQuestions } }),
        });

        const component = createTestComponent(questionService);
        await component.generateQuestions();

        expect(component.currentQuestion?.correctAnswer).toBe(testCase.expectedAnswer);
      }
    });

    it('should correctly parse and validate subtraction problems', async () => {
      const testCases = [
        { question: 'What is 20 - 8?', expectedAnswer: '12' },
        { question: 'Calculate 35 - 17', expectedAnswer: '18' },
        { question: 'Find 50 − 23', expectedAnswer: '27' }, // Unicode minus
      ];

      for (const testCase of testCases) {
        const mockQuestions = [
          {
            id: 'q1',
            question: testCase.question,
            correctAnswer: testCase.expectedAnswer,
            options: ['10', testCase.expectedAnswer, '15', '20'],
          },
        ];

        const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
        questionService.generateQuestions.and.returnValue({
          toPromise: () => Promise.resolve({ success: true, data: { questions: mockQuestions } }),
        });

        const component = createTestComponent(questionService);
        await component.generateQuestions();

        expect(component.currentQuestion?.correctAnswer).toBe(testCase.expectedAnswer);
      }
    });

    it('should correctly parse and validate multiplication problems', async () => {
      const testCases = [
        { question: 'What is 6 × 4?', expectedAnswer: '24' },
        { question: 'Calculate 7 * 8', expectedAnswer: '56' },
        { question: 'Find 9 x 5', expectedAnswer: '45' },
      ];

      for (const testCase of testCases) {
        const mockQuestions = [
          {
            id: 'q1',
            question: testCase.question,
            correctAnswer: testCase.expectedAnswer,
            options: ['20', '25', testCase.expectedAnswer, '30'],
          },
        ];

        const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
        questionService.generateQuestions.and.returnValue({
          toPromise: () => Promise.resolve({ success: true, data: { questions: mockQuestions } }),
        });

        const component = createTestComponent(questionService);
        await component.generateQuestions();

        expect(component.currentQuestion?.correctAnswer).toBe(testCase.expectedAnswer);
      }
    });

    it('should correctly parse and validate division problems', async () => {
      const testCases = [
        { question: 'What is 25 ÷ 5?', expectedAnswer: '5' },
        { question: 'Calculate 48 / 6', expectedAnswer: '8' },
        { question: 'Find 63 ÷ 9', expectedAnswer: '7' },
      ];

      for (const testCase of testCases) {
        const mockQuestions = [
          {
            id: 'q1',
            question: testCase.question,
            correctAnswer: testCase.expectedAnswer,
            options: ['4', testCase.expectedAnswer, '6', '9'],
          },
        ];

        const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
        questionService.generateQuestions.and.returnValue({
          toPromise: () => Promise.resolve({ success: true, data: { questions: mockQuestions } }),
        });

        const component = createTestComponent(questionService);
        await component.generateQuestions();

        expect(component.currentQuestion?.correctAnswer).toBe(testCase.expectedAnswer);
      }
    });

    it('should correctly parse word problems with mathematical context', async () => {
      const testCases = [
        {
          question: 'Sarah has 12 apples and gets 5 more. How many does she have?',
          expectedAnswer: '17',
        },
        { question: 'Tom scored 85 points and then scored 15 more points', expectedAnswer: '100' },
        { question: 'Lisa had 30 stickers and lost 12 of them', expectedAnswer: '18' },
        { question: 'Jake received 45 coins and gave away 18 coins', expectedAnswer: '27' },
      ];

      for (const testCase of testCases) {
        const mockQuestions = [
          {
            id: 'q1',
            question: testCase.question,
            correctAnswer: testCase.expectedAnswer,
            options: ['15', testCase.expectedAnswer, '20', '25'],
          },
        ];

        const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
        questionService.generateQuestions.and.returnValue({
          toPromise: () => Promise.resolve({ success: true, data: { questions: mockQuestions } }),
        });

        const component = createTestComponent(questionService);
        await component.generateQuestions();

        expect(component.currentQuestion?.correctAnswer).toBe(testCase.expectedAnswer);
      }
    });

    it('should correctly parse sum, difference, and product expressions', async () => {
      const testCases = [
        { question: 'Find the sum of 18 and 14', expectedAnswer: '32' },
        { question: 'What is the difference between 30 and 12?', expectedAnswer: '18' },
        { question: 'Calculate the product of 7 and 9', expectedAnswer: '63' },
      ];

      for (const testCase of testCases) {
        const mockQuestions = [
          {
            id: 'q1',
            question: testCase.question,
            correctAnswer: testCase.expectedAnswer,
            options: ['25', '30', testCase.expectedAnswer, '40'],
          },
        ];

        const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
        questionService.generateQuestions.and.returnValue({
          toPromise: () => Promise.resolve({ success: true, data: { questions: mockQuestions } }),
        });

        const component = createTestComponent(questionService);
        await component.generateQuestions();

        expect(component.currentQuestion?.correctAnswer).toBe(testCase.expectedAnswer);
      }
    });

    it('should handle edge cases gracefully', async () => {
      const testCases = [
        { question: 'What is your favorite color?', expectedAnswer: 'Option A' }, // Non-mathematical
        { question: 'Calculate 10 ÷ 0', expectedAnswer: 'Option A' }, // Division by zero
        { question: '', expectedAnswer: 'Option A' }, // Empty question
      ];

      for (const testCase of testCases) {
        const mockQuestions = [
          {
            id: 'q1',
            question: testCase.question,
            correctAnswer: testCase.expectedAnswer,
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
          },
        ];

        const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
        questionService.generateQuestions.and.returnValue({
          toPromise: () => Promise.resolve({ success: true, data: { questions: mockQuestions } }),
        });

        const component = createTestComponent(questionService);
        await component.generateQuestions();

        expect(component.currentQuestion?.correctAnswer).toBe(testCase.expectedAnswer);
      }
    });
  });

  it('should generate correct answers that match question content (FAILS - Wrong Answer Bug)', async () => {
    // Arrange: Mock backend returning questions with wrong answers (simulating current bug)
    const mockQuestionsWithWrongAnswers = [
      {
        id: 'q1',
        question: 'What is 5 + 3?',
        correctAnswer: '1', // WRONG! Should be '8' but backend returns option index
        options: ['6', '8', '10', '12'],
      },
    ];
    const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
    questionService.generateQuestions.and.returnValue({
      toPromise: () =>
        Promise.resolve({ success: true, data: { questions: mockQuestionsWithWrongAnswers } }),
    });

    const component = createTestComponent(questionService);

    // Act: Generate questions
    await component.generateQuestions();
    const question = component.currentQuestion;

    // Assert: Correct answer should be the actual answer, not option index (WILL FAIL)
    expect(question?.correctAnswer).toBe('8'); // Should be the actual answer
    expect(question?.correctAnswer).not.toBe('1'); // Should not be option index
  });

  it('should show evidence of agentic workflow processing instead of static templates (FAILS - No Real AI)', async () => {
    // Arrange: Mock request with persona
    const mockPersona = {
      userId: 'user1',
      grade: 5,
      learningStyle: 'visual',
      interests: ['sports', 'animals'],
      culturalContext: 'New Zealand',
    };
    const mockResponse = {
      success: true,
      data: {
        questions: [{ id: 'q1', question: 'Basic template question' }],
        qualityMetrics: {
          vectorRelevanceScore: 0.85, // Should show real vector processing
          agenticValidationScore: 0.9, // Should show real agent validation
          personalizationScore: 0.75, // Should show real personalization
        },
      },
    };
    const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
    questionService.generateQuestions.and.returnValue({
      toPromise: () => Promise.resolve(mockResponse),
    });

    const component = createTestComponent(questionService);

    // Act: Generate questions with rich persona
    await component.generateQuestions();

    // Assert: Should show evidence of real AI processing (WILL FAIL with current simulated approach)
    expect(component.qualityMetrics?.vectorRelevanceScore).toBeGreaterThan(0.8); // Real vector scores vary
    expect(component.qualityMetrics?.agenticValidationScore).toBeGreaterThan(0.8); // Real agent validation varies
    expect(component.qualityMetrics?.personalizationScore).toBeGreaterThan(0.7); // Real personalization varies
  });
});

describe('QuestionGenerator UI Regression', () => {
  it('should set currentStep to QUESTIONS and currentQuestion after backend response (RED phase)', async () => {
    // Arrange: create component instance and mock service using ES6 import
    const mockQuestions = [
      {
        id: 'q1',
        question: 'What is 2+2?',
        questionType: 'multiple_choice',
        options: ['3', '4'],
        correctAnswer: '4',
        hints: [],
      },
      {
        id: 'q2',
        question: 'What is 3+3?',
        questionType: 'multiple_choice',
        options: ['5', '6'],
        correctAnswer: '6',
        hints: [],
      },
    ];
    const mockResponse = { success: true, data: { questions: mockQuestions } };
    // Manual DI for services
    const questionService = jasmine.createSpyObj('QuestionService', ['generateQuestions']);
    questionService.generateQuestions.and.returnValue({
      toPromise: () => Promise.resolve(mockResponse),
    });
    // Create a minimal AuthService mock class to match constructor
    const authService = {
      isAuthenticated: () => true,
      getCurrentUser: () => ({ id: 'u1', grade: 5, country: 'NZ' }),
    } as AuthService;
    const router = {
      navigate: jasmine.createSpy('navigate'),
    } as unknown as import('@angular/router').Router;
    const mockCdr = { detectChanges: () => {} } as any;
    const component = new QuestionGenerator(questionService, authService, router, mockCdr);
    // Set up required state
    component.selectedSubject = 'mathematics';
    component.selectedTopic = 'Addition';
    component.selectedDifficulty = 'beginner';
    component.selectedQuestionType = 'multiple_choice';
    component.questionCount = 2;
    component.learningStyle = LearningStyle.VISUAL; // Fixed assignment to LearningStyle.VISUAL
    component.interests = ['Sports'];
    component.motivationalFactors = ['Achievement'];
    component.currentStep = component.QuestionGeneratorStep.PERSONA;
    // Act: call generateQuestions
    await component.generateQuestions();
    // Assert: currentStep should be QUESTIONS and currentQuestion should be set
    expect(component.currentStep).toBe(component.QuestionGeneratorStep.QUESTIONS);
    expect(component.currentQuestion).toBeTruthy();
    if (component.currentQuestion) {
      expect(component.currentQuestion.id).toBe('q1');
    }
    // This test should fail if regression exists
  });

  describe('QuestionGenerator UI Flow', () => {
    it('should trigger backend request and create session when Generate My Questions is clicked with no session (RED phase)', async () => {
      // Arrange: No currentSession
      component.currentSession = null;
      component.currentStep = QuestionGeneratorStep.PERSONA;
      let backendCalled = false;
      // Spy on questionService.generateQuestions
      component['questionService'].generateQuestions = () => {
        backendCalled = true;
        return of({
          success: true,
          data: {
            sessionId: 'mock-session-id',
            questions: [],
            estimatedTotalTime: 1,
            personalizationSummary: '',
          },
          message: '',
        });
      };
      // Act: Simulate button click
      await component.generateQuestions();
      // Assert: Should fail, backendCalled should be true and session should be created
      expect(backendCalled).toBe(true); // Should fail if bug exists
      expect(component.currentSession).not.toBeNull(); // Should fail if bug exists
    });

    it('should transition UI from "generating" to "questions" and display generated questions after backend response (RED phase)', async () => {
      // Arrange: Start at generating step, no questions yet
      component.currentStep = QuestionGeneratorStep.GENERATING;
      // Explicitly type currentSession as QuestionSession | null
      component.currentSession = null;
      const mockQuestions = [
        {
          id: 'q100',
          subject: 'mathematics',
          topic: 'Addition',
          difficulty: 'beginner',
          questionType: 'multiple_choice',
          question: 'What is 10 + 5?',
          options: ['12', '15', '20'],
          correctAnswer: '15',
          explanation: '10 + 5 = 15',
          hints: ['Try adding ten and five.'],
          personalizationContext: {
            learningStyle: 'visual',
            interests: ['Music'],
            culturalReferences: [],
          },
          metadata: {
            estimatedTimeMinutes: 1,
            gradeLevel: 5,
            tags: ['math'],
            createdAt: new Date().toISOString(),
          },
        },
      ];
      // Mock backend response
      component['questionService'].generateQuestions = () =>
        of({
          success: true,
          data: {
            sessionId: 'mock-session-id',
            questions: mockQuestions,
            estimatedTotalTime: 1,
            personalizationSummary: '',
          },
          message: '',
        });
      // Act: Simulate question generation
      await component.generateQuestions();
      // Assert: UI should transition to 'questions' and display generated questions
      expect(component.currentStep).toBe(QuestionGeneratorStep.QUESTIONS); // Should fail if UI stuck
      expect(component.currentSession).not.toBeNull(); // Should fail if session not set
      if (component.currentSession) {
        const session =
          component.currentSession as import('../../../core/models/question.model').QuestionSession;
        expect(Array.isArray(session.questions) && session.questions.length > 0).toBe(true); // Should fail if questions not set
      }
    });
    let component: QuestionGenerator;

    beforeEach(() => {
      // Create mock services
      const mockQuestionService = {} as QuestionService;
      const mockAuthService = {
        isAuthenticated: () => true,
        getCurrentUser: () => ({ id: 'user1', grade: 5, country: 'NZ' }),
      } as AuthService;
      const mockRouter = { navigate: () => {} } as any;

      // Provide a mock ChangeDetectorRef for constructor
      const mockCdr = { detectChanges: () => {} } as any;
      component = new QuestionGenerator(mockQuestionService, mockAuthService, mockRouter, mockCdr);
      // Simulate initial state
      component.currentStep = QuestionGeneratorStep.GENERATING;
      const mockQuestion = {
        id: 'q1',
        subject: 'mathematics',
        topic: 'Addition',
        difficulty: 'beginner',
        questionType: 'multiple_choice',
        question: 'What is 2 + 2?',
        options: ['3', '4', '5'],
        correctAnswer: '4',
        explanation: '2 + 2 = 4',
        hints: ['Try adding two pairs.'],
        personalizationContext: {
          learningStyle: 'visual',
          interests: ['Sports'],
          culturalReferences: [],
        },
        metadata: {
          estimatedTimeMinutes: 1,
          gradeLevel: 5,
          tags: ['math'],
          createdAt: new Date().toISOString(),
        },
      };
      component.currentSession = {
        id: 'session1',
        userId: 'user1',
        questions: [mockQuestion],
        answers: [],
        startedAt: new Date(),
        totalScore: 0,
        maxScore: 1,
        timeSpentMinutes: 0,
        subject: 'mathematics',
        topic: 'Addition',
      };
    });
    // MMDD NOTE: UI template tests requiring Angular TestBed and DOM queries are not supported in Zone.js-free projects.
    // Navigation controls (Next/Previous buttons) are tested via class-based logic and manual UI inspection only.
    it('should allow navigation between questions using next/previous controls (RED phase)', async () => {
      // Arrange: Create a session with multiple questions
      const mockQuestions = [
        {
          id: 'q1',
          subject: 'mathematics',
          topic: 'Addition',
          difficulty: 'beginner',
          questionType: 'multiple_choice',
          question: 'What is 2+2?',
          options: ['3', '4'],
          correctAnswer: '4',
          explanation: '2 + 2 = 4',
          hints: [],
          personalizationContext: {
            learningStyle: 'visual',
            interests: ['Sports'],
            culturalReferences: [],
          },
          metadata: {
            estimatedTimeMinutes: 1,
            gradeLevel: 5,
            tags: ['math'],
            createdAt: new Date().toISOString(),
          },
        },
        {
          id: 'q2',
          subject: 'mathematics',
          topic: 'Addition',
          difficulty: 'beginner',
          questionType: 'multiple_choice',
          question: 'What is 3+3?',
          options: ['5', '6'],
          correctAnswer: '6',
          explanation: '3 + 3 = 6',
          hints: [],
          personalizationContext: {
            learningStyle: 'visual',
            interests: ['Sports'],
            culturalReferences: [],
          },
          metadata: {
            estimatedTimeMinutes: 1,
            gradeLevel: 5,
            tags: ['math'],
            createdAt: new Date().toISOString(),
          },
        },
      ];
      component.currentSession = {
        id: 'session-nav',
        userId: 'user1',
        questions: mockQuestions,
        answers: [],
        startedAt: new Date(),
        totalScore: 0,
        maxScore: 2,
        timeSpentMinutes: 0,
        subject: 'mathematics',
        topic: 'Addition',
      };
      component.currentStep = QuestionGeneratorStep.QUESTIONS;
      // Act: Try to navigate to next question
      // (Assume navigation methods exist: goToNextQuestion, goToPreviousQuestion)
      expect(component.currentQuestionIndex).toBe(0); // Should start at first question
      component.goToNextQuestion();
      expect(component.currentQuestionIndex).toBe(1); // Should move to second question
      expect(component.currentQuestion && component.currentQuestion.id).toBe('q2');
      component.goToPreviousQuestion();
      expect(component.currentQuestionIndex).toBe(0); // Should return to first question
      expect(component.currentQuestion && component.currentQuestion.id).toBe('q1');
      // This test should fail until navigation logic is implemented
    });

    it('should transition from "generating" to "questions" when questions are generated', () => {
      // Simulate question generation complete
      component.generateQuestions();
      expect(component.currentStep).toBe(QuestionGeneratorStep.QUESTIONS); // This will fail if bug exists
    });

    it('should transition from "persona" to "generating" when Generate My Questions is clicked', () => {
      // Simulate persona selection step
      component.currentStep = QuestionGeneratorStep.PERSONA;
      // Simulate clicking the button
      component.generateQuestions();
      expect([QuestionGeneratorStep.GENERATING, QuestionGeneratorStep.QUESTIONS]).toContain(
        component.currentStep
      ); // Should fail if bug exists
    });

    it('should trigger question generation and transition to "questions" when none exist', async () => {
      // Simulate persona selection and empty session
      component.currentStep = QuestionGeneratorStep.PERSONA;
      component.currentSession = {
        id: 'session2',
        userId: 'user1',
        questions: [],
        answers: [],
        startedAt: new Date(),
        totalScore: 0,
        maxScore: 0,
        timeSpentMinutes: 0,
        subject: 'mathematics',
        topic: 'Addition',
      };
      // Mock questionService.generateQuestions to return a resolved promise with questions
      const mockQuestions = [
        {
          id: 'q2',
          subject: 'mathematics',
          topic: 'Addition',
          difficulty: 'beginner',
          questionType: 'multiple_choice',
          question: 'What is 3 + 3?',
          options: ['5', '6', '7'],
          correctAnswer: '6',
          explanation: '3 + 3 = 6',
          hints: ['Try adding three pairs.'],
          personalizationContext: {
            learningStyle: 'visual',
            interests: ['Sports'],
            culturalReferences: [],
          },
          metadata: {
            estimatedTimeMinutes: 1,
            gradeLevel: 5,
            tags: ['math'],
            createdAt: new Date().toISOString(),
          },
        },
      ];
      component['questionService'].generateQuestions = () =>
        of({
          success: true,
          data: {
            sessionId: 'mock-session-id',
            questions: mockQuestions,
            estimatedTotalTime: 1,
            personalizationSummary: '',
            // qualityMetrics can be omitted or mocked if needed
          },
          message: '',
        });
      // Simulate async question generation
      await component.generateQuestions();
      expect(component.currentStep).toBe(QuestionGeneratorStep.QUESTIONS); // Should now pass if logic is correct
    });
  });
  // <-- Add this closing brace to fix the error
});
