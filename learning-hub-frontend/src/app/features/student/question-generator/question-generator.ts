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
import { Router } from '@angular/router';
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
} from '../../../core/models/question.model';

export { LearningStyle };
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-question-generator',
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './question-generator.html',
  styleUrl: './question-generator.scss',
})
export class QuestionGenerator implements OnInit, OnDestroy {
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
    if (this.currentQuestionIndex < this.currentSession.questions.length - 1) {
      this.currentQuestionIndex++;
      this.currentQuestion = this.currentSession.questions[this.currentQuestionIndex];
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
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
      this.currentQuestion = this.currentSession.questions[this.currentQuestionIndex];
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
  /**
   * Current UI step in the question generation flow
   */
  currentStep: QuestionGeneratorStep = QuestionGeneratorStep.SETUP;
  // Diagnostic: log initial step
  constructor(
    private readonly questionService: QuestionService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef
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

  ngOnInit(): void {
    // ...existing code...

    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      console.log('❌ User not authenticated, redirecting to login');
      this.router.navigate(['/auth/login']);
      return;
    }

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

    this.subscriptions.add(
      this.questionService.currentQuestionIndex$.subscribe((index) => {
        this.currentQuestionIndex = index;
        this.currentQuestion = this.questionService.getCurrentQuestion();
        if (this.currentQuestion) {
          this.resetQuestionState();
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
   * Proceed to persona setup step
   */
  proceedToPersona(): void {
    if (!this.selectedSubject || !this.selectedTopic) {
      this.error = 'Please select both subject and topic';
      return;
    }
    this.currentStep = QuestionGeneratorStep.PERSONA;
    // ...existing code...
    this.error = null;
  }

  /**
   * Generates AI questions based on the current selections and persona.
   * Handles UI state transitions from persona selection to question generation.
   *
   * @returns {Promise<void>} Resolves when questions are generated and UI state is updated.
   * @throws {Error} If question generation fails due to missing session or backend error.
   * @example
   * await component.generateQuestions();
   */
  async generateQuestions(): Promise<void> {
    // Transition from persona selection to generating state
    if (this.currentStep === QuestionGeneratorStep.PERSONA) {
      this.currentStep = QuestionGeneratorStep.GENERATING;
      // ...existing code...
    }

    // If questions are already present in the session, transition to questions view
    if (
      this.currentSession &&
      Array.isArray(this.currentSession.questions) &&
      this.currentSession.questions.length > 0
    ) {
      this.currentStep = QuestionGeneratorStep.QUESTIONS;
      // ...existing code...
      return;
    }

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

    // Minimal implementation: if no questions exist, trigger question generation
    if (
      this.currentSession &&
      Array.isArray(this.currentSession.questions) &&
      this.currentSession.questions.length === 0
    ) {
      // Build request from current selections and persona
      const user = this.currentUser;
      const request = {
        subject: this.currentSession.subject,
        topic: this.currentSession.topic,
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
        const response = await this.questionService.generateQuestions(request).toPromise();
        // ...existing code...
        console.log('[AIQG] Backend response:', response);
        if (response && response.success && Array.isArray(response.data.questions)) {
          this.currentSession.questions = response.data.questions;
          this.currentStep = QuestionGeneratorStep.QUESTIONS;
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
          this.currentQuestion = this.currentSession.questions[0] || null;
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

      this.currentStep = QuestionGeneratorStep.RESULTS;
      // ...existing code...
    } catch (error: any) {
      this.error = error.message || 'Failed to complete session';
    }
  }

  /**
   * Reset question state for new question
   */
  private resetQuestionState(): void {
    this.userAnswer = '';
    this.showHint = false;
    this.hintsUsed = 0;
    this.questionStartTime = Date.now();
  }

  /**
   * Start a new question session
   */
  startNewSession(): void {
    this.questionService.clearSession();
    this.currentStep = QuestionGeneratorStep.SETUP;
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
