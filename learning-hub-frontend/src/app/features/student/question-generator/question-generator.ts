import { Component, OnInit, OnDestroy, inject } from '@angular/core';
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
} from '../../../core/models/question.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-question-generator',
  imports: [CommonModule, FormsModule],
  templateUrl: './question-generator.html',
  styleUrl: './question-generator.scss',
})
export class QuestionGenerator implements OnInit, OnDestroy {
  private readonly questionService = inject(QuestionService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private subscriptions = new Subscription();

  // Component state
  currentUser: User | null = null;
  currentStep: 'setup' | 'persona' | 'generating' | 'questions' | 'results' = 'setup';
  loading = false;
  error: string | null = null;

  // Question generation setup
  selectedSubject: Subject | null = null;
  selectedTopic: string | null = null;
  selectedDifficulty: DifficultyLevel = DifficultyLevel.BEGINNER;
  selectedQuestionType: QuestionType = QuestionType.MULTIPLE_CHOICE;
  questionCount = 10;

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

  // Available options
  subjects = Object.values(Subject);
  difficultyLevels = Object.values(DifficultyLevel);
  questionTypes = Object.values(QuestionType);
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

    // Load existing persona if available
    this.questionService.getStudentPersona().subscribe({
      next: (persona) => {
        this.learningStyle = persona.learningStyle;
        this.interests = persona.interests;
        this.motivationalFactors = persona.motivationalFactors;
      },
      error: (error) => {
        console.log('No existing persona found, using defaults');
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
      this.availableTopics = this.questionService.getAvailableTopics(
        this.selectedSubject,
        this.currentUser.grade
      );
      this.selectedTopic = null;
    }
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
    this.currentStep = 'persona';
    this.error = null;
  }

  /**
   * Generate AI questions based on selections
   */
  async generateQuestions(): Promise<void> {
    if (!this.currentUser || !this.selectedSubject || !this.selectedTopic) {
      this.error = 'Missing required information';
      return;
    }

    this.currentStep = 'generating';
    this.loading = true;
    this.error = null;

    try {
      // Create/update student persona
      const persona: StudentPersona = {
        userId: this.currentUser.id,
        learningStyle: this.learningStyle,
        interests: this.interests,
        culturalContext: this.currentUser.country || 'International',
        preferredQuestionTypes: [this.selectedQuestionType],
        performanceLevel: this.selectedDifficulty,
        strengths: [],
        improvementAreas: [],
        motivationalFactors: this.motivationalFactors,
      };

      // Save persona
      await this.questionService.updateStudentPersona(persona).toPromise();

      // Generate questions
      const request: QuestionGenerationRequest = {
        subject: this.selectedSubject,
        topic: this.selectedTopic,
        difficulty: this.selectedDifficulty,
        questionType: this.selectedQuestionType,
        count: this.questionCount,
        persona: persona,
      };

      const response = await this.questionService.generateQuestions(request).toPromise();

      if (response?.success) {
        // Start the question session
        const session: QuestionSession = {
          id: response.data.sessionId,
          userId: this.currentUser.id,
          questions: response.data.questions,
          answers: [],
          startedAt: new Date(),
          totalScore: 0,
          maxScore: response.data.questions.length,
          timeSpentMinutes: 0,
          subject: this.selectedSubject,
          topic: this.selectedTopic,
        };

        this.questionService.startSession(session);
        this.currentStep = 'questions';
      } else {
        this.error = response?.message || 'Failed to generate questions';
        this.currentStep = 'setup';
      }
    } catch (error: any) {
      this.error = error.message || 'An error occurred while generating questions';
      this.currentStep = 'setup';
    } finally {
      this.loading = false;
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

      this.currentStep = 'results';
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
    this.currentStep = 'setup';
    this.sessionResults = null;
    this.error = null;
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
