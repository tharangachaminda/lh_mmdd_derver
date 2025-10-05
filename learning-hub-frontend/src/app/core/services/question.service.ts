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
   * Generate AI questions based on user preferences and persona
   *
   * @param request Question generation parameters
   * @returns Observable of generated questions
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
   *
   * this.questionService.generateQuestions(request).subscribe(response => {
   *   console.log('Generated questions:', response.data.questions);
   * });
   * ```
   */
  generateQuestions(request: QuestionGenerationRequest): Observable<QuestionGenerationResponse> {
    // Transform frontend request to backend format
    const backendRequest = {
      subject: request.subject.toLowerCase(),
      topic: request.topic,
      count: request.count || 5,
      difficulty: request.difficulty?.toLowerCase() || 'medium',
      questionType: request.questionType?.toLowerCase() || 'multiple_choice',
    };

    return this.http.post<QuestionGenerationResponse>(
      `${environment.apiUrl}/questions/generate`,
      backendRequest
    );
  }

  /**
   * Get available subjects for the current user's grade
   *
   * @returns Observable of available subjects
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
    return this.http.get<any>(`${environment.apiUrl}/questions/subjects`);
  }

  /**
   * Submit student answer for a question
   *
   * @param sessionId Current question session ID
   * @param questionId Question being answered
   * @param answer Student's answer
   * @param timeSpent Time spent on question in seconds
   * @param hintsUsed Number of hints used
   * @returns Observable of answer validation result
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
    return this.http.post<any>(`${environment.apiUrl}/questions/sessions/${sessionId}/answers`, {
      questionId,
      answer,
      timeSpent,
      hintsUsed,
    });
  }

  /**
   * Get student's question history and progress
   *
   * @param subject Optional subject filter
   * @param limit Number of sessions to retrieve
   * @returns Observable of question sessions
   */
  getQuestionHistory(subject?: Subject, limit: number = 10): Observable<QuestionSession[]> {
    const params = new URLSearchParams();
    if (subject) params.append('subject', subject);
    params.append('limit', limit.toString());

    return this.http.get<QuestionSession[]>(`${environment.apiUrl}/questions/history?${params}`);
  }

  /**
   * Create or update student persona based on learning patterns
   *
   * @param persona Student persona data
   * @returns Observable of persona save result
   */
  updateStudentPersona(
    persona: Partial<StudentPersona>
  ): Observable<{ success: boolean; persona: StudentPersona }> {
    return this.http.put<any>(`${environment.apiUrl}/questions/persona`, persona);
  }

  /**
   * Get current student persona
   *
   * @returns Observable of student persona
   */
  getStudentPersona(): Observable<StudentPersona> {
    return this.http.get<StudentPersona>(`${environment.apiUrl}/questions/persona`);
  }

  /**
   * Get available topics for a subject and grade
   *
   * @param subject Subject to get topics for
   * @param grade Student's grade level
   * @returns Array of available topics
   */
  getAvailableTopics(subject: string, grade: number): string[] {
    return GRADE_TOPICS[grade]?.[subject] || [];
  }

  /**
   * Get all available subjects for a grade
   *
   * @param grade Student's grade level
   * @returns Array of available subjects
   */
  getAvailableSubjects(grade: number): string[] {
    const topics = GRADE_TOPICS[grade];
    if (!topics) return [];

    return Object.keys(topics).filter((subject) => topics[subject].length > 0);
  }

  /**
   * Start a new question session
   *
   * @param session Question session to start
   */
  startSession(session: QuestionSession): void {
    this.currentSessionSubject.next(session);
    this.currentQuestionIndexSubject.next(0);
  }

  /**
   * Get current question session
   *
   * @returns Current question session or null
   */
  getCurrentSession(): QuestionSession | null {
    return this.currentSessionSubject.value;
  }

  /**
   * Move to next question in current session
   *
   * @returns True if moved to next question, false if session complete
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
   * Get current question being displayed
   *
   * @returns Current question or null
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
   * Complete current question session
   *
   * @param totalScore Final score achieved
   * @param timeSpent Total time spent in minutes
   */
  completeSession(
    totalScore: number,
    timeSpent: number
  ): Observable<{ success: boolean; sessionSummary: any }> {
    const session = this.getCurrentSession();
    if (!session) {
      throw new Error('No active session to complete');
    }

    return this.http.post<any>(`${environment.apiUrl}/questions/sessions/${session.id}/complete`, {
      totalScore,
      timeSpent,
      completedAt: new Date(),
    });
  }

  /**
   * Clear current session
   */
  clearSession(): void {
    this.currentSessionSubject.next(null);
    this.currentQuestionIndexSubject.next(0);
  }
}
