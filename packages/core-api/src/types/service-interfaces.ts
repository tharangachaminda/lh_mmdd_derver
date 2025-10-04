/**
 * Service Integration Types and Interfaces
 *
 * Type definitions for educational content generation services,
 * vector database integration, and API responses.
 *
 * @fileoverview Service integration type definitions
 * @version 2.0.0 - Refactored and optimized
 */

// === CORE EDUCATIONAL TYPES ===

/**
 * Temporary local types (will be replaced by @learning-hub/shared)
 */
export enum Subject {
    MATHEMATICS = "mathematics",
    SCIENCE = "science",
    ENGLISH = "english",
    SOCIAL_STUDIES = "social_studies",
}

export enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
}

export enum QuestionFormat {
    MULTIPLE_CHOICE = "multiple_choice",
    CALCULATION = "calculation",
    WORD_PROBLEM = "word_problem",
}

/**
 * Mathematics-specific question types
 */
export enum MathematicsQuestionType {
    ADDITION = "addition",
    SUBTRACTION = "subtraction",
    MULTIPLICATION = "multiplication",
    DIVISION = "division",
    FRACTIONS = "fractions",
    ALGEBRA = "algebra",
}

/**
 * Basic educational question interface
 */
export interface EducationalQuestion {
    id: string;
    subject: Subject;
    grade: number;
    title: string;
    question: string;
    answer: string | string[];
    explanation: string;
    difficulty: DifficultyLevel;
    format: QuestionFormat;
    topic: string;
    subtopic?: string;
    framework?: string;
    createdAt: Date;
    updatedAt: Date;
    metadata?: any;
    subjectSpecific?: any;
}

// === SERVICE BRIDGE INTERFACES ===

/**
 * Mathematics service bridge interface for multi-service integration
 */
export interface MathematicsServiceBridge {
    generateQuestion(
        params: MathematicsGenerationParams
    ): Promise<MathematicsQuestionResult>;
    generateMultipleQuestions(
        params: MathematicsGenerationParams & { count: number }
    ): Promise<MathematicsQuestionResult[]>;
}

/**
 * Parameters for mathematics question generation
 */
export interface MathematicsGenerationParams {
    questionType: string;
    difficulty: string;
    grade: number;
    context?: string;
    topic: string;
}

/**
 * Enhanced vector database retrieval metrics with relevance scoring
 */
export interface VectorRetrievalMetrics {
    totalRetrieved: number;
    aboveThreshold: number;
    relevanceThreshold: number;
    retrievalTime: number;
    contextSources?: string[];
}

/**
 * Comprehensive vector context with relevance analytics
 */
export interface VectorContext {
    used: boolean;
    similarQuestionsFound: number;
    curriculumAlignment: boolean;
    averageRelevanceScore?: number;
    topRelevanceScore?: number;
    retrievalMetrics?: VectorRetrievalMetrics;
}

/**
 * Result from mathematics question generation service
 */
export interface MathematicsQuestionResult {
    id: string;
    question: string;
    answer: string | number;
    explanation?: string;
    metadata: {
        generationTime: number;
        serviceUsed: string;
        qualityScore: number;
        relevanceScore?: number;
        vectorContext?: VectorContext;
        workflowData?: any;
    };
}

// === API REQUEST/RESPONSE INTERFACES ===

/**
 * Educational content generation request
 */
export interface ContentGenerationRequest {
    subject: Subject;
    grade: number;
    topic: string;
    subtopic?: string;
    difficulty: DifficultyLevel;
    format: QuestionFormat;
    count?: number;
    context?: string;
    curriculum?: string;
}

/**
 * Service integration metadata for API responses
 */
export interface ServiceIntegrationMetadata {
    serviceUsed?: string;
    servicesUsed?: string[];
    totalQuestions?: number;
    averageGenerationTime?: number;
    averageRelevanceScore?: number;
    originalMetadata?: any;
}

/**
 * Enhanced API response metadata with comprehensive analytics
 */
export interface ResponseMetadata {
    generationTime: number;
    qualityScore: number;
    curriculumAlignment: boolean;
    relevanceScore?: number;
    vectorContext?: VectorContext;
    serviceIntegration?: ServiceIntegrationMetadata;
    fallbackUsed?: boolean;
    originalError?: string;
}

/**
 * Educational content generation response
 */
export interface ContentGenerationResponse {
    success: boolean;
    data?: any; // EducationalQuestion | EducationalQuestion[] - will use actual type when available
    metadata?: ResponseMetadata;
    error?: string;
}

// === VECTOR DATABASE SIMULATION ===

/**
 * Vector database retrieval simulation result
 */
export interface VectorRetrievalResult {
    totalRetrieved: number;
    aboveThreshold: number;
    averageRelevanceScore: number;
    topRelevanceScore: number;
    retrievalTime: number;
    contextSources: string[];
}

// === VALIDATION INTERFACES ===

/**
 * Content request validation result
 */
export interface ValidationResult {
    isValid: boolean;
    data?: ContentGenerationRequest;
    error?: string;
}

// === SERVICE CONFIGURATION ===

/**
 * Batch Generation Request Interface
 */
export interface BatchGenerationRequest {
    subject: string;
    topic: string;
    difficulty: string;
    format: string;
    count: number;
    enhanceWithVectorDB?: boolean;
    grade?: number;
    context?: string;
}

/**
 * Batch Generation Response Interface
 */
export interface BatchGenerationResponse {
    success: boolean;
    questions: MathematicsQuestionResult[];
    metadata: {
        totalGenerated: number;
        averageQualityScore: number;
        averageRelevanceScore: number;
        averageGenerationTime: number;
        servicesUsed: string[];
        vectorContext: VectorContext;
    };
    error?: string;
}

/**
 * Service Configuration Constants
 */
export const SERVICE_CONFIG = {
    RELEVANCE_THRESHOLD: 0.7,
    MAX_RETRIEVAL_COUNT: 10,
    MIN_RETRIEVAL_COUNT: 3,
    DEFAULT_QUALITY_SCORE: {
        AGENTIC: 0.92,
        DETERMINISTIC: 0.78,
        BASIC: 0.6,
        EMERGENCY: 0.1,
    },
    TIMEOUT: {
        AGENTIC_SERVICE: 5000,
        DETERMINISTIC_SERVICE: 3000,
        BASIC_GENERATION: 1000,
    },
} as const;

/**
 * Topic to question type mapping
 */
export const TOPIC_MAPPING: Record<string, string> = {
    addition: "ADDITION",
    subtraction: "SUBTRACTION",
    multiplication: "MULTIPLICATION",
    division: "DIVISION",
    fractions: "FRACTIONS",
    decimals: "DECIMALS",
    geometry: "GEOMETRY",
    algebra: "ALGEBRA",
    measurement: "MEASUREMENT",
    data: "DATA_ANALYSIS",
} as const;

/**
 * Difficulty level mapping
 */
export const DIFFICULTY_MAPPING: Record<DifficultyLevel, string> = {
    [DifficultyLevel.EASY]: "easy",
    [DifficultyLevel.MEDIUM]: "medium",
    [DifficultyLevel.HARD]: "hard",
} as const;
