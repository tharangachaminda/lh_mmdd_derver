/**
 * Enum for Question Generator UI steps
 */
export enum QuestionGeneratorStep {
  SETUP = 'setup',
  PERSONA = 'persona',
  GENERATING = 'generating',
  QUESTIONS = 'questions',
  RESULTS = 'results',
}
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import { QuestionService } from '../../../core/services/question.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  Subject,
  DifficultyLevel,
  QuestionType,
  LearningStyle,
  QuestionGenerationRequest,
  GeneratedQuestion,
  StudentPersona,
  QuestionSession,
  QualityMetrics, // Phase 1: Import quality metrics
  AgentMetrics, // Phase 1: Import agent metrics
  AnswerSubmission, // Phase A6.2: Batch answer submission
  ValidationResult, // Phase A6.2: AI validation response
  QuestionFormat, // STREAMING: Question format enum
  EnhancedDifficultyLevel, // STREAMING: Enhanced difficulty levels
} from '../../../core/models/question.model';

export { LearningStyle };
import { User } from '../../../core/models/user.model';
import { ResultsService } from '../../../core/services/results.service';
import { QuestionSkeletonComponent } from '../../../shared/components/question-skeleton/question-skeleton';

@Component({
  selector: 'app-question-generator',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, QuestionSkeletonComponent],
  templateUrl: './question-generator.html',
  styleUrl: './question-generator.scss',
})
export class QuestionGenerator implements OnInit, OnDestroy {
  /**
   * REFACTOR: Navigate to specific question by index (used by pagination buttons)
   *
   * Saves current answer before navigation, updates index and current question,
   * loads stored answer for target question if available.
   *
   * **Streaming Support**: Works with both streaming (streamingQuestions) and
   * completed sessions (currentSession.questions) seamlessly.
   *
   * @param {number} index - Zero-based question index
   * @returns {void}
   * @example
   * component.navigateToQuestion(3); // Navigate to question 4
   */
  navigateToQuestion(index: number): void {
    // During streaming, check streamingQuestions array
    const availableQuestions =
      this.isStreaming || this.streamingQuestions.length > 0
        ? this.streamingQuestions
        : this.currentSession?.questions || [];

    if (availableQuestions.length === 0) {
      console.error('❌ No questions available for navigation');
      return;
    }

    // Don't navigate to questions that haven't loaded yet
    if (index >= availableQuestions.length) {
      console.warn(`⚠️  Question ${index + 1} not loaded yet`);
      return;
    }

    // Save current answer before navigating
    if (this.isShortAnswerMode && this.currentQuestion) {
      this.studentAnswers.set(this.currentQuestion.id, this.userAnswer);
      this.questionService.storeStudentAnswersInLocalStorage(this.studentAnswers);
    }

    // Update to new question
    this.currentQuestionIndex = index;
    this.currentQuestion = availableQuestions[index];

    // Load stored answer for new question
    if (this.isShortAnswerMode && this.currentQuestion) {
      this.studentAnswers = this.questionService.loadStudentAnswersFromLocalStorage();
      this.userAnswer = this.studentAnswers.get(this.currentQuestion.id) || '';
    }

    this.cdr.detectChanges();
  }

  /**
   * Advances to the next question in the session, if possible.
   * Updates `currentQuestionIndex` and `currentQuestion`.
   * Calls change detection to update the UI.
   *
   * @returns {void}
   * @example
   * component.goToNextQuestion();
   * @throws {Error} If session or questions are not available.
   */
  goToNextQuestion(): void {
    if (!this.currentSession || !Array.isArray(this.currentSession.questions)) {
      throw new Error('No session or questions available for navigation.');
    }

    // PHASE A6.4: Save current answer before navigating
    if (this.isShortAnswerMode && this.currentQuestion) {
      this.studentAnswers.set(this.currentQuestion.id, this.userAnswer);
      this.questionService.storeStudentAnswersInLocalStorage(this.studentAnswers);
    }

    if (this.currentQuestionIndex < this.currentSession.questions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.currentSession.questions[this.currentQuestionIndex];

      // PHASE A6.4: Load stored answer for new question
      if (this.isShortAnswerMode && this.currentQuestion) {
        this.studentAnswers = this.questionService.loadStudentAnswersFromLocalStorage();
        this.userAnswer = this.studentAnswers.get(this.currentQuestion.id) || '';
      }

      this.cdr.detectChanges();
    }
    // Optionally: else do nothing (already at last question)
  }

  /**
   * Moves to the previous question in the session, if possible.
   * Updates `currentQuestionIndex` and `currentQuestion`.
   * Calls change detection to update the UI.
   *
   * @returns {void}
   * @example
   * component.goToPreviousQuestion();
   * @throws {Error} If session or questions are not available.
   */
  goToPreviousQuestion(): void {
    if (!this.currentSession || !Array.isArray(this.currentSession.questions)) {
      throw new Error('No session or questions available for navigation.');
    }

    // PHASE A6.4: Save current answer before navigating
    if (this.isShortAnswerMode && this.currentQuestion) {
      this.studentAnswers.set(this.currentQuestion.id, this.userAnswer);
      this.questionService.storeStudentAnswersInLocalStorage(this.studentAnswers);
    }

    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.currentSession.questions[this.currentQuestionIndex];

      // PHASE A6.4: Load stored answer for new question
      if (this.isShortAnswerMode && this.currentQuestion) {
        this.studentAnswers = this.questionService.loadStudentAnswersFromLocalStorage();
        this.userAnswer = this.studentAnswers.get(this.currentQuestion.id) || '';
      }

      this.cdr.detectChanges();
    }
    // Optionally: else do nothing (already at first question)
  }
  /**
   * Expose QuestionGeneratorStep enum to template
   */
  public QuestionGeneratorStep = QuestionGeneratorStep;
  subscriptions: Subscription;

  // ...existing code...

  // Component state
  currentUser: User | null = null;

  // Diagnostic: log initial step
  constructor(
    private readonly questionService: QuestionService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private resultService: ResultsService
  ) {
    this.subscriptions = new Subscription();
    // ...existing code...
  }
  loading = false;
  error: string | null = null;

  // Question generation setup
  selectedSubject: string | null = null;
  selectedTopic: string | null = null;
  selectedDifficulty: string = 'medium';
  selectedQuestionType: string = 'multiple_choice';
  questionCount = 5;

  // Persona setup
  learningStyle: LearningStyle = LearningStyle.VISUAL;
  interests: string[] = [];
  availableInterests = [
    'Sports',
    'Technology',
    'Arts',
    'Music',
    'Nature',
    'Animals',
    'Space',
    'History',
    'Science',
    'Reading',
    'Gaming',
    'Cooking',
    'Travel',
    'Movies',
    'Fashion',
    'Cars',
    'Photography',
  ];
  motivationalFactors: string[] = [];
  availableMotivators = [
    'Competition',
    'Achievement',
    'Exploration',
    'Creativity',
    'Social Learning',
    'Personal Growth',
    'Problem Solving',
    'Recognition',
  ];

  // Phase 1: AI Quality Metrics Integration
  qualityMetrics: QualityMetrics | null = null;
  agentMetrics: AgentMetrics | null = null;
  showAIMetrics = false; // Toggle for showing/hiding AI metrics section

  // Available options
  subjects: string[] = []; // Will be loaded from backend
  difficultyLevels: string[] = ['beginner', 'intermediate', 'advanced'];
  questionTypes: string[] = ['multiple_choice', 'short_answer', 'true_false'];
  learningStyles = Object.values(LearningStyle);
  availableTopics: string[] = [];

  // Current session
  currentSession: QuestionSession | null = null;
  currentQuestion: GeneratedQuestion | null = null;
  currentQuestionIndex = 0;
  userAnswer = '';
  showHint = false;
  hintsUsed = 0;
  questionStartTime = Date.now();
  sessionResults: any = null;

  // PHASE A6.2: Answer collection for short-answer mode
  /** Flag indicating if in short-answer mode (all questions use text input) */
  isShortAnswerMode: boolean = false;
  /** Map of question IDs to student answers */
  studentAnswers: Map<string, string> = new Map();
  /** Loading state for answer submission */
  isSubmittingAnswers: boolean = false;

  // STREAMING: Progressive question loading
  /** Array of questions that grows as stream receives them */
  streamingQuestions: GeneratedQuestion[] = [];
  /** Total expected number of questions from streaming */
  totalExpectedQuestions: number = 0;
  /** Per-question loading states (true = loading, false = loaded) */
  questionLoadingStates: boolean[] = [];
  /** Flag indicating if currently streaming questions */
  isStreaming: boolean = false;
  /** Streaming error message */
  streamingError: string | null = null;

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('❌ User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }

    // REFACTOR: Check for streaming query params first (new consolidated streaming approach)
    this.route.queryParams.subscribe((params) => {
      if (params['streaming'] === 'true') {
        console.log('🌊 Streaming mode detected from query params:', params);

        // Get streaming request from sessionStorage
        const streamingRequestJson = sessionStorage.getItem('streamingRequest');
        if (!streamingRequestJson) {
          console.error('❌ No streaming request found in sessionStorage');
          this.error = 'Streaming session expired. Please generate questions again.';
          return;
        }

        const streamingParams = JSON.parse(streamingRequestJson);
        const expectedCount = parseInt(params['count'], 10) || 10;

        // Initialize streaming state
        this.totalExpectedQuestions = expectedCount;
        this.isStreaming = true;
        this.streamingQuestions = [];
        this.isShortAnswerMode = true;

        // Start streaming immediately
        this.startStreamingGeneration(streamingParams);

        // Clear sessionStorage after reading
        sessionStorage.removeItem('streamingRequest');

        // Load user data and subscribe to changes
        this.loadUserData();
        this.subscribeToSessionChanges();
        return;
      }
    }); // PHASE A6.3: Check for session in service first (persists across refresh)
    const existingSession = this.questionService.getCurrentSession();
    console.log('Existing session from service:', existingSession);
    if (existingSession && existingSession.questions.length > 0) {
      this.isShortAnswerMode = true;
      this.currentSession = existingSession;
      this.currentQuestionIndex = 0;
      this.currentQuestion = this.currentSession.questions[0];

      this.studentAnswers = this.questionService.loadStudentAnswersFromLocalStorage();
      console.log('Loaded student answers from local storage Q gen:', this.studentAnswers);
      // PHASE A6.4: Initialize userAnswer from stored answers for first question
      if (this.currentQuestion) {
        this.userAnswer = this.studentAnswers.get(this.currentQuestion.id) || '';
      }

      console.log(
        '✅ Loaded session from service:',
        this.currentSession.id,
        'with',
        this.currentSession.questions.length,
        'questions'
      );
    }
    // PHASE A6.2: Fallback - legacy router state support (kept for backward compatibility)
    // This path is rarely used now that streaming uses query params

    this.loadUserData();
    this.subscribeToSessionChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Load current user data and preferences
   */
  private loadUserData(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // ...existing code...

    // Load available subjects for the user's grade
    this.questionService.getAvailableSubjectsForUser().subscribe({
      next: (response) => {
        // ...existing code...
        if (response.success) {
          this.subjects = response.data.subjects;
          // ...existing code...
        } else {
          // ...existing code...
          this.error = 'Failed to load available subjects';
        }
      },
      error: (error) => {
        // ...existing code...
        this.error = 'Failed to load subjects. Please try logging in again.';
        // Fallback to default subjects
        this.subjects = ['mathematics', 'english', 'science', 'social-studies'];
      },
    });

    // Load existing persona if available
    this.questionService.getStudentPersona().subscribe({
      next: (persona) => {
        this.learningStyle = persona.learningStyle;
        this.interests = persona.interests;
        this.motivationalFactors = persona.motivationalFactors;
      },
      error: (error) => {
        // ...existing code...
      },
    });
  }

  /**
   * Subscribe to question session changes
   */
  private subscribeToSessionChanges(): void {
    this.subscriptions.add(
      this.questionService.currentSession$.subscribe((session) => {
        this.currentSession = session;
        // Ensure currentQuestion is set when session has questions
        if (session && Array.isArray(session.questions) && session.questions.length > 0) {
          this.currentQuestionIndex = 0;
          this.currentQuestion = session.questions[0];
          console.log('[AIQG] Session updated from observable:', session);
          console.log('[AIQG] Current question set from observable:', this.currentQuestion);
          this.cdr.detectChanges();
        }
      })
    );
  }

  /**
   * Handle subject selection and load available topics
   */
  onSubjectChange(): void {
    if (this.selectedSubject && this.currentUser?.grade) {
      // ...existing code...

      // Get topics from service or provide fallbacks
      this.availableTopics = this.questionService.getAvailableTopics(
        this.selectedSubject,
        this.currentUser.grade
      );

      // If no topics found, provide some basic fallback topics
      if (!this.availableTopics || this.availableTopics.length === 0) {
        // ...existing code...
        this.availableTopics = this.getFallbackTopics(this.selectedSubject);
      }

      // ...existing code...
      this.selectedTopic = null;
    }
  }

  /**
   * Get fallback topics for a subject
   */
  private getFallbackTopics(subject: string): string[] {
    const topicMap: { [key: string]: string[] } = {
      mathematics: [
        'Addition',
        'Subtraction',
        'Multiplication',
        'Division',
        'Fractions',
        'Algebra',
      ],
      english: ['Grammar', 'Reading Comprehension', 'Writing', 'Vocabulary', 'Literature'],
      science: ['Biology', 'Chemistry', 'Physics', 'Earth Science', 'Environmental Science'],
      'social-studies': ['History', 'Geography', 'Government', 'Economics', 'Culture'],
      technology: ['Computer Basics', 'Programming', 'Digital Literacy', 'Internet Safety'],
    };

    return topicMap[subject] || ['General Topics'];
  }

  /**
   * Toggle interest selection
   */
  toggleInterest(interest: string): void {
    const index = this.interests.indexOf(interest);
    if (index === -1) {
      this.interests.push(interest);
    } else {
      this.interests.splice(index, 1);
    }
  }

  /**
   * Toggle motivational factor selection
   */
  toggleMotivator(motivator: string): void {
    const index = this.motivationalFactors.indexOf(motivator);
    if (index === -1) {
      this.motivationalFactors.push(motivator);
    } else {
      this.motivationalFactors.splice(index, 1);
    }
  }

  /**
   * Generates AI questions with streaming support.
   * Uses Server-Sent Events (SSE) to receive questions progressively as they're generated,
   * providing instant feedback and better user experience compared to waiting for all questions.
   *
   * **Streaming Benefits:**
   * - First question appears in ~2 seconds vs 10+ seconds for batch
   * - Users can start reading/answering while remaining questions generate
   * - Visual feedback with skeleton loaders for pending questions
   * - Navigation buttons enable as questions become available
   *
   * @returns {Promise<void>} Resolves when streaming completes or UI transitions occur
   * @throws {Error} If question generation fails due to missing session or backend error
   *
   * @example
   * await component.generateQuestions();
   */
  async generateQuestions(): Promise<void> {
    // REFACTOR: This method is now DEPRECATED - streaming happens in ngOnInit via router state
    // Kept for backward compatibility but should not be called in normal flow
    console.warn(
      '⚠️  generateQuestions() called directly - this is deprecated. Use unified-generator instead.'
    );
    return;

    // GREEN phase fix: If no session exists, create a new session before generating questions
    if (!this.currentSession) {
      const user = this.currentUser;
      this.currentSession = {
        id: 'session-' + Date.now(),
        userId: user?.id || '',
        questions: [],
        answers: [],
        startedAt: new Date(),
        totalScore: 0,
        maxScore: 0,
        timeSpentMinutes: 0,
        subject: this.selectedSubject || '',
        topic: this.selectedTopic || '',
      };
      // ...existing code...
    }

    // NOTE: DEPRECATED CODE PATH - This legacy batch generation is no longer used
    // All generation now goes through generateQuestionsWithStreaming() above
    // This code path is unreachable but kept for reference
    // Using non-null assertions since streaming redirect happens first
    if (
      this.currentSession &&
      Array.isArray(this.currentSession?.questions) &&
      this.currentSession!.questions.length === 0
    ) {
      // Build request from current selections and persona
      const user = this.currentUser;
      const session = this.currentSession!;
      const request = {
        subject: session.subject,
        topic: session.topic,
        difficulty: this.selectedDifficulty,
        questionType: this.selectedQuestionType,
        numQuestions: this.questionCount,
        persona: {
          userId: user?.id || '',
          grade: user?.grade || 0,
          learningStyle: this.learningStyle,
          interests: this.interests,
          motivationalFactors: this.motivationalFactors,
          culturalContext: user?.country || 'NZ',
          preferredQuestionTypes: [this.selectedQuestionType],
          performanceLevel: 'average',
          strengths: [],
          improvementAreas: [],
        },
      };
      try {
        const response: any = await this.questionService.generateQuestions(request).toPromise();
        // ...existing code...
        console.log('[AIQG] Backend response:', response);
        if (
          response &&
          response.success &&
          response.data &&
          Array.isArray(response.data.questions)
        ) {
          this.currentSession!.questions = response.data.questions;
          // ...existing code...

          // Phase 1: Capture AI quality metrics and agent metrics
          this.qualityMetrics = response.metrics || null;
          this.agentMetrics = response.agentMetrics || null;

          console.log('✅ Phase 1: AI Metrics captured:', {
            qualityMetrics: this.qualityMetrics,
            agentMetrics: this.agentMetrics,
          });

          // Minimal fix: ensure first question is displayed
          this.currentQuestionIndex = 0;
          this.currentQuestion = this.currentSession!.questions[0] || null;
          console.log('[AIQG] Session after generation:', this.currentSession);
          console.log('[AIQG] Current question after generation:', this.currentQuestion);
          this.cdr.detectChanges();
        } else {
          this.error = 'Failed to generate questions.';
          // ...existing code...
        }
      } catch (err: any) {
        this.error = err?.message || 'Error generating questions.';
        // ...existing code...
      }
    }
  }

  /**
   * REFACTOR: Start streaming generation with provided request parameters
   *
   * Consolidated streaming logic - this is now the ONLY place where questions stream.
   * Called from ngOnInit when router state contains streaming params from unified-generator.
   *
   * Progressively loads questions as they're generated, providing instant feedback.
   * Updates UI with skeleton loaders for pending questions and enables navigation
   * as each question becomes available.
   *
   * **Implementation Details:**
   * - Creates new session for streaming questions
   * - Initializes loading states for all expected questions
   * - Subscribes to streaming observable
   * - Adds questions to array and session as they arrive
   * - Updates loading states and enables navigation progressively
   * - Handles completion and errors gracefully
   * - Saves partial sessions to localStorage for answer persistence
   *
   * @param {any} request - Enhanced question generation request with all parameters
   * @returns {void}
   * @throws {Error} If session creation or streaming subscription fails
   *
   * @example
   * const request = { subject: 'mathematics', category: 'addition', ... };
   * component.startStreamingGeneration(request);
   */
  private startStreamingGeneration(request: any): void {
    // Create new session for streaming
    const user = this.currentUser;
    const sessionId = `session-${Date.now()}`;

    this.currentSession = {
      id: sessionId,
      userId: user?.id || '',
      questions: [],
      answers: [],
      startedAt: new Date(),
      totalScore: 0,
      maxScore: this.totalExpectedQuestions * 10,
      timeSpentMinutes: 0,
      subject: request.subject || 'mathematics',
      topic: request.category || '',
    };

    // Initialize streaming state (already set in ngOnInit, but ensure arrays are ready)
    this.streamingError = null;
    this.streamingQuestions = [];
    this.questionLoadingStates = new Array(this.totalExpectedQuestions).fill(true);
    this.isShortAnswerMode = true;

    console.log('🌊 Starting question streaming...', {
      sessionId: sessionId,
      expectedQuestions: this.totalExpectedQuestions,
      request,
    });

    // Subscribe to streaming observable
    this.subscriptions.add(
      this.questionService.generateQuestionsEnhancedStream(request).subscribe({
        next: (question: GeneratedQuestion) => {
          console.log(
            `📥 Received question ${this.streamingQuestions.length + 1}/${
              this.totalExpectedQuestions
            }`,
            question
          );

          // Add question to streaming array
          this.streamingQuestions.push(question);

          // Update loading state for this question
          const questionIndex = this.streamingQuestions.length - 1;
          this.questionLoadingStates[questionIndex] = false;

          // Update session questions
          if (this.currentSession) {
            this.currentSession.questions = [...this.streamingQuestions];
            this.currentSession.maxScore = this.streamingQuestions.length * 10;

            // REFACTOR: Store partial session after each question for answer persistence
            this.questionService.storeSession(this.currentSession);
          }

          // Transition to questions view on first question
          if (this.streamingQuestions.length === 1) {
            this.currentQuestionIndex = 0;
            this.currentQuestion = this.streamingQuestions[0];
            console.log('✅ First question received, displaying in UI');
          }

          // Trigger change detection to update UI
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('❌ Streaming error:', error);
          this.isStreaming = false;
          this.streamingError = error.message || 'Failed to stream questions';
          this.error = this.streamingError;
          this.cdr.detectChanges();
        },
        complete: () => {
          console.log(
            `✅ Streaming complete: ${this.streamingQuestions.length} questions received`
          );
          this.isStreaming = false;

          // Final update to session
          if (this.currentSession) {
            this.currentSession.questions = this.streamingQuestions;
            this.currentSession.maxScore = this.streamingQuestions.length * 10;
          }

          this.cdr.detectChanges();
        },
      })
    );
  }

  /**
   * Submit current question answer
   */
  async submitAnswer(): Promise<void> {
    if (!this.currentSession || !this.currentQuestion || !this.userAnswer.trim()) {
      return;
    }

    this.loading = true;
    const timeSpent = Math.floor((Date.now() - this.questionStartTime) / 1000);

    try {
      const result = await this.questionService
        .submitAnswer(
          this.currentSession.id,
          this.currentQuestion.id,
          this.userAnswer,
          timeSpent,
          this.hintsUsed
        )
        .toPromise();

      if (result?.success) {
        // Update session score
        if (result.isCorrect) {
          this.currentSession.totalScore++;
        }

        // Move to next question or show results
        if (!this.questionService.nextQuestion()) {
          await this.completeSession();
        }
      }
    } catch (error: any) {
      this.error = error.message || 'Failed to submit answer';
    } finally {
      this.loading = false;
    }
  }

  /**
   * Show hint for current question
   */
  showQuestionHint(): void {
    this.showHint = true;
    this.hintsUsed++;
  }

  /**
   * Check if a question at given index is loaded (available for viewing)
   *
   * During streaming, questions load progressively. This method determines
   * if a specific question has been received and can be displayed.
   *
   * @param {number} index - Zero-based question index
   * @returns {boolean} True if question is loaded, false if still loading
   *
   * @example
   * // Check if question 3 is loaded
   * if (component.isQuestionLoaded(2)) {
   *   // Enable navigation to question 3
   * }
   */
  isQuestionLoaded(index: number): boolean {
    // During streaming, check loading states
    if (this.isStreaming || this.streamingQuestions.length > 0) {
      return index < this.streamingQuestions.length;
    }
    // Non-streaming mode: all questions loaded at once
    return !!(this.currentSession?.questions && index < this.currentSession.questions.length);
  }

  /**
   * Check if should show skeleton loader for a question index
   *
   * @param {number} index - Zero-based question index
   * @returns {boolean} True if should show skeleton, false otherwise
   *
   * @example
   * // Show skeleton for pending questions
   * if (component.shouldShowSkeleton(5)) {
   *   // Display skeleton loader
   * }
   */
  shouldShowSkeleton(index: number): boolean {
    return (
      this.isStreaming &&
      index >= this.streamingQuestions.length &&
      index < this.totalExpectedQuestions
    );
  }

  /**
   * Complete the current question session
   */
  private async completeSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      const totalTime = Math.floor(
        (Date.now() - this.currentSession.startedAt.getTime()) / (1000 * 60)
      );
      const result = await this.questionService
        .completeSession(this.currentSession.totalScore, totalTime)
        .toPromise();

      this.sessionResults = {
        score: this.currentSession.totalScore,
        maxScore: this.currentSession.maxScore,
        percentage: Math.round(
          (this.currentSession.totalScore / this.currentSession.maxScore) * 100
        ),
        timeSpent: totalTime,
        summary: result?.sessionSummary,
      };

      // ...existing code...
    } catch (error: any) {
      this.error = error.message || 'Failed to complete session';
    }
  }

  /**
   * Reset question state for new question
   */
  private resetQuestionState(): void {
    this.showHint = false;
    this.hintsUsed = 0;
    this.questionStartTime = Date.now();
  }

  /**
   * Start a new question session
   */
  startNewSession(): void {
    this.questionService.clearSession();
    // ...existing code...
    this.sessionResults = null;
    this.qualityMetrics = null;
    this.showAIMetrics = false;
    this.error = null;
  }

  /**
   * Toggle AI metrics display
   */
  toggleAIMetrics(): void {
    this.showAIMetrics = !this.showAIMetrics;
  }

  /**
   * Calculate overall quality score from all metrics
   * Returns weighted average: 30% relevance, 40% validation, 30% personalization
   */
  getOverallQualityScore(): number {
    if (!this.qualityMetrics) return 0;

    const weights = {
      relevance: 0.3,
      validation: 0.4,
      personalization: 0.3,
    };

    return (
      this.qualityMetrics.vectorRelevanceScore * weights.relevance +
      this.qualityMetrics.agenticValidationScore * weights.validation +
      this.qualityMetrics.personalizationScore * weights.personalization
    );
  }

  /**
   * Get student-friendly description of overall quality
   */
  getOverallQualityDescription(): string {
    const score = this.getOverallQualityScore();
    if (score >= 0.9) return 'Outstanding! These questions are perfect for you.';
    if (score >= 0.8) return 'Excellent! High quality questions matched to your level.';
    if (score >= 0.7) return 'Very Good! These questions suit your learning needs.';
    if (score >= 0.6) return 'Good! Solid questions for your practice.';
    return 'Fair. Questions generated successfully.';
  }

  // ============================================================================
  // PHASE A6.2: SHORT-ANSWER MODE WITH ANSWER COLLECTION
  // ============================================================================

  /**
   * Track answer change for current question in short-answer mode
   * Saves answer to studentAnswers Map for batch submission
   */
  onAnswerChange(): void {
    if (this.isShortAnswerMode && this.currentQuestion) {
      this.studentAnswers.set(this.currentQuestion.id, this.userAnswer);
      console.log(`📝 Answer saved for question ${this.currentQuestion.id}:`, this.userAnswer);
    }
  }

  /**
   * Check if all questions have been answered
   * @returns True if all questions have non-empty answers
   */
  allQuestionsAnswered(): boolean {
    if (!this.currentSession) return false;

    for (const question of this.currentSession.questions) {
      const answer = this.studentAnswers.get(question.id);
      if (!answer || answer.trim() === '') {
        return false;
      }
    }
    return true;
  }

  /**
   * Get count of answered questions
   * @returns Number of questions with non-empty answers
   */
  getAnsweredCount(): number {
    if (!this.currentSession) return 0;

    let count = 0;
    for (const question of this.currentSession.questions) {
      const answer = this.studentAnswers.get(question.id);
      if (answer && answer.trim() !== '') {
        count++;
      }
    }
    return count;
  }

  /**
   * Phase A6.2.3: Submit all answers for AI validation
   *
   * Collects all student answers and submits them to the AI validation endpoint.
   * Upon successful validation, navigates to results page to display scores and feedback.
   *
   * @returns {void}
   *
   * @remarks
   * **Process Flow:**
   * 1. Validates all questions are answered
   * 2. Builds AnswerSubmission payload with sessionId, studentId, and answers
   * 3. Calls QuestionService.validateAnswers() API
   * 4. On success: Navigate to results page with validation data
   * 5. On error: Display user-friendly error message
   *
   * **Error Handling:**
   * - Missing answers: Shows "Please answer all questions" error
   * - Missing session/user: Shows "Session information missing" error
   * - Network errors: Shows "Failed to submit answers" with retry option
   * - API errors: Shows error message from server response
   *
   * @example
   * ```typescript
   * // Called when user clicks "Submit All Answers" button
   * submitAllAnswers();
   * // → Validates answers
   * // → Submits to API
   * // → Navigates to results on success
   * ```
   *
   * @since Phase A6.2.3 (Session 08)
   */
  submitAllAnswers(): void {
    // Validation: Check all questions answered
    if (!this.allQuestionsAnswered()) {
      this.error = 'Please answer all questions before submitting.';
      return;
    }

    // Validation: Check session and user information
    if (!this.currentSession || !this.currentUser) {
      this.error = 'Session or user information missing. Please try again.';
      return;
    }

    // Set loading state
    this.isSubmittingAnswers = true;
    this.error = null;

    // Build AnswerSubmission payload
    const submission: AnswerSubmission = {
      sessionId: this.currentSession.id,
      studentId: this.currentUser.id || '',
      studentEmail: this.currentUser.email || '',
      answers: this.currentSession.questions.map((q) => ({
        questionId: q.id,
        questionText: q.question,
        studentAnswer: this.studentAnswers.get(q.id) || '',
      })),
      submittedAt: new Date(),
    };

    console.log('📤 Submitting answers for AI validation:', {
      sessionId: submission.sessionId,
      studentId: submission.studentId,
      answersCount: submission.answers.length,
    });

    // Call AI validation service
    this.questionService.validateAnswers(submission).subscribe({
      next: (result: ValidationResult) => {
        console.log('✅ Validation successful:', {
          totalScore: result.totalScore,
          percentage: result.percentageScore,
          questionsValidated: result.questions.length,
        });

        // Clear current session in service
        this.questionService.clearLocalSession();

        // Clear stored answers from local storage
        this.questionService.clearStudentAnswersFromLocalStorage();
        this.studentAnswers.clear();

        // Reset loading state
        this.isSubmittingAnswers = false;
        this.error = null;

        // Phase A6.5: Navigate to results page with validation data
        // set results in shared results service
        this.resultService.setValidationResults(result);
        this.router.navigate(['/student/question-generator/results']);
      },
      error: (err) => {
        console.error('❌ Validation failed:', err);

        // Reset loading state
        this.isSubmittingAnswers = false;

        // Display user-friendly error message
        if (err.status === 401) {
          this.error = 'Authentication failed. Please log in again.';
        } else if (err.status === 400) {
          this.error = err.error?.errorMessage || 'Invalid submission. Please check your answers.';
        } else if (err.status === 0) {
          this.error = 'Network error. Please check your connection and try again.';
        } else {
          this.error = err.error?.errorMessage || 'Failed to submit answers. Please try again.';
        }
      },
    });
  }

  /**
   * Get quality score description
   */
  getQualityDescription(score: number): string {
    if (score >= 0.9) return 'Excellent';
    if (score >= 0.8) return 'Very Good';
    if (score >= 0.7) return 'Good';
    if (score >= 0.6) return 'Fair';
    return 'Needs Improvement';
  }

  /**
   * Get quality score color class
   */
  getQualityColorClass(score: number): string {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.7) return 'text-blue-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  }

  /**
   * Get option letter for multiple choice (A, B, C, D, etc.)
   */
  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  /**
   * Return to dashboard
   */
  returnToDashboard(): void {
    this.router.navigate(['/student/dashboard']);
  }
}
