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
    mathematics: [
      'ADDITION',
      'SUBTRACTION',
      'MULTIPLICATION',
      'DIVISION',
      'PATTERN_RECOGNITION',
      'SHAPE_PROPERTIES',
    ],
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
      'MEASUREMENT_MASTERY',
    ],
  },
  5: {
    mathematics: [
      'MULTIPLICATION',
      'DIVISION',
      'ADVANCED_ARITHMETIC',
      'DECIMAL_OPERATIONS',
      'FRACTION_OPERATIONS',
      'RATIO_PROPORTION',
      'ALGEBRAIC_THINKING',
      'PATTERN_RECOGNITION',
      'AREA_VOLUME_CALCULATIONS',
      'COORDINATE_GEOMETRY',
      'MEASUREMENT_MASTERY',
      'TIME_CALCULATIONS',
      'DATA_ANALYSIS',
      'PROBABILITY_BASICS',
      'SHAPE_PROPERTIES',
      'REAL_WORLD_APPLICATIONS',
    ],
  },
  6: {
    mathematics: [
      'LARGE_NUMBER_OPERATIONS',
      'ADVANCED_FRACTIONS_DECIMALS',
      'FRACTION_DECIMAL_PERCENTAGE',
      'ALGEBRAIC_EQUATIONS',
      'ALGEBRAIC_THINKING',
      'ADVANCED_PATTERNS',
      'NUMBER_PATTERNS',
      'PERIMETER_AREA_VOLUME',
      'COORDINATE_GEOMETRY',
      'TRANSFORMATIONS_SYMMETRY',
      'MEASUREMENT_MASTERY',
      'UNIT_CONVERSIONS',
      'DATA_ANALYSIS',
      'PROBABILITY_BASICS',
      'RATIO_PROPORTION',
      'SIMPLE_RATIOS',
      'ADVANCED_PROBLEM_SOLVING',
      'MATHEMATICAL_REASONING',
      'REAL_WORLD_APPLICATIONS',
      'TIME_CALCULATIONS',
      'SHAPE_PROPERTIES',
      'ADVANCED_ARITHMETIC',
    ],
  },
  7: {
    mathematics: [
      'ADVANCED_NUMBER_OPERATIONS',
      'NEGATIVE_NUMBERS',
      'FRACTION_DECIMAL_MASTERY',
      'ADVANCED_FRACTIONS_DECIMALS',
      'ALGEBRAIC_FOUNDATIONS',
      'ALGEBRAIC_EQUATIONS',
      'NUMBER_PATTERNS',
      'ADVANCED_PATTERNS',
      'PERIMETER_AREA_VOLUME',
      'GEOMETRY_SPATIAL_REASONING',
      'COORDINATE_GEOMETRY',
      'TRANSFORMATIONS_SYMMETRY',
      'MULTI_UNIT_CONVERSIONS',
      'UNIT_CONVERSIONS',
      'DATA_ANALYSIS_PROBABILITY',
      'DATA_ANALYSIS',
      'PROBABILITY_BASICS',
      'RATIO_PROPORTION',
      'EQUIVALENT_RATIOS',
      'UNIT_RATES',
      'SPEED_CALCULATIONS',
      'ADVANCED_PROBLEM_SOLVING',
      'MATHEMATICAL_REASONING',
      'REAL_WORLD_APPLICATIONS',
    ],
  },
  8: {
    mathematics: [
      'PRIME_COMPOSITE_NUMBERS',
      'NEGATIVE_NUMBERS',
      'LARGE_NUMBER_OPERATIONS',
      'FRACTION_DECIMAL_PERCENTAGE',
      'ADVANCED_FRACTIONS_DECIMALS',
      'FINANCIAL_LITERACY',
      'NUMBER_PATTERNS',
      'LINEAR_EQUATIONS',
      'ALGEBRAIC_MANIPULATION',
      'ALGEBRAIC_FOUNDATIONS',
      'ALGEBRAIC_EQUATIONS',
      'PERIMETER_AREA_VOLUME',
      'COORDINATE_GEOMETRY',
      'GEOMETRY_SPATIAL_REASONING',
      'TRANSFORMATIONS_SYMMETRY',
      'MULTI_UNIT_CONVERSIONS',
      'UNIT_CONVERSIONS',
      'TIME_CALCULATIONS',
      'SPEED_CALCULATIONS',
      'AVERAGE_SPEED',
      'DISTANCE_CALCULATIONS',
      'MULTI_STAGE_JOURNEYS',
      'UNIT_CONVERSIONS_MOTION',
      'DATA_ANALYSIS_PROBABILITY',
      'DATA_ANALYSIS',
      'RATIO_PROPORTION',
      'RATIO_SIMPLIFICATION',
      'SCALE_FACTORS',
      'ADVANCED_PROBLEM_SOLVING',
      'MATHEMATICAL_REASONING',
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
 */
export const QUESTION_TYPE_DISPLAY_NAMES: Record<string, string> = {
  // Number Operations & Arithmetic
  ADDITION: 'Addition',
  SUBTRACTION: 'Subtraction',
  MULTIPLICATION: 'Multiplication',
  DIVISION: 'Division',
  DECIMAL_BASICS: 'Decimals (Basic)',
  DECIMAL_OPERATIONS: 'Decimal Operations',
  FRACTION_BASICS: 'Fractions (Basic)',
  FRACTION_OPERATIONS: 'Fraction Operations',
  FRACTION_DECIMAL_PERCENTAGE: 'Fractions, Decimals & Percentages',
  FRACTION_DECIMAL_MASTERY: 'Fraction & Decimal Mastery',
  ADVANCED_FRACTIONS_DECIMALS: 'Advanced Fractions & Decimals',
  PLACE_VALUE: 'Place Value',
  LARGE_NUMBER_OPERATIONS: 'Large Numbers',
  NEGATIVE_NUMBERS: 'Negative Numbers',
  PRIME_COMPOSITE_NUMBERS: 'Prime & Composite Numbers',
  ADVANCED_ARITHMETIC: 'Advanced Arithmetic',
  ADVANCED_NUMBER_OPERATIONS: 'Advanced Number Operations',

  // Algebra & Patterns
  PATTERN_RECOGNITION: 'Pattern Recognition',
  NUMBER_PATTERNS: 'Number Patterns',
  ADVANCED_PATTERNS: 'Advanced Patterns',
  ALGEBRAIC_THINKING: 'Algebraic Thinking',
  ALGEBRAIC_EQUATIONS: 'Algebraic Equations',
  ALGEBRAIC_FOUNDATIONS: 'Algebraic Foundations',
  ALGEBRAIC_MANIPULATION: 'Algebraic Expressions',
  LINEAR_EQUATIONS: 'Linear Equations',

  // Geometry & Measurement
  SHAPE_PROPERTIES: 'Shape Properties',
  AREA_VOLUME_CALCULATIONS: 'Area & Volume',
  PERIMETER_AREA_VOLUME: 'Perimeter, Area & Volume',
  COORDINATE_GEOMETRY: 'Coordinate Geometry',
  GEOMETRY_SPATIAL_REASONING: 'Spatial Reasoning',
  TRANSFORMATIONS_SYMMETRY: 'Transformations & Symmetry',
  MEASUREMENT_MASTERY: 'Measurement Mastery',
  UNIT_CONVERSIONS: 'Unit Conversions',
  MULTI_UNIT_CONVERSIONS: 'Multi-Unit Conversions',
  TIME_MEASUREMENT: 'Time Measurement',
  TIME_CALCULATIONS: 'Time Calculations',

  // Statistics & Probability
  DATA_ANALYSIS: 'Data Analysis',
  DATA_ANALYSIS_PROBABILITY: 'Data Analysis & Probability',
  PROBABILITY_BASICS: 'Probability Basics',

  // Ratios, Rates & Proportions
  RATIO_PROPORTION: 'Ratios & Proportions',
  SIMPLE_RATIOS: 'Simple Ratios',
  EQUIVALENT_RATIOS: 'Equivalent Ratios',
  RATIO_SIMPLIFICATION: 'Ratio Simplification',
  PROPORTIONS: 'Proportions',
  SCALE_FACTORS: 'Scale Factors',
  UNIT_RATES: 'Unit Rates',

  // Motion & Distance
  SPEED_CALCULATIONS: 'Speed Calculations',
  AVERAGE_SPEED: 'Average Speed',
  DISTANCE_CALCULATIONS: 'Distance Calculations',
  MULTI_STAGE_JOURNEYS: 'Multi-Stage Journeys',
  UNIT_CONVERSIONS_MOTION: 'Unit Conversions (Motion)',

  // Financial Literacy
  FINANCIAL_LITERACY: 'Money & Financial Literacy',

  // Problem Solving & Reasoning
  REAL_WORLD_APPLICATIONS: 'Real-World Math Problems',
  ADVANCED_PROBLEM_SOLVING: 'Problem Solving',
  MATHEMATICAL_REASONING: 'Mathematical Reasoning',
};

/**
 * Maps question types to their categories
 */
export const QUESTION_TYPE_TO_CATEGORY: Record<string, string> = {
  // Number Operations & Arithmetic
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

  // Algebra & Patterns
  PATTERN_RECOGNITION: 'algebra-patterns',
  NUMBER_PATTERNS: 'algebra-patterns',
  ADVANCED_PATTERNS: 'algebra-patterns',
  ALGEBRAIC_THINKING: 'algebra-patterns',
  ALGEBRAIC_EQUATIONS: 'algebra-patterns',
  ALGEBRAIC_FOUNDATIONS: 'algebra-patterns',
  ALGEBRAIC_MANIPULATION: 'algebra-patterns',
  LINEAR_EQUATIONS: 'algebra-patterns',

  // Geometry & Measurement
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
  TIME_CALCULATIONS: 'geometry-measurement',

  // Statistics & Probability
  DATA_ANALYSIS: 'statistics-probability',
  DATA_ANALYSIS_PROBABILITY: 'statistics-probability',
  PROBABILITY_BASICS: 'statistics-probability',

  // Ratios, Rates & Proportions
  RATIO_PROPORTION: 'ratios-rates-proportions',
  SIMPLE_RATIOS: 'ratios-rates-proportions',
  EQUIVALENT_RATIOS: 'ratios-rates-proportions',
  RATIO_SIMPLIFICATION: 'ratios-rates-proportions',
  PROPORTIONS: 'ratios-rates-proportions',
  SCALE_FACTORS: 'ratios-rates-proportions',
  UNIT_RATES: 'ratios-rates-proportions',

  // Motion & Distance
  SPEED_CALCULATIONS: 'motion-distance',
  AVERAGE_SPEED: 'motion-distance',
  DISTANCE_CALCULATIONS: 'motion-distance',
  MULTI_STAGE_JOURNEYS: 'motion-distance',
  UNIT_CONVERSIONS_MOTION: 'motion-distance',

  // Financial Literacy
  FINANCIAL_LITERACY: 'financial-literacy',

  // Problem Solving & Reasoning
  REAL_WORLD_APPLICATIONS: 'problem-solving-reasoning',
  ADVANCED_PROBLEM_SOLVING: 'problem-solving-reasoning',
  MATHEMATICAL_REASONING: 'problem-solving-reasoning',
};

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
