/**
 * Question Generation Models and Interfaces
 *
 * Defines the structure for AI-generated questions with persona-based personalization
 */

export enum Subject {
  MATHEMATICS = 'mathematics',
  SCIENCE = 'science',
  ENGLISH = 'english',
  SOCIAL_STUDIES = 'social-studies',
  TECHNOLOGY = 'technology',
  GENERAL = 'general',
}

export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
  SHORT_ANSWER = 'short_answer',
  PROBLEM_SOLVING = 'problem_solving',
  CREATIVE_WRITING = 'creative_writing',
  FILL_IN_BLANK = 'fill_in_blank',
}

export enum LearningStyle {
  VISUAL = 'visual',
  AUDITORY = 'auditory',
  KINESTHETIC = 'kinesthetic',
  READING_WRITING = 'reading_writing',
}

/**
 * Student Persona for Question Personalization
 */
export interface StudentPersona {
  userId: string;
  grade: number; // Student's current grade/year level
  learningStyle: LearningStyle;
  interests: string[];
  culturalContext: string; // Country or region
  preferredQuestionTypes: string[]; // Changed to string array to match backend
  performanceLevel: string; // Changed to string to match backend
  strengths: string[];
  improvementAreas: string[];
  motivationalFactors: string[];
}

/**
 * Question Generation Request
 */
export interface QuestionGenerationRequest {
  subject: string; // Changed to string to match backend
  topic: string;
  difficulty: string; // Changed to string to match backend
  questionType: string; // Changed to string to match backend
  count: number;
  persona: StudentPersona;
}

/**
 * Generated Question
 */
export interface GeneratedQuestion {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionType: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
  personalizationContext: {
    learningStyle: string;
    interests: string[];
    culturalReferences: string[];
  };
  metadata: {
    estimatedTimeMinutes: number;
    gradeLevel: number;
    tags: string[];
    createdAt: string;
  };
}

/**
 * Question Session for Progress Tracking
 */
export interface QuestionSession {
  id: string;
  userId: string;
  questions: GeneratedQuestion[];
  answers: StudentAnswer[];
  startedAt: Date;
  completedAt?: Date;
  totalScore: number;
  maxScore: number;
  timeSpentMinutes: number;
  subject: string; // Changed to string to match backend
  topic: string;
}

/**
 * Student Answer Tracking
 */
export interface StudentAnswer {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  timeSpentSeconds: number;
  hintsUsed: number;
  attemptCount: number;
  submittedAt: Date;
}

/**
 * Question Generation Response
 */
export interface QuestionGenerationResponse {
  success: boolean;
  data: {
    sessionId: string;
    questions: GeneratedQuestion[];
    estimatedTotalTime: number;
    personalizationSummary: string;
    qualityMetrics?: {
      vectorRelevanceScore: number;
      agenticValidationScore: number;
      personalizationScore: number;
    };
  };
  metrics?: {
    vectorRelevanceScore: number;
    agenticValidationScore: number;
    personalizationScore: number;
  };
  user?: any;
  message: string;
}

/**
 * Grade-Based Topic Mappings
 */
export interface SubjectTopics {
  [key: string]: string[]; // Simplified to use string keys
}

export interface GradeTopics {
  [grade: number]: SubjectTopics;
}

/**
 * Sample grade-based topics (this would typically come from the backend)
 */
export const GRADE_TOPICS: GradeTopics = {
  9: {
    mathematics: ['Algebra', 'Geometry', 'Statistics', 'Linear Equations'],
    science: ['Biology', 'Chemistry', 'Physics', 'Earth Science'],
    english: ['Literature', 'Writing', 'Grammar', 'Reading Comprehension'],
    'social-studies': ['History', 'Geography', 'Government', 'Economics'],
    technology: ['Computer Basics', 'Programming', 'Digital Literacy'],
    general: ['General Knowledge', 'Critical Thinking'],
  },
  // Add more grades as needed
};
