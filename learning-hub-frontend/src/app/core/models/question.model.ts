/**
 * Question Generation Models and Interfaces
 *
 * Defines the structure for AI-generated questions with persona-based personalization
 */

export enum Subject {
  MATHEMATICS = 'mathematics',
  SCIENCE = 'science',
  ENGLISH = 'english',
  SOCIAL_STUDIES = 'social_studies',
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
  preferredQuestionTypes: QuestionType[];
  performanceLevel: DifficultyLevel;
  strengths: string[];
  improvementAreas: string[];
  motivationalFactors: string[];
}

/**
 * Question Generation Request
 */
export interface QuestionGenerationRequest {
  subject: Subject;
  topic: string;
  subtopic?: string;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  count: number;
  persona: StudentPersona;
  previousQuestions?: string[]; // To avoid repetition
}

/**
 * Generated Question Structure
 */
export interface GeneratedQuestion {
  id: string;
  subject: Subject;
  topic: string;
  subtopic?: string;
  difficulty: DifficultyLevel;
  questionType: QuestionType;
  question: string;
  options?: string[]; // For multiple choice
  correctAnswer: string;
  explanation: string;
  hints: string[];
  personalizationContext: {
    learningStyle: LearningStyle;
    interests: string[];
    culturalReferences: string[];
  };
  metadata: {
    estimatedTimeMinutes: number;
    gradeLevel: number;
    tags: string[];
    createdAt: Date;
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
  subject: Subject;
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
  message: string;
}

/**
 * Subject Topics Configuration
 */
export interface SubjectTopics {
  [Subject.MATHEMATICS]: string[];
  [Subject.SCIENCE]: string[];
  [Subject.ENGLISH]: string[];
  [Subject.SOCIAL_STUDIES]: string[];
  [Subject.GENERAL]: string[];
}

export const GRADE_TOPICS: Record<number, SubjectTopics> = {
  3: {
    [Subject.MATHEMATICS]: [
      'Addition',
      'Subtraction',
      'Multiplication',
      'Division',
      'Fractions',
      'Shapes',
      'Time',
      'Money',
    ],
    [Subject.SCIENCE]: [
      'Animals',
      'Plants',
      'Weather',
      'Solar System',
      'Matter',
      'Simple Machines',
    ],
    [Subject.ENGLISH]: [
      'Reading Comprehension',
      'Vocabulary',
      'Grammar',
      'Creative Writing',
      'Spelling',
    ],
    [Subject.SOCIAL_STUDIES]: [
      'Community',
      'Geography',
      'History',
      'Culture',
      'New Zealand Heritage',
    ],
    [Subject.GENERAL]: ['Critical Thinking', 'Problem Solving', 'Logic'],
  },
  4: {
    [Subject.MATHEMATICS]: [
      'Multi-digit Operations',
      'Decimals',
      'Geometry',
      'Data Analysis',
      'Measurement',
    ],
    [Subject.SCIENCE]: ['Ecosystems', 'Life Cycles', 'Forces', 'Energy', 'Earth Science'],
    [Subject.ENGLISH]: ['Reading Analysis', 'Writing Process', 'Poetry', 'Research Skills'],
    [Subject.SOCIAL_STUDIES]: ['New Zealand History', 'Government', 'Economics', 'Māori Culture'],
    [Subject.GENERAL]: ['Research Skills', 'Presentation', 'Collaboration'],
  },
  5: {
    [Subject.MATHEMATICS]: [
      'Fractions & Decimals',
      'Volume',
      'Coordinate Plane',
      'Patterns',
      'Statistics',
    ],
    [Subject.SCIENCE]: ['Human Body', 'Earth Changes', 'Matter & Energy', 'Scientific Method'],
    [Subject.ENGLISH]: ['Literature Analysis', 'Persuasive Writing', 'Research Projects'],
    [Subject.SOCIAL_STUDIES]: ['NZ History', 'Constitution', 'Geography Skills', 'Economics'],
    [Subject.GENERAL]: ['Digital Literacy', 'Study Skills', 'Goal Setting'],
  },
  // Add more grades as needed
};
