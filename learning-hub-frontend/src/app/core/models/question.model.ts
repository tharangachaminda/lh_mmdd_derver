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
  numQuestions: number;
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
 * Phase 1: AI Quality Metrics
 * Provides transparency into AI-generated question quality
 */
export interface QualityMetrics {
  vectorRelevanceScore: number; // Vector database similarity (0-1)
  agenticValidationScore: number; // Multi-agent validation score (0-1)
  personalizationScore: number; // Persona alignment score (0-1)
}

/**
 * Phase 1: Agent Metrics
 * Detailed information about multi-agent workflow execution
 */
export interface AgentMetrics {
  agentsUsed: string[]; // Names of agents executed
  workflowTiming: {
    totalMs: number; // Total workflow execution time
    perAgent: Record<string, number>; // Per-agent execution time
  };
  qualityChecks: {
    mathematicalAccuracy: boolean; // Math correctness validation
    ageAppropriateness: boolean; // Grade-level appropriateness
    pedagogicalSoundness: boolean; // Educational value check
    diversityScore: number; // Question variety score (0-1)
    issues: string[]; // Any quality issues found
  };
  confidenceScore: number; // Overall workflow confidence (0-1)
  contextEnhancement: {
    applied: boolean; // Whether context was enhanced
    engagementScore: number; // Engagement level (0-1)
  };
  difficultySettings?: {
    numberRange: { min: number; max: number };
    complexity: string;
    cognitiveLoad: string;
    allowedOperations: string[];
  };
  questionGeneration?: {
    questionsGenerated: number;
    averageConfidence: number;
    modelsUsed: string[];
    vectorContextUsed: boolean;
  };
}

/**
 * Question Generation Response
 * Updated for Phase 1: Core Metrics Integration
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
  metrics?: QualityMetrics; // Phase 1: Quality metrics
  agentMetrics?: AgentMetrics; // Phase 1: Agent workflow metrics
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
