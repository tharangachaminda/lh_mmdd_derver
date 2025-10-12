/**
 * Question Generation Service
 *
 * Handles AI question generation with persona-based personalization
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import {
  QuestionGenerationRequest,
  QuestionGenerationResponse,
  GeneratedQuestion,
  QuestionSession,
  StudentAnswer,
  StudentPersona,
  Subject,
  GRADE_TOPICS,
  EnhancedQuestionGenerationRequest,
  AnswerSubmission,
  ValidationResult,
  getCategoriesForGrade,
} from '../models/question.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class QuestionService {
  private readonly http = inject(HttpClient);

  // Current session state
  private currentSessionSubject = new BehaviorSubject<QuestionSession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();

  // Current question index
  private currentQuestionIndexSubject = new BehaviorSubject<number>(0);
  public currentQuestionIndex$ = this.currentQuestionIndexSubject.asObservable();

  /**
   * Generate AI questions based on user preferences and persona.
   *
   * @param {QuestionGenerationRequest} request - Question generation parameters including subject, topic, difficulty, type, count, and persona.
   * @returns {Observable<QuestionGenerationResponse>} Observable emitting the generated questions response.
   * @throws {Error} If the request is missing required fields.
   * @example
   * ```typescript
   * const request: QuestionGenerationRequest = {
   *   subject: Subject.MATHEMATICS,
   *   topic: 'Addition',
   *   difficulty: DifficultyLevel.INTERMEDIATE,
   *   questionType: QuestionType.MULTIPLE_CHOICE,
   *   count: 5,
   *   persona: studentPersona
   * };
   * this.questionService.generateQuestions(request).subscribe(response => {
   *   console.log('Generated questions:', response.data.questions);
   * });
   * ```
   */
  generateQuestions(request: QuestionGenerationRequest): Observable<QuestionGenerationResponse> {
    if (!request.subject || !request.topic || !request.persona) {
      throw new Error('Missing required fields: subject, topic, or persona');
    }
    const backendRequest: Partial<QuestionGenerationRequest> = {
      subject: request.subject.toLowerCase(),
      topic: request.topic,
      numQuestions: request.numQuestions || 5,
      difficulty: request.difficulty?.toLowerCase() || 'medium',
      questionType: request.questionType?.toLowerCase() || 'multiple_choice',
      persona: request.persona,
    };
    return this.http.post<QuestionGenerationResponse>(
      `${environment.apiUrl}/questions/generate`,
      backendRequest
    );
  }

  /**
   * Generate enhanced AI questions with multi-type support
   *
   * @param {EnhancedQuestionGenerationRequest} request - Enhanced request with multi-type selection and complete persona
   * @returns {Observable<any>} Observable emitting the enhanced generation response
   *
   * @remarks
   * Calls the enhanced API endpoint: POST /api/questions/generate-enhanced
   * Supports 1-5 question types, all formats, and complete persona fields
   *
   * @example
   * ```typescript
   * const request: EnhancedQuestionGenerationRequest = {
   *   subject: 'mathematics',
   *   category: 'number-operations',
   *   gradeLevel: 5,
   *   questionTypes: ['ADDITION', 'SUBTRACTION'],
   *   questionFormat: QuestionFormat.MULTIPLE_CHOICE,
   *   difficultyLevel: EnhancedDifficultyLevel.MEDIUM,
   *   numberOfQuestions: 10,
   *   learningStyle: LearningStyle.VISUAL,
   *   interests: ['Sports', 'Gaming'],
   *   motivators: ['Competition', 'Achievement']
   * };
   * this.questionService.generateQuestionsEnhanced(request).subscribe(response => {
   *   console.log('Generated:', response.data.questions);
   * });
   * ```
   *
   * @since Session 08 Phase B1
   * @version 1.0.0
   */
  generateQuestionsEnhanced(request: EnhancedQuestionGenerationRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/questions/generate-enhanced`, request);
  }

  /**
   * Validate student answers using AI (Phase A6.2 - Short Answer Mode)
   *
   * Submits a batch of student answers to the AI validation endpoint for grading.
   * The AI provides partial credit scoring (0-10 scale) and detailed constructive feedback.
   * Results are stored in MongoDB with student tracking.
   *
   * @param {AnswerSubmission} submission - Batch of student answers to validate
   * @returns {Observable<ValidationResult>} Observable emitting validation results with scores and feedback
   * @throws {Error} If submission is missing required fields (sessionId, studentId, answers)
   * @throws {Error} If answers array is empty
   * @throws {Error} If network request fails
   *
   * @example
   * ```typescript
   * // Collect answers from student
   * const submission: AnswerSubmission = {
   *   sessionId: 'session-123',
   *   studentId: this.currentUser.id,
   *   studentEmail: this.currentUser.email,
   *   answers: [
   *     {
   *       questionId: 'q1',
   *       questionText: 'What is 5 + 3?',
   *       studentAnswer: '8'
   *     },
   *     {
   *       questionId: 'q2',
   *       questionText: 'Solve: 2x + 5 = 13',
   *       studentAnswer: 'x = 4'
   *     }
   *   ],
   *   submittedAt: new Date()
   * };
   *
   * // Submit for AI validation
   * this.questionService.validateAnswers(submission).subscribe({
   *   next: (result: ValidationResult) => {
   *     console.log('Total Score:', result.totalScore);
   *     console.log('Percentage:', result.percentageScore + '%');
   *
   *     result.questions.forEach(q => {
   *       console.log(`Q: ${q.questionText}`);
   *       console.log(`A: ${q.studentAnswer}`);
   *       console.log(`Score: ${q.score}/10 - ${q.feedback}`);
   *     });
   *
   *     console.log('Strengths:', result.strengths);
   *     console.log('Areas to Improve:', result.areasForImprovement);
   *   },
   *   error: (err) => {
   *     console.error('Validation failed:', err);
   *   }
   * });
   * ```
   *
   * @remarks
   * **Validation Process:**
   * 1. Frontend collects all student answers in short-answer mode
   * 2. Submits batch to POST /api/questions/validate-answers
   * 3. Backend AnswerValidationAgent uses LLM (qwen2.5:14b) for grading
   * 4. AI provides:
   *    - Partial credit scoring (0-10 per question)
   *    - Detailed constructive feedback
   *    - Overall performance analysis
   *    - Strengths and improvement areas
   * 5. Results stored in MongoDB (AnswerSubmissionResult model)
   * 6. Frontend displays results with color-coded scores
   *
   * **Scoring Scale:**
   * - 10: Perfect answer
   * - 8-9: Mostly correct with minor issues
   * - 5-7: Partially correct
   * - 2-4: Significant errors but shows understanding
   * - 0-1: Incorrect or no understanding
   *
   * **Error Handling:**
   * - Returns `success: false` with `errorMessage` on validation failure
   * - Network errors propagated through Observable error channel
   * - Invalid submission data returns 400 Bad Request
   * - Authentication failures return 401 Unauthorized
   *
   * **MongoDB Storage:**
   * Results stored in `answer_submission_results` collection with:
   * - Session ID and student ID for tracking
   * - Complete question-answer-feedback mapping
   * - Timestamp and quality metrics
   * - Searchable for progress tracking
   *
   * @see AnswerSubmission - Input data structure
   * @see ValidationResult - Response data structure
   * @see AnswerValidationAgent - Backend AI validation logic (Phase A6.3)
   * @see AnswerSubmissionResult - MongoDB model (Phase A6.1)
   *
   * @since Phase A6.2 (Session 08)
   * @version 1.0.0
   */
  validateAnswers(submission: AnswerSubmission): Observable<ValidationResult> {
    // Input validation
    if (
      !submission.sessionId ||
      !submission.studentId ||
      !submission.answers ||
      submission.answers.length === 0
    ) {
      throw new Error('Invalid submission: sessionId, studentId, and answers are required');
    }

    // Submit to AI validation endpoint (Phase A6.3 will implement backend)
    return this.http.post<ValidationResult>(
      `${environment.apiUrl}/questions/validate-answers`,
      submission
    );
  }

  /**
   * Get available subjects for the current user's grade.
   *
   * @returns {Observable<{ success: boolean; message: string; data: { grade: number; subjects: string[]; user: any; } }>} Observable emitting available subjects and user info.
   * @example
   * this.questionService.getAvailableSubjectsForUser().subscribe(result => {
   *   console.log(result.data.subjects);
   * });
   */
  getAvailableSubjectsForUser(): Observable<{
    success: boolean;
    message: string;
    data: {
      grade: number;
      subjects: string[];
      user: any;
    };
  }> {
    return this.http.get<{
      success: boolean;
      message: string;
      data: { grade: number; subjects: string[]; user: any };
    }>(`${environment.apiUrl}/questions/subjects`);
  }

  /**
   * Submit student answer for a question.
   *
   * @param {string} sessionId - Current question session ID.
   * @param {string} questionId - Question being answered.
   * @param {string} answer - Student's answer.
   * @param {number} timeSpent - Time spent on question in seconds.
   * @param {number} [hintsUsed=0] - Number of hints used.
   * @returns {Observable<{ success: boolean; isCorrect: boolean; explanation: string; nextQuestion?: GeneratedQuestion }>} Observable emitting answer validation result.
   * @throws {Error} If sessionId or questionId is missing.
   * @example
   * this.questionService.submitAnswer('sess1', 'q1', '42', 30, 1).subscribe(result => {
   *   console.log(result.isCorrect);
   * });
   */
  submitAnswer(
    sessionId: string,
    questionId: string,
    answer: string,
    timeSpent: number,
    hintsUsed: number = 0
  ): Observable<{
    success: boolean;
    isCorrect: boolean;
    explanation: string;
    nextQuestion?: GeneratedQuestion;
  }> {
    if (!sessionId || !questionId) {
      throw new Error('Missing sessionId or questionId');
    }
    return this.http.post<{
      success: boolean;
      isCorrect: boolean;
      explanation: string;
      nextQuestion?: GeneratedQuestion;
    }>(`${environment.apiUrl}/questions/sessions/${sessionId}/answers`, {
      questionId,
      answer,
      timeSpent,
      hintsUsed,
    });
  }

  /**
   * Get student's question history and progress.
   *
   * @param {Subject} [subject] - Optional subject filter.
   * @param {number} [limit=10] - Number of sessions to retrieve.
   * @returns {Observable<QuestionSession[]>} Observable emitting question sessions.
   * @example
   * this.questionService.getQuestionHistory('mathematics', 5).subscribe(history => {
   *   console.log(history);
   * });
   */
  getQuestionHistory(subject?: Subject, limit: number = 10): Observable<QuestionSession[]> {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    params.append('limit', limit.toString());
    return this.http.get<QuestionSession[]>(`${environment.apiUrl}/questions/history?${params}`);
  }

  /**
   * Create or update student persona based on learning patterns.
   *
   * @param {Partial<StudentPersona>} persona - Student persona data.
   * @returns {Observable<{ success: boolean; persona: StudentPersona }>} Observable emitting persona save result.
   * @throws {Error} If persona is missing.
   * @example
   * this.questionService.updateStudentPersona({ userId: 'u1', grade: 5 }).subscribe(result => {
   *   console.log(result.persona);
   * });
   */
  updateStudentPersona(
    persona: Partial<StudentPersona>
  ): Observable<{ success: boolean; persona: StudentPersona }> {
    if (!persona) {
      throw new Error('Missing persona');
    }
    return this.http.put<{ success: boolean; persona: StudentPersona }>(
      `${environment.apiUrl}/questions/persona`,
      persona
    );
  }

  /**
   * Get current student persona.
   *
   * @returns {Observable<StudentPersona>} Observable emitting student persona.
   * @example
   * this.questionService.getStudentPersona().subscribe(persona => {
   *   console.log(persona);
   * });
   */
  getStudentPersona(): Observable<StudentPersona> {
    return this.http.get<StudentPersona>(`${environment.apiUrl}/questions/persona`);
  }

  /**
   * Get available topics for a subject and grade.
   *
   * @param {string} subject - Subject to get topics for.
   * @param {number} grade - Student's grade level.
   * @returns {string[]} Array of available topics.
   * @example
   * const topics = this.questionService.getAvailableTopics('mathematics', 5);
   */
  getAvailableTopics(subject: string, grade: number): string[] {
    return GRADE_TOPICS[grade]?.[subject] || [];
  }

  /**
   * Get all available subjects for a grade.
   *
   * @param {number} grade - Student's grade level.
   * @returns {string[]} Array of available subjects.
   * @example
   * const subjects = this.questionService.getAvailableSubjects(5);
   */
  getAvailableSubjects(grade: number): string[] {
    const topics = GRADE_TOPICS[grade];
    if (!topics) return [];
    return Object.keys(topics).filter((subject) => topics[subject].length > 0);
  }

  /** Get all available categories for a grade level. */
  getAvailableCategories(grade: number): string[] {
    return getCategoriesForGrade(grade);
  }

  /**
   * Start a new question session.
   *
   * @param {QuestionSession} session - Question session to start.
   * @returns {void}
   * @example
   * this.questionService.startSession(sessionObj);
   */
  startSession(session: QuestionSession): void {
    this.currentSessionSubject.next(session);
    this.currentQuestionIndexSubject.next(0);
  }

  /**
   * Get current question session.
   *
   * @returns {QuestionSession | null} Current question session or null.
   * @example
   * const session = this.questionService.getCurrentSession();
   */
  getCurrentSession(): QuestionSession | null {
    return this.currentSessionSubject.value;
  }

  /**
   * Move to next question in current session.
   *
   * @returns {boolean} True if moved to next question, false if session complete.
   * @example
   * const moved = this.questionService.nextQuestion();
   */
  nextQuestion(): boolean {
    const session = this.getCurrentSession();
    const currentIndex = this.currentQuestionIndexSubject.value;
    if (!session || currentIndex >= session.questions.length - 1) {
      return false;
    }
    this.currentQuestionIndexSubject.next(currentIndex + 1);
    return true;
  }

  /**
   * Get current question being displayed.
   *
   * @returns {GeneratedQuestion | null} Current question or null.
   * @example
   * const question = this.questionService.getCurrentQuestion();
   */
  getCurrentQuestion(): GeneratedQuestion | null {
    const session = this.getCurrentSession();
    const currentIndex = this.currentQuestionIndexSubject.value;
    if (!session || currentIndex >= session.questions.length) {
      return null;
    }
    return session.questions[currentIndex];
  }

  /**
   * Complete current question session.
   *
   * @param {number} totalScore - Final score achieved.
   * @param {number} timeSpent - Total time spent in minutes.
   * @returns {Observable<{ success: boolean; sessionSummary: any }>} Observable emitting session summary.
   * @throws {Error} If no active session exists.
   * @example
   * this.questionService.completeSession(80, 15).subscribe(summary => {
   *   console.log(summary);
   * });
   */
  completeSession(
    totalScore: number,
    timeSpent: number
  ): Observable<{ success: boolean; sessionSummary: any }> {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('No active session to complete');
    }
    return this.http.post<{ success: boolean; sessionSummary: any }>(
      `${environment.apiUrl}/questions/sessions/${session.id}/complete`,
      {
        totalScore,
        timeSpent,
        completedAt: new Date(),
      }
    );
  }

  /**
   * Clear current session.
   *
   * @returns {void}
   * @example
   * this.questionService.clearSession();
   */
  clearSession(): void {
    this.currentSessionSubject.next(null);
    this.currentQuestionIndexSubject.next(0);
  }
}
