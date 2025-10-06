import { QuestionGenerator, QuestionGeneratorStep, LearningStyle } from './question-generator';
import { of } from 'rxjs';
import { QuestionService } from '../../../core/services/question.service';
import { AuthService } from '../../../core/services/auth.service';

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
