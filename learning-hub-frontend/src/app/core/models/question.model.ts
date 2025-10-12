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
 * Student Answers
 */
export interface StudentAnswer {
  questionId: string;
  studentAnswer: string;
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
 * Question Generation Request (Legacy)
 * @deprecated Use EnhancedQuestionGenerationRequest for new implementations
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
 * Question Format Options
 */
export enum QuestionFormat {
  MULTIPLE_CHOICE = 'multiple_choice',
  SHORT_ANSWER = 'short_answer',
  TRUE_FALSE = 'true_false',
  FILL_IN_BLANK = 'fill_in_blank',
}

/**
 * Difficulty Level for Enhanced System
 */
export enum EnhancedDifficultyLevel {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

/**
 * Enhanced Question Generation Request
 *
 * Supports unified generator with multi-type selection, category context,
 * and complete persona fields for AI personalization.
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
 *   interests: ['Sports', 'Gaming', 'Science'],
 *   motivators: ['Competition', 'Achievement'],
 *   includeExplanations: true
 * };
 * ```
 */

/**
 * Category Metadata Interface
 *
 * Rich educational context for question generation. Helps AI generate contextually
 * appropriate questions by providing the category's educational purpose and learning objectives.
 *
 * @interface
 * @since Phase A4 (E2E Fix)
 */
export interface CategoryMetadata {
  /** Human-readable category name (e.g., 'Number Operations & Arithmetic') */
  name: string;

  /** Educational purpose of the category */
  description: string;

  /** Key skills and learning objectives */
  skillsFocus: string[];
}

export interface EnhancedQuestionGenerationRequest {
  // Context from navigation
  subject: string;
  category: string;
  gradeLevel: number;

  // Multi-type selection (NEW)
  questionTypes: string[];

  // Question configuration (NEW)
  questionFormat: QuestionFormat;
  difficultyLevel: EnhancedDifficultyLevel;
  numberOfQuestions: number;

  // Complete Persona Fields for AI Personalization
  learningStyle: LearningStyle;
  interests: string[]; // 1-5 interests
  motivators: string[]; // 1-3 motivators

  // Optional enhancement fields
  focusAreas?: string[];
  includeExplanations?: boolean;

  // E2E Fix (Phase A4): Rich category context for better AI generation
  categoryMetadata?: CategoryMetadata;
}

/**
 * Validation constraints for enhanced requests
 */
export const ENHANCED_REQUEST_CONSTRAINTS = {
  QUESTION_TYPES: { MIN: 1, MAX: 5 },
  INTERESTS: { MIN: 1, MAX: 5 },
  MOTIVATORS: { MIN: 0, MAX: 3 },
  NUMBER_OF_QUESTIONS: [5, 10, 15, 20, 25, 30] as const,
  GRADE_LEVEL: { MIN: 1, MAX: 12 },
} as const;

/**
 * Available interest options
 */
export const INTEREST_OPTIONS = [
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
] as const;

/**
 * Available motivator options
 */
export const MOTIVATOR_OPTIONS = [
  'Competition',
  'Achievement',
  'Exploration',
  'Creativity',
  'Social Learning',
  'Personal Growth',
  'Problem Solving',
  'Recognition',
] as const;

/**
 * Available category options
 */
export const CATEGORY_OPTIONS = [
  'number-operations',
  'algebraic-thinking',
  'geometry-spatial',
  'measurement-data',
  'fractions-decimals',
  'problem-solving',
  'patterns-relationships',
  'financial-literacy',
] as const;

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
 * Phase A6.2: Answer Submission for Batch Validation
 *
 * Represents a batch submission of student answers for AI validation.
 * Used in short-answer mode where students complete all questions before submitting.
 *
 * @interface AnswerSubmission
 * @since Phase A6.2 (Session 08)
 *
 * @example
 * ```typescript
 * const submission: AnswerSubmission = {
 *   sessionId: 'session-123',
 *   studentId: 'user-456',
 *   studentEmail: 'student@example.com',
 *   answers: [
 *     { questionId: 'q1', questionText: 'What is 5 + 3?', studentAnswer: '8' },
 *     { questionId: 'q2', questionText: 'What is 10 - 4?', studentAnswer: '6' }
 *   ],
 *   submittedAt: new Date()
 * };
 * ```
 */
export interface AnswerSubmission {
  /** Session ID from question generation */
  sessionId: string;

  /** Student's user ID */
  studentId: string;

  /** Student's email address */
  studentEmail: string;

  /** Array of question-answer pairs to validate */
  answers: {
    questionId: string;
    questionText: string;
    studentAnswer: string;
  }[];

  /** Timestamp when answers were submitted */
  submittedAt: Date;
}

/**
 * Phase A6.2: Validation Result from AI
 *
 * Response from AI validation endpoint with detailed feedback for each question.
 * Includes partial credit scoring (0-10 scale) and constructive feedback.
 *
 * @interface ValidationResult
 * @since Phase A6.2 (Session 08)
 *
 * @example
 * ```typescript
 * const result: ValidationResult = {
 *   success: true,
 *   sessionId: 'session-123',
 *   totalScore: 85,
 *   maxScore: 100,
 *   percentageScore: 85,
 *   questions: [
 *     {
 *       questionId: 'q1',
 *       questionText: 'What is 5 + 3?',
 *       studentAnswer: '8',
 *       score: 10,
 *       maxScore: 10,
 *       feedback: 'Correct! Excellent work.',
 *       isCorrect: true
 *     }
 *   ],
 *   overallFeedback: 'Great job! You demonstrated strong understanding.',
 *   strengths: ['Accurate calculations', 'Clear explanations'],
 *   areasForImprovement: ['Try to show your work']
 * };
 * ```
 */
export interface ValidationResult {
  /** Indicates if validation was successful */
  success: boolean;

  /** Session ID for tracking */
  sessionId: string;

  /** Total score earned (sum of individual question scores) */
  totalScore: number;

  /** Maximum possible score */
  maxScore: number;

  /** Percentage score (0-100) */
  percentageScore: number;

  /** Detailed results for each question */
  questions: {
    questionId: string;
    questionText: string;
    studentAnswer: string;
    score: number; // 0-10 scale with partial credit
    maxScore: number; // Usually 10
    feedback: string; // Constructive feedback from AI
    isCorrect: boolean; // True if score >= 8
  }[];

  /** Overall feedback on performance */
  overallFeedback: string;

  /** List of strengths identified by AI */
  strengths: string[];

  /** Areas where student can improve */
  areasForImprovement: string[];

  /** Optional error message if validation failed */
  errorMessage?: string;
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
 * Grade-based topic mappings for Mathematics (Grades 3-8)
 * Maps directly to vector database question types
 * Organized by grade level following NZ Mathematics Curriculum progression
 */
export const GRADE_TOPICS: GradeTopics = {
  3: {
    mathematics: ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', 'PATTERN_RECOGNITION'],
  },
  4: {
    mathematics: [
      'ADDITION',
      'SUBTRACTION',
      'MULTIPLICATION',
      'DIVISION',
      'DECIMAL_BASICS',
      'FRACTION_BASICS',
      'PLACE_VALUE',
      'PATTERN_RECOGNITION',
      'SHAPE_PROPERTIES',
      'TIME_MEASUREMENT',
    ],
  },
  5: {
    mathematics: [
      'ADVANCED_ARITHMETIC',
      'ALGEBRAIC_THINKING',
      'DECIMAL_OPERATIONS',
      'FRACTION_OPERATIONS',
      'RATIO_PROPORTION',
    ],
  },
  6: {
    mathematics: [
      'LARGE_NUMBER_OPERATIONS',
      'ADVANCED_FRACTIONS_DECIMALS',
      'ALGEBRAIC_EQUATIONS',
      'ADVANCED_PATTERNS',
      'AREA_VOLUME_CALCULATIONS',
      'COORDINATE_GEOMETRY',
      'TRANSFORMATIONS_SYMMETRY',
      'MEASUREMENT_MASTERY',
      'DATA_ANALYSIS',
      'PROBABILITY_BASICS',
      'ADVANCED_PROBLEM_SOLVING',
      'MATHEMATICAL_REASONING',
      'REAL_WORLD_APPLICATIONS',
    ],
  },
  7: {
    mathematics: [
      'ADVANCED_NUMBER_OPERATIONS',
      'FRACTION_DECIMAL_MASTERY',
      'ALGEBRAIC_FOUNDATIONS',
      'GEOMETRY_SPATIAL_REASONING',
      'MULTI_UNIT_CONVERSIONS',
      'DATA_ANALYSIS_PROBABILITY',
    ],
  },
  8: {
    mathematics: [
      'PRIME_COMPOSITE_NUMBERS',
      'NEGATIVE_NUMBERS',
      'FRACTION_DECIMAL_PERCENTAGE',
      'NUMBER_PATTERNS',
      'LINEAR_EQUATIONS',
      'ALGEBRAIC_MANIPULATION',
      'PERIMETER_AREA_VOLUME',
      'UNIT_CONVERSIONS',
      'SPEED_CALCULATIONS',
      'RATIOS_PROPORTIONS',
      'FINANCIAL_LITERACY',
    ],
  },
};

/**
 * ============================================================================
 * CATEGORY-BASED QUESTION TYPE SYSTEM
 * ============================================================================
 * New system for organizing mathematics question types by educational domains.
 * Replaces simple topic lists with rich category metadata including:
 * - Educational descriptions
 * - Skills students will develop
 * - Material Design icons for UI
 * - Curriculum strand alignment
 */

/**
 * Category metadata interface
 */
export interface CategoryInfo {
  name: string;
  description: string;
  skillsFocus: string[];
  icon: string;
  curriculumStrand: string;
}

/**
 * Question category definitions with metadata
 * Icons are Material Design icon names (not emoji)
 */
export const QUESTION_CATEGORIES: Record<string, CategoryInfo> = {
  'number-operations': {
    name: 'Number Operations & Arithmetic',
    description:
      'Fundamental computational skills with whole numbers, fractions, decimals, and integers.',
    skillsFocus: [
      'Computational accuracy and speed',
      'Number sense and magnitude understanding',
      'Fraction/decimal/percentage conversions',
      'Working with negative numbers',
    ],
    icon: 'calculate',
    curriculumStrand: 'Number and Algebra',
  },
  'algebra-patterns': {
    name: 'Algebra & Patterns',
    description:
      'Algebraic thinking, pattern recognition, and abstract reasoning with variables and equations.',
    skillsFocus: [
      'Pattern recognition and prediction',
      'Abstract and symbolic thinking',
      'Equation solving techniques',
      'Variable manipulation',
    ],
    icon: 'functions',
    curriculumStrand: 'Number and Algebra',
  },
  'geometry-measurement': {
    name: 'Geometry & Measurement',
    description:
      'Spatial reasoning, shapes, measurements, coordinates, and geometric transformations.',
    skillsFocus: [
      'Spatial visualization and reasoning',
      'Measurement accuracy and estimation',
      'Coordinate system navigation',
      'Unit conversion proficiency',
    ],
    icon: 'straighten',
    curriculumStrand: 'Measurement and Geometry',
  },
  'statistics-probability': {
    name: 'Statistics & Probability',
    description:
      'Data handling, statistical analysis, and probability concepts for understanding chance and data.',
    skillsFocus: [
      'Data collection and organization',
      'Statistical measure calculation',
      'Probability reasoning',
      'Critical analysis of data',
    ],
    icon: 'bar_chart',
    curriculumStrand: 'Statistics and Probability',
  },
  'ratios-rates-proportions': {
    name: 'Ratios, Rates & Proportions',
    description: 'Proportional relationships, ratios, rates, and scaling for comparing quantities.',
    skillsFocus: [
      'Proportional reasoning',
      'Ratio comparison and simplification',
      'Rate calculations',
      'Scale factor applications',
    ],
    icon: 'balance',
    curriculumStrand: 'Number and Algebra',
  },
  'motion-distance': {
    name: 'Motion & Distance',
    description:
      'Speed, distance, time problems applying mathematics to real-world travel scenarios.',
    skillsFocus: [
      'Speed-distance-time relationships',
      'Formula application',
      'Multi-stage journey planning',
      'Unit conversion for motion',
    ],
    icon: 'directions_run',
    curriculumStrand: 'Measurement',
  },
  'financial-literacy': {
    name: 'Financial Literacy',
    description: 'Practical money management, budgeting, and financial decision-making skills.',
    skillsFocus: [
      'Money calculation and budgeting',
      'Interest calculation',
      'Financial planning',
      'Cost comparison analysis',
    ],
    icon: 'attach_money',
    curriculumStrand: 'Number and Algebra',
  },
  'problem-solving-reasoning': {
    name: 'Problem Solving & Reasoning',
    description: 'Multi-step problems and mathematical reasoning integrating multiple concepts.',
    skillsFocus: [
      'Multi-step problem solving',
      'Logical reasoning and deduction',
      'Integration of multiple concepts',
      'Solution verification',
    ],
    icon: 'psychology',
    curriculumStrand: 'All Strands (Cross-Curricular)',
  },
};

/**
 * Maps vector database question types to user-friendly display names
 * Updated to match actual question bank files (Grades 3-8)
 *
 * @remarks
 * This mapping only includes question types that exist in the database.
 * Organized by category for maintainability.
 */
export const QUESTION_TYPE_DISPLAY_NAMES: Record<string, string> = {
  // Number Operations & Arithmetic (Grades 3-8)
  ADDITION: 'Addition', // Grades 3-4
  SUBTRACTION: 'Subtraction', // Grades 3-4
  MULTIPLICATION: 'Multiplication', // Grades 3-4
  DIVISION: 'Division', // Grades 3-4
  DECIMAL_BASICS: 'Decimals (Basic)', // Grade 4
  DECIMAL_OPERATIONS: 'Decimal Operations', // Grade 5
  FRACTION_BASICS: 'Fractions (Basic)', // Grade 4
  FRACTION_OPERATIONS: 'Fraction Operations', // Grade 5
  FRACTION_DECIMAL_PERCENTAGE: 'Fractions, Decimals & Percentages', // Grade 8
  FRACTION_DECIMAL_MASTERY: 'Fraction & Decimal Mastery', // Grade 7
  ADVANCED_FRACTIONS_DECIMALS: 'Advanced Fractions & Decimals', // Grade 6
  PLACE_VALUE: 'Place Value', // Grade 4
  LARGE_NUMBER_OPERATIONS: 'Large Numbers', // Grade 6
  NEGATIVE_NUMBERS: 'Negative Numbers', // Grade 8
  PRIME_COMPOSITE_NUMBERS: 'Prime & Composite Numbers', // Grade 8
  ADVANCED_ARITHMETIC: 'Advanced Arithmetic', // Grade 5
  ADVANCED_NUMBER_OPERATIONS: 'Advanced Number Operations', // Grade 7

  // Algebra & Patterns (Grades 3-8)
  PATTERN_RECOGNITION: 'Pattern Recognition', // Grades 3-4
  NUMBER_PATTERNS: 'Number Patterns', // Grade 8
  ADVANCED_PATTERNS: 'Advanced Patterns', // Grade 6
  ALGEBRAIC_THINKING: 'Algebraic Thinking', // Grade 5
  ALGEBRAIC_EQUATIONS: 'Algebraic Equations', // Grade 6
  ALGEBRAIC_FOUNDATIONS: 'Algebraic Foundations', // Grade 7
  ALGEBRAIC_MANIPULATION: 'Algebraic Expressions', // Grade 8
  LINEAR_EQUATIONS: 'Linear Equations', // Grade 8

  // Geometry & Measurement (Grades 4-8)
  SHAPE_PROPERTIES: 'Shape Properties', // Grade 4
  AREA_VOLUME_CALCULATIONS: 'Area & Volume', // Grade 6
  PERIMETER_AREA_VOLUME: 'Perimeter, Area & Volume', // Grade 8
  COORDINATE_GEOMETRY: 'Coordinate Geometry', // Grade 6
  GEOMETRY_SPATIAL_REASONING: 'Spatial Reasoning', // Grade 7
  TRANSFORMATIONS_SYMMETRY: 'Transformations & Symmetry', // Grade 6
  MEASUREMENT_MASTERY: 'Measurement Mastery', // Grade 6
  UNIT_CONVERSIONS: 'Unit Conversions', // Grade 8
  MULTI_UNIT_CONVERSIONS: 'Multi-Unit Conversions', // Grade 7
  TIME_MEASUREMENT: 'Time Measurement', // Grade 4

  // Statistics & Probability (Grades 6-7)
  DATA_ANALYSIS: 'Data Analysis', // Grade 6
  DATA_ANALYSIS_PROBABILITY: 'Data Analysis & Probability', // Grade 7
  PROBABILITY_BASICS: 'Probability Basics', // Grade 6

  // Ratios & Proportions (Grades 5, 8)
  RATIO_PROPORTION: 'Ratios & Proportions', // Grade 5
  RATIOS_PROPORTIONS: 'Ratios & Proportions', // Grade 8

  // Motion & Distance (Grade 8)
  SPEED_CALCULATIONS: 'Speed Calculations', // Grade 8

  // Financial Literacy (Grade 8)
  FINANCIAL_LITERACY: 'Money & Financial Literacy', // Grade 8

  // Problem Solving & Reasoning (Grade 6)
  REAL_WORLD_APPLICATIONS: 'Real-World Math Problems', // Grade 6
  ADVANCED_PROBLEM_SOLVING: 'Problem Solving', // Grade 6
  MATHEMATICAL_REASONING: 'Mathematical Reasoning', // Grade 6
};

/**
 * Maps question types to their categories
 * Updated to match actual question bank files (Grades 3-8)
 *
 * @remarks
 * This mapping only includes question types that exist in the database.
 * Used for organizing questions into educational categories in the UI.
 */
export const QUESTION_TYPE_TO_CATEGORY: Record<string, string> = {
  // Number Operations & Arithmetic (Grades 3-8)
  ADDITION: 'number-operations',
  SUBTRACTION: 'number-operations',
  MULTIPLICATION: 'number-operations',
  DIVISION: 'number-operations',
  DECIMAL_BASICS: 'number-operations',
  DECIMAL_OPERATIONS: 'number-operations',
  FRACTION_BASICS: 'number-operations',
  FRACTION_OPERATIONS: 'number-operations',
  FRACTION_DECIMAL_PERCENTAGE: 'number-operations',
  FRACTION_DECIMAL_MASTERY: 'number-operations',
  ADVANCED_FRACTIONS_DECIMALS: 'number-operations',
  PLACE_VALUE: 'number-operations',
  LARGE_NUMBER_OPERATIONS: 'number-operations',
  NEGATIVE_NUMBERS: 'number-operations',
  PRIME_COMPOSITE_NUMBERS: 'number-operations',
  ADVANCED_ARITHMETIC: 'number-operations',
  ADVANCED_NUMBER_OPERATIONS: 'number-operations',

  // Algebra & Patterns (Grades 3-8)
  PATTERN_RECOGNITION: 'algebra-patterns',
  NUMBER_PATTERNS: 'algebra-patterns',
  ADVANCED_PATTERNS: 'algebra-patterns',
  ALGEBRAIC_THINKING: 'algebra-patterns',
  ALGEBRAIC_EQUATIONS: 'algebra-patterns',
  ALGEBRAIC_FOUNDATIONS: 'algebra-patterns',
  ALGEBRAIC_MANIPULATION: 'algebra-patterns',
  LINEAR_EQUATIONS: 'algebra-patterns',

  // Geometry & Measurement (Grades 4-8)
  SHAPE_PROPERTIES: 'geometry-measurement',
  AREA_VOLUME_CALCULATIONS: 'geometry-measurement',
  PERIMETER_AREA_VOLUME: 'geometry-measurement',
  COORDINATE_GEOMETRY: 'geometry-measurement',
  GEOMETRY_SPATIAL_REASONING: 'geometry-measurement',
  TRANSFORMATIONS_SYMMETRY: 'geometry-measurement',
  MEASUREMENT_MASTERY: 'geometry-measurement',
  UNIT_CONVERSIONS: 'geometry-measurement',
  MULTI_UNIT_CONVERSIONS: 'geometry-measurement',
  TIME_MEASUREMENT: 'geometry-measurement',

  // Statistics & Probability (Grades 6-7)
  DATA_ANALYSIS: 'statistics-probability',
  DATA_ANALYSIS_PROBABILITY: 'statistics-probability',
  PROBABILITY_BASICS: 'statistics-probability',

  // Ratios & Proportions (Grades 5, 8)
  RATIO_PROPORTION: 'ratios-rates-proportions',
  RATIOS_PROPORTIONS: 'ratios-rates-proportions',

  // Motion & Distance (Grade 8)
  SPEED_CALCULATIONS: 'motion-distance',

  // Financial Literacy (Grade 8)
  FINANCIAL_LITERACY: 'financial-literacy',

  // Problem Solving & Reasoning (Grade 6)
  REAL_WORLD_APPLICATIONS: 'problem-solving-reasoning',
  ADVANCED_PROBLEM_SOLVING: 'problem-solving-reasoning',
  MATHEMATICAL_REASONING: 'problem-solving-reasoning',
};

/**
 * Grade to available categories mapping
 * Used to filter categories shown based on selected grade level
 */
export const GRADE_TO_CATEGORIES: Record<number, string[]> = {
  3: ['number-operations', 'algebra-patterns'],
  4: ['number-operations', 'algebra-patterns', 'geometry-measurement'],
  5: ['number-operations', 'algebra-patterns', 'ratios-rates-proportions'],
  6: [
    'number-operations',
    'algebra-patterns',
    'geometry-measurement',
    'statistics-probability',
    'problem-solving-reasoning',
  ],
  7: [
    'number-operations',
    'algebra-patterns',
    'geometry-measurement',
    'statistics-probability',
    'problem-solving-reasoning',
  ],
  8: [
    'number-operations',
    'algebra-patterns',
    'geometry-measurement',
    'ratios-rates-proportions',
    'motion-distance',
    'financial-literacy',
  ],
};

/**
 * Helper function to get all available categories for a given grade level
 * @param grade - The student's grade level
 * @returns Array of category keys available for that grade
 */
export function getCategoriesForGrade(grade: number): string[] {
  return GRADE_TO_CATEGORIES[grade] || [];
}

/**
 * ============================================================================
 * HELPER FUNCTIONS
 * ============================================================================
 */

/**
 * Get the category key for a given question type from the vector database.
 *
 * This function maps database question types (e.g., 'ADDITION', 'ALGEBRAIC_MANIPULATION')
 * to their corresponding educational category keys for UI organization.
 *
 * @param dbType - The database question type identifier (uppercase, underscore-separated)
 * @returns The category key (lowercase, hyphen-separated), or 'problem-solving-reasoning' as default
 *
 * @example
 * ```typescript
 * getCategoryForQuestionType('ADDITION'); // Returns: 'number-operations'
 * getCategoryForQuestionType('ALGEBRAIC_MANIPULATION'); // Returns: 'algebra-patterns'
 * getCategoryForQuestionType('UNKNOWN_TYPE'); // Returns: 'problem-solving-reasoning' (default)
 * ```
 *
 * @remarks
 * Falls back to 'problem-solving-reasoning' for unmapped types to ensure graceful handling
 * of future question types that haven't been categorized yet.
 */
export function getCategoryForQuestionType(dbType: string): string {
  return QUESTION_TYPE_TO_CATEGORY[dbType] || 'problem-solving-reasoning';
}

/**
 * Get comprehensive metadata for a question category.
 *
 * Retrieves all information needed to display a category card in the UI, including
 * the category name, description, skills students will develop, Material Design icon name,
 * and NZ Curriculum strand alignment.
 *
 * @param categoryKey - The category identifier (e.g., 'number-operations', 'algebra-patterns')
 * @returns CategoryInfo object with complete metadata, or null if category not found
 *
 * @example
 * ```typescript
 * const info = getCategoryInfo('number-operations');
 * // Returns: {
 * //   name: 'Number Operations & Arithmetic',
 * //   description: 'Fundamental computational skills...',
 * //   skillsFocus: ['Computational accuracy', 'Number sense', ...],
 * //   icon: 'calculate',
 * //   curriculumStrand: 'Number and Algebra'
 * // }
 *
 * getCategoryInfo('invalid-key'); // Returns: null
 * ```
 *
 * @remarks
 * Returns null for invalid keys to allow calling code to handle missing categories gracefully.
 */
export function getCategoryInfo(categoryKey: string): CategoryInfo | null {
  return QUESTION_CATEGORIES[categoryKey] || null;
}

/**
 * Get all question types that belong to a specific category.
 *
 * Returns an array of database question type identifiers (e.g., 'ADDITION', 'SUBTRACTION')
 * that are classified under the specified category. Useful for displaying all available
 * question types when a student selects a category.
 *
 * @param categoryKey - The category identifier
 * @returns Array of database question type keys, empty array if category not found or has no types
 *
 * @example
 * ```typescript
 * const types = getQuestionTypesForCategory('number-operations');
 * // Returns: ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION', ...]
 *
 * const financialTypes = getQuestionTypesForCategory('financial-literacy');
 * // Returns: ['FINANCIAL_LITERACY']
 *
 * getQuestionTypesForCategory('invalid-category'); // Returns: []
 * ```
 *
 * @remarks
 * - Returns empty array for invalid categories to prevent undefined errors
 * - Use with getDisplayNameForQuestionType() to get user-friendly names
 * - Results should be filtered by grade level before displaying to students
 */
export function getQuestionTypesForCategory(categoryKey: string): string[] {
  return Object.entries(QUESTION_TYPE_TO_CATEGORY)
    .filter(([_, cat]) => cat === categoryKey)
    .map(([type, _]) => type);
}

/**
 * Get question types available for a specific category filtered by grade level.
 *
 * Returns only the question types that exist in the database for both the specified
 * category AND grade level. This prevents showing question types that aren't available
 * for the student's grade.
 *
 * @param categoryKey - The category identifier (e.g., 'number-operations')
 * @param grade - The student's grade level (3-8)
 * @returns Array of database question type keys available for that grade and category
 *
 * @example
 * ```typescript
 * // Grade 3 only has basic operations
 * getQuestionTypesForCategoryAndGrade('number-operations', 3);
 * // Returns: ['ADDITION', 'SUBTRACTION', 'MULTIPLICATION', 'DIVISION']
 *
 * // Grade 8 has more advanced types
 * getQuestionTypesForCategoryAndGrade('number-operations', 8);
 * // Returns: ['PRIME_COMPOSITE_NUMBERS', 'NEGATIVE_NUMBERS', 'FRACTION_DECIMAL_PERCENTAGE']
 *
 * // Financial literacy only available at grade 8
 * getQuestionTypesForCategoryAndGrade('financial-literacy', 5);
 * // Returns: []
 *
 * getQuestionTypesForCategoryAndGrade('financial-literacy', 8);
 * // Returns: ['FINANCIAL_LITERACY']
 * ```
 *
 * @remarks
 * - Returns empty array if category not available for that grade
 * - Combines GRADE_TOPICS (what exists per grade) with QUESTION_TYPE_TO_CATEGORY (categorization)
 * - Use this function instead of getQuestionTypesForCategory() when grade context is known
 */
export function getQuestionTypesForCategoryAndGrade(categoryKey: string, grade: number): string[] {
  // Get all question types available for this grade
  const gradeTopics = GRADE_TOPICS[grade];
  if (!gradeTopics || !gradeTopics['mathematics']) {
    return [];
  }

  const availableTypesForGrade = gradeTopics['mathematics'];

  // Filter to only types that match the category AND are available for this grade
  return availableTypesForGrade.filter((type) => {
    return QUESTION_TYPE_TO_CATEGORY[type] === categoryKey;
  });
}

/**
 * Transform database question type to user-friendly display name.
 *
 * Converts internal database identifiers (e.g., 'ALGEBRAIC_MANIPULATION', 'FRACTION_DECIMAL_PERCENTAGE')
 * into human-readable names suitable for display in the UI.
 *
 * @param dbType - The database question type identifier
 * @returns User-friendly display name, or the original dbType if no mapping exists
 *
 * @example
 * ```typescript
 * getDisplayNameForQuestionType('ADDITION');
 * // Returns: 'Addition'
 *
 * getDisplayNameForQuestionType('ALGEBRAIC_MANIPULATION');
 * // Returns: 'Algebraic Expressions'
 *
 * getDisplayNameForQuestionType('FRACTION_DECIMAL_PERCENTAGE');
 * // Returns: 'Fractions, Decimals & Percentages'
 *
 * getDisplayNameForQuestionType('UNMAPPED_NEW_TYPE');
 * // Returns: 'UNMAPPED_NEW_TYPE' (fallback to original)
 * ```
 *
 * @remarks
 * Falls back to returning the original dbType for unmapped values, ensuring the UI
 * always has something to display even for new question types not yet in the mapping.
 */
export function getDisplayNameForQuestionType(dbType: string): string {
  return QUESTION_TYPE_DISPLAY_NAMES[dbType] || dbType;
}

/**
 * Get database question type from user-friendly display name (reverse lookup).
 *
 * Performs reverse mapping from display names shown in the UI back to database identifiers.
 * Useful when processing user selections or form submissions that use display names.
 *
 * @param displayName - The user-friendly display name
 * @returns Database question type identifier, or null if no matching mapping found
 *
 * @example
 * ```typescript
 * getQuestionTypeFromDisplayName('Addition');
 * // Returns: 'ADDITION'
 *
 * getQuestionTypeFromDisplayName('Algebraic Expressions');
 * // Returns: 'ALGEBRAIC_MANIPULATION'
 *
 * getQuestionTypeFromDisplayName('Fractions, Decimals & Percentages');
 * // Returns: 'FRACTION_DECIMAL_PERCENTAGE'
 *
 * getQuestionTypeFromDisplayName('Unknown Name');
 * // Returns: null
 * ```
 *
 * @remarks
 * - Returns null for unmatched names to allow calling code to detect invalid selections
 * - Case-sensitive matching - ensure display names match exactly
 * - O(n) lookup performance - consider caching if called frequently
 */
export function getQuestionTypeFromDisplayName(displayName: string): string | null {
  const entry = Object.entries(QUESTION_TYPE_DISPLAY_NAMES).find(
    ([_, display]) => display === displayName
  );
  return entry ? entry[0] : null;
}
