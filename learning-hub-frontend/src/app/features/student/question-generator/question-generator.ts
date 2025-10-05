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

  // AI Quality Metrics
  qualityMetrics: {
    vectorRelevanceScore: number;
    agenticValidationScore: number;
    personalizationScore: number;
  } | null = null;
  showAIMetrics = false;

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
    console.log('🚀 Question Generator initialized');

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

    console.log('🔍 Loading subjects for user:', this.currentUser);

    // Load available subjects for the user's grade
    this.questionService.getAvailableSubjectsForUser().subscribe({
      next: (response) => {
        console.log('✅ Subjects response:', response);
        if (response.success) {
          this.subjects = response.data.subjects;
          console.log('📚 Loaded subjects:', this.subjects);
        } else {
          console.error('❌ Failed to load subjects:', response.message);
          this.error = 'Failed to load available subjects';
        }
      },
      error: (error) => {
        console.error('❌ Error loading subjects:', error);
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
      console.log('📖 Loading topics for subject:', this.selectedSubject);

      // Get topics from service or provide fallbacks
      this.availableTopics = this.questionService.getAvailableTopics(
        this.selectedSubject,
        this.currentUser.grade
      );

      // If no topics found, provide some basic fallback topics
      if (!this.availableTopics || this.availableTopics.length === 0) {
        console.log('⚠️ No topics found, using fallback topics');
        this.availableTopics = this.getFallbackTopics(this.selectedSubject);
      }

      console.log('📚 Available topics:', this.availableTopics);
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
        grade: this.currentUser.grade || 5, // Include user's grade
        learningStyle: this.learningStyle,
        interests: this.interests,
        culturalContext: this.currentUser.country || 'New Zealand',
        preferredQuestionTypes: [this.selectedQuestionType],
        performanceLevel: this.selectedDifficulty,
        strengths: [],
        improvementAreas: [],
        motivationalFactors: this.motivationalFactors,
      };

      // Generate questions - simplified request for our backend
      const request: QuestionGenerationRequest = {
        subject: this.selectedSubject!,
        topic: this.selectedTopic!,
        difficulty: this.selectedDifficulty,
        questionType: this.selectedQuestionType,
        count: this.questionCount,
        persona: persona,
      };

      const response = await this.questionService.generateQuestions(request).toPromise();

      if (response?.success) {
        // Capture AI quality metrics from backend response
        this.qualityMetrics = response.metrics || null;

        // Start the question session
        const session: QuestionSession = {
          id: response.data.sessionId,
          userId: this.currentUser.id,
          questions: response.data.questions,
          answers: [],
          startedAt: new Date(),
          totalScore: 0,
          maxScore: response.data.questions.length,
          timeSpentMinutes: response.data.estimatedTotalTime || 0,
          subject: this.selectedSubject!,
          topic: this.selectedTopic!,
        };

        this.questionService.startSession(session);
        this.currentStep = 'questions';

        // Log AI enhancement details
        if (this.qualityMetrics) {
          console.log('🤖 AI Question Generation Metrics:', {
            vectorRelevance: `${(this.qualityMetrics.vectorRelevanceScore * 100).toFixed(1)}%`,
            agenticValidation: `${(this.qualityMetrics.agenticValidationScore * 100).toFixed(1)}%`,
            personalization: `${(this.qualityMetrics.personalizationScore * 100).toFixed(1)}%`,
          });
        }
      } else {
        this.error = response?.message || 'Failed to generate questions';
        this.currentStep = 'setup';
      }
    } catch (error: any) {
      console.error('Question generation error:', error);
      this.error =
        error.error?.message || error.message || 'An error occurred while generating questions';
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
