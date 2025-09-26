import { QuestionType, DifficultyLevel } from "./question.js";

/**
 * Represents a sample question in the curriculum
 */
export interface SampleQuestion {
    /** Unique identifier for the sample question */
    id: string;
    /** The actual question text */
    question: string;
    /** The correct answer (can be numeric or string for fractions/word problems) */
    answer: number | string;
    /** Detailed explanation of how to solve the question */
    explanation: string;
    /** The type of mathematical operation or concept being tested */
    type: QuestionType;
    /** Keywords relevant to this question for better search */
    keywords?: string[];
    /** Vector embedding of the question for similarity search */
    embedding?: number[];
}

/**
 * Represents a mathematical concept within the curriculum
 */
export interface MathConcept {
    /** Unique identifier for the concept */
    id: string;
    /** The name of the mathematical concept */
    name: string;
    /** Detailed description of the concept */
    description: string;
    /** Keywords associated with this concept */
    keywords: string[];
    /** Vector embedding of the concept for similarity search */
    embedding?: number[];
}

/**
 * Main curriculum content structure
 */
export interface CurriculumContent {
    /** Unique identifier for the curriculum content */
    id: string;
    /** Grade level (1-6 for elementary) */
    grade: number;
    /** Subject (Mathematics) */
    subject: string;
    /** Main topic (e.g., "Fractions", "Addition", etc.) */
    topic: string;
    /** Optional subtopic for more specific categorization */
    subtopic?: string;
    /** The specific concept being covered */
    concept: MathConcept;
    /** Difficulty level of the content */
    difficulty: DifficultyLevel;
    /** Types of questions that can be generated for this content */
    questionTypes: QuestionType[];
    /** Sample questions for this curriculum content */
    sampleQuestions: SampleQuestion[];
    /** Prerequisites needed to understand this content */
    prerequisites?: string[];
    /** Learning objectives for this content */
    learningObjectives: string[];
    /** Common mistakes or misconceptions */
    commonMistakes?: string[];
    /** Creation timestamp */
    createdAt: Date;
    /** Last update timestamp */
    updatedAt: Date;
    /** Version number for tracking updates */
    version: number;
}

/**
 * Interface for curriculum search options
 */
export interface CurriculumSearchOptions {
    /** Grade level to filter by */
    grade?: number;
    /** Topic to filter by */
    topic?: string;
    /** Difficulty level to filter by */
    difficulty?: DifficultyLevel;
    /** Question type to filter by */
    questionType?: QuestionType;
    /** Number of similar results to return */
    limit?: number;
    /** Minimum similarity score threshold */
    minScore?: number;
}

/**
 * Result from a curriculum search operation
 */
export interface CurriculumSearchResult {
    /** The matching curriculum content */
    content: CurriculumContent;
    /** Similarity score (0-1) */
    score: number;
    /** Distance metric used in vector search */
    distance?: number;
}

/**
 * Statistics about the curriculum database
 */
export interface CurriculumStats {
    /** Total number of curriculum entries */
    totalEntries: number;
    /** Number of entries per grade */
    entriesPerGrade: Record<number, number>;
    /** Number of entries per topic */
    entriesPerTopic: Record<string, number>;
    /** Number of sample questions */
    totalSampleQuestions: number;
    /** Last update timestamp */
    lastUpdated: Date;
    /** Current database version */
    version: number;
}

/**
 * Validation result for curriculum data
 */
export interface CurriculumValidationResult {
    /** Whether the data is valid */
    isValid: boolean;
    /** Any validation errors found */
    errors: string[];
    /** Warnings about potential issues */
    warnings: string[];
}
