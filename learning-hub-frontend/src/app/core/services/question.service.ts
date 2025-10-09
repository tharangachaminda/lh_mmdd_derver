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
