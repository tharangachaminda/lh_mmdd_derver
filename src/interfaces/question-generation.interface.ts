/**
 * @fileoverview Enhanced Question Generation Interfaces
 * @module interfaces/question-generation
 * @description Comprehensive interfaces and enums for the unified question generation system.
 * Supports multi-type selection, category-based taxonomy, and persona-driven AI personalization.
 *
 * @version 2.0.0
 * @since Session 08 - Phase A1
 * @author MMDD-TDD Development Process
 *
 * **Key Features:**
 * - Multi-type question selection (1-5 types per request)
 * - Educational taxonomy integration (8 categories)
 * - Four question formats (multiple choice, short answer, true/false, fill-in-blank)
 * - Complete persona fields (learning style, interests, motivators)
 * - Comprehensive validation with detailed error messages
 * - Backward compatibility with legacy interfaces
 *
 * **Migration from Legacy Interface:**
 * - `questionType: string` → `questionTypes: string[]` (array support)
 * - Added `category: string` (new taxonomy)
 * - Added `questionFormat: QuestionFormat` enum
 * - Added `interests: string[]` (1-5 selections)
 * - Added `motivators: string[]` (0-3 selections)
 * - `difficulty` → `difficultyLevel` (consistency)
 * - `count` → `numberOfQuestions` (clarity)
 *
 * @see {@link EnhancedQuestionGenerationRequest} Main interface
 * @see {@link validateEnhancedRequest} Validation function
 * @see {@link ValidationConstraints} Constraint definitions
 */

import { IStudentPersona } from "../models/persona.model.js";

/**
 * Question format options for generated questions.
 * Determines the structure and answer method for questions.
 *
 * @enum {string}
 * @readonly
 *
 * @example
 * ```typescript
 * const format = QuestionFormat.MULTIPLE_CHOICE;
 * // Generates: "What is 5 + 3? A) 6  B) 7  C) 8  D) 9"
 * ```
 */
export enum QuestionFormat {
    /** Multiple choice with 4 options (A, B, C, D) */
    MULTIPLE_CHOICE = "multiple_choice",

    /** Open-ended short answer (typed response) */
    SHORT_ANSWER = "short_answer",

    /** True or False binary choice */
    TRUE_FALSE = "true_false",

    /** Fill in the blank with correct word/number */
    FILL_IN_BLANK = "fill_in_blank",
}

/**
 * Difficulty level options for question generation.
 * Affects complexity, vocabulary, and cognitive load.
 *
 * @enum {string}
 * @readonly
 *
 * @example
 * ```typescript
 * const difficulty = DifficultyLevel.MEDIUM;
 * // EASY: 2 + 3 = ?
 * // MEDIUM: 15 + 27 = ?
 * // HARD: 156 + 289 = ?
 * ```
 */
export enum DifficultyLevel {
    /** Beginner level - simple concepts, small numbers */
    EASY = "easy",

    /** Intermediate level - moderate complexity */
    MEDIUM = "medium",

    /** Advanced level - challenging problems, multi-step */
    HARD = "hard",
}

/**
 * Learning style preferences based on VARK model.
 * Affects how questions are presented and explained.
 *
 * @enum {string}
 * @readonly
 *
 * @see {@link https://vark-learn.com/} VARK Learning Styles
 *
 * @example
 * ```typescript
 * const style = LearningStyle.VISUAL;
 * // Visual: Includes diagrams, charts, color coding
 * // Auditory: Emphasis on verbal explanations
 * // Kinesthetic: Interactive, hands-on examples
 * // Reading/Writing: Text-based, detailed notes
 * ```
 */
export enum LearningStyle {
    /** Visual learners - prefer diagrams, charts, images */
    VISUAL = "visual",

    /** Auditory learners - prefer verbal explanations */
    AUDITORY = "auditory",

    /** Kinesthetic learners - prefer hands-on practice */
    KINESTHETIC = "kinesthetic",

    /** Reading/Writing learners - prefer text-based content */
    READING_WRITING = "reading_writing",
}

/**
 * Enhanced Question Generation Request Interface
 *
 * Primary interface for the unified question generator. Combines type selection,
 * question configuration, and persona fields into a single comprehensive request.
 *
 * **Purpose:**
 * - Supports 1-5 question types per generation request
 * - Integrates new educational taxonomy (8 categories)
 * - Enables AI personalization through interests and motivators
 * - Provides flexible question format options
 *
 * **Validation Rules:**
 * - questionTypes: 1-5 items required
 * - interests: 1-5 items required (from 17 options)
 * - motivators: 0-3 items optional (from 8 options)
 * - gradeLevel: 1-12 range
 * - numberOfQuestions: Must be one of [5, 10, 15, 20, 25, 30]
 *
 * @interface
 * @since 2.0.0
 *
 * @example Basic Usage
 * ```typescript
 * const request: EnhancedQuestionGenerationRequest = {
 *   subject: 'mathematics',
 *   category: 'number-operations',
 *   gradeLevel: 5,
 *   questionTypes: ['ADDITION', 'SUBTRACTION'],
 *   questionFormat: QuestionFormat.MULTIPLE_CHOICE,
 *   difficultyLevel: DifficultyLevel.MEDIUM,
 *   numberOfQuestions: 10,
 *   learningStyle: LearningStyle.VISUAL,
 *   interests: ['Sports', 'Gaming', 'Science'],
 *   motivators: ['Competition', 'Achievement']
 * };
 * ```
 *
 * @example With Optional Fields
 * ```typescript
 * const advancedRequest: EnhancedQuestionGenerationRequest = {
 *   ...request,
 *   focusAreas: ['Two-digit addition', 'Carrying'],
 *   includeExplanations: true
 * };
 * ```
 *
 * @example Validation
 * ```typescript
 * const validation = validateEnhancedRequest(request);
 * if (!validation.isValid) {
 *   console.error('Validation errors:', validation.errors);
 * }
 * ```
 */
export interface EnhancedQuestionGenerationRequest {
    // ==================== CONTEXT FROM NAVIGATION ====================

    /**
     * Subject area for questions
     * @type {string}
     * @example 'mathematics', 'science', 'english'
     */
    subject: string;

    /**
     * Category from new educational taxonomy
     * @type {string}
     * @see {@link ValidationConstraints.CATEGORIES} for valid options
     * @example 'number-operations', 'algebraic-thinking', 'geometry-spatial'
     */
    category: string;

    /**
     * Student's grade level (1-12)
     * @type {number}
     * @minimum 1
     * @maximum 12
     * @example 5
     */
    gradeLevel: number;

    // ==================== MULTI-TYPE SELECTION ====================

    /**
     * Array of question types to generate (1-5 types)
     * @type {string[]}
     * @minimum 1 item
     * @maximum 5 items
     * @example ['ADDITION', 'SUBTRACTION', 'WORD_PROBLEMS']
     */
    questionTypes: string[];

    // ==================== QUESTION CONFIGURATION ====================

    /**
     * Format of questions to generate
     * @type {QuestionFormat}
     * @default QuestionFormat.MULTIPLE_CHOICE
     * @see {@link QuestionFormat}
     */
    questionFormat: QuestionFormat;

    /**
     * Difficulty level for generated questions
     * @type {DifficultyLevel}
     * @default DifficultyLevel.MEDIUM
     * @see {@link DifficultyLevel}
     */
    difficultyLevel: DifficultyLevel;

    /**
     * Number of questions to generate
     * @type {number}
     * @enum {5|10|15|20|25|30}
     * @default 10
     * @see {@link ValidationConstraints.NUMBER_OF_QUESTIONS}
     */
    numberOfQuestions: number;

    // ==================== PERSONA FIELDS FOR AI PERSONALIZATION ====================

    /**
     * Student's preferred learning style (VARK model)
     * @type {LearningStyle}
     * @see {@link LearningStyle}
     * @example LearningStyle.VISUAL
     */
    learningStyle: LearningStyle;

    /**
     * Student interests for story personalization (1-5 selections)
     *
     * **Purpose:** AI uses these to create engaging, personalized question contexts
     *
     * @type {string[]}
     * @minimum 1 item
     * @maximum 5 items
     * @see {@link ValidationConstraints.INTERESTS.OPTIONS} for all 17 options
     *
     * @example
     * ```typescript
     * interests: ['Sports', 'Gaming', 'Science']
     * // AI generates: "Sarah scored 12 points in her basketball game (Sports)..."
     * ```
     */
    interests: string[];

    /**
     * Motivation factors for engagement (0-3 selections, optional but recommended)
     *
     * **Purpose:** AI aligns question style with student motivation patterns
     *
     * @type {string[]}
     * @minimum 0 items (optional)
     * @maximum 3 items
     * @see {@link ValidationConstraints.MOTIVATORS.OPTIONS} for all 8 options
     *
     * @example
     * ```typescript
     * motivators: ['Competition', 'Achievement']
     * // AI adds: "Beat your previous score!" or "Unlock the next level!"
     * ```
     */
    motivators: string[];

    // ==================== OPTIONAL ENHANCEMENT FIELDS ====================

    /**
     * Specific skills or topics to focus on (optional)
     * @type {string[]}
     * @optional
     * @example ['Two-digit addition', 'Carrying', 'Word problems']
     */
    focusAreas?: string[];

    /**
     * Whether to include step-by-step explanations (optional)
     * @type {boolean}
     * @optional
     * @default false
     * @example true
     */
    includeExplanations?: boolean;
}

/**
 * Legacy Question Generation Request Interface
 *
 * **DEPRECATED:** This interface is maintained for backward compatibility only.
 * New code should use {@link EnhancedQuestionGenerationRequest} instead.
 *
 * @deprecated since version 2.0.0 - Use {@link EnhancedQuestionGenerationRequest}
 * @interface
 *
 * @see {@link EnhancedQuestionGenerationRequest} for the current interface
 *
 * @example Migration Example
 * ```typescript
 * // OLD (deprecated):
 * const oldRequest: QuestionGenerationRequest = {
 *   subject: 'mathematics',
 *   topic: 'addition',
 *   difficulty: 'medium',
 *   questionType: 'ADDITION',
 *   count: 10,
 *   persona: studentPersona
 * };
 *
 * // NEW (recommended):
 * const newRequest: EnhancedQuestionGenerationRequest = {
 *   subject: 'mathematics',
 *   category: 'number-operations',
 *   gradeLevel: 5,
 *   questionTypes: ['ADDITION'],
 *   questionFormat: QuestionFormat.MULTIPLE_CHOICE,
 *   difficultyLevel: DifficultyLevel.MEDIUM,
 *   numberOfQuestions: 10,
 *   learningStyle: LearningStyle.VISUAL,
 *   interests: ['Sports'],
 *   motivators: ['Achievement']
 * };
 * ```
 */
export interface QuestionGenerationRequest {
    subject: string;
    topic: string;
    subtopic?: string;
    difficulty: string;
    questionType: string;
    count: number;
    persona: IStudentPersona;
    previousQuestions?: string[];
}

/**
 * Validation Constants for Enhanced Question Generation
 *
 * Defines all constraints, options, and limits for the enhanced request interface.
 * Use these constants for client-side validation and option lists.
 *
 * @constant
 * @readonly
 *
 * @example Validate Question Types Count
 * ```typescript
 * if (request.questionTypes.length < ValidationConstraints.QUESTION_TYPES.MIN) {
 *   throw new Error('At least 1 question type required');
 * }
 * ```
 *
 * @example Get All Interest Options
 * ```typescript
 * const interestDropdown = ValidationConstraints.INTERESTS.OPTIONS.map(opt => ({
 *   value: opt,
 *   label: opt
 * }));
 * ```
 */
export const ValidationConstraints = {
    QUESTION_TYPES: {
        MIN: 1,
        MAX: 5,
    },
    INTERESTS: {
        MIN: 1,
        MAX: 5,
        OPTIONS: [
            "Sports",
            "Technology",
            "Arts",
            "Music",
            "Nature",
            "Animals",
            "Space",
            "History",
            "Science",
            "Reading",
            "Gaming",
            "Cooking",
            "Travel",
            "Movies",
            "Fashion",
            "Cars",
            "Photography",
        ] as const,
    },
    MOTIVATORS: {
        MIN: 0, // Optional
        MAX: 3,
        OPTIONS: [
            "Competition",
            "Achievement",
            "Exploration",
            "Creativity",
            "Social Learning",
            "Personal Growth",
            "Problem Solving",
            "Recognition",
        ] as const,
    },
    NUMBER_OF_QUESTIONS: {
        OPTIONS: [5, 10, 15, 20, 25, 30] as const,
        DEFAULT: 10,
    },
    CATEGORIES: [
        "number-operations",
        "algebraic-thinking",
        "geometry-spatial",
        "measurement-data",
        "fractions-decimals",
        "problem-solving",
        "patterns-relationships",
        "financial-literacy",
    ] as const,
} as const;

/**
 * Validates an Enhanced Question Generation Request
 *
 * Performs comprehensive validation of all required and optional fields.
 * Checks data types, array constraints, and value ranges.
 *
 * **Validation Rules:**
 * - All required fields must be present
 * - questionTypes: 1-5 items
 * - interests: 1-5 items (at least 1 required)
 * - motivators: 0-3 items (optional)
 * - gradeLevel: 1-12 range
 * - Arrays cannot be empty when required
 *
 * @param {Partial<EnhancedQuestionGenerationRequest>} request - The request object to validate (can be partial for incremental validation)
 *
 * @returns {{isValid: boolean, errors: string[]}} Validation result object
 * @returns {boolean} returns.isValid - True if all validations pass, false otherwise
 * @returns {string[]} returns.errors - Array of human-readable error messages (empty if valid)
 *
 * @throws {never} Does not throw - returns validation result instead
 *
 * @example Basic Validation
 * ```typescript
 * const request: EnhancedQuestionGenerationRequest = {
 *   subject: 'mathematics',
 *   category: 'number-operations',
 *   gradeLevel: 5,
 *   questionTypes: ['ADDITION'],
 *   questionFormat: QuestionFormat.MULTIPLE_CHOICE,
 *   difficultyLevel: DifficultyLevel.MEDIUM,
 *   numberOfQuestions: 10,
 *   learningStyle: LearningStyle.VISUAL,
 *   interests: ['Sports'],
 *   motivators: ['Achievement']
 * };
 *
 * const validation = validateEnhancedRequest(request);
 * console.log(validation.isValid); // true
 * console.log(validation.errors);  // []
 * ```
 *
 * @example Handling Validation Errors
 * ```typescript
 * const invalidRequest = {
 *   questionTypes: [], // Empty array - invalid
 *   interests: ['A', 'B', 'C', 'D', 'E', 'F'] // Too many - invalid
 * };
 *
 * const validation = validateEnhancedRequest(invalidRequest);
 * if (!validation.isValid) {
 *   console.error('Validation failed:');
 *   validation.errors.forEach(error => console.error(`  - ${error}`));
 *   // Output:
 *   // - Subject is required
 *   // - At least one question type required
 *   // - Maximum 5 interests allowed
 * }
 * ```
 *
 * @example API Error Response
 * ```typescript
 * app.post('/api/questions/generate', (req, res) => {
 *   const validation = validateEnhancedRequest(req.body);
 *   if (!validation.isValid) {
 *     return res.status(400).json({
 *       error: 'Validation failed',
 *       details: validation.errors
 *     });
 *   }
 *   // Process valid request...
 * });
 * ```
 *
 * @since 2.0.0
 * @see {@link EnhancedQuestionGenerationRequest}
 * @see {@link ValidationConstraints}
 */
export function validateEnhancedRequest(
    request: Partial<EnhancedQuestionGenerationRequest>
): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required fields
    if (!request.subject) errors.push("Subject is required");
    if (!request.category) errors.push("Category is required");
    if (!request.gradeLevel) errors.push("Grade level is required");
    if (!request.questionTypes || request.questionTypes.length === 0) {
        errors.push("At least one question type is required");
    }
    if (!request.questionFormat) errors.push("Question format is required");
    if (!request.difficultyLevel) errors.push("Difficulty level is required");
    if (!request.numberOfQuestions)
        errors.push("Number of questions is required");
    if (!request.learningStyle) errors.push("Learning style is required");

    // Array constraints
    if (request.questionTypes) {
        if (
            request.questionTypes.length <
            ValidationConstraints.QUESTION_TYPES.MIN
        ) {
            errors.push(
                `Minimum ${ValidationConstraints.QUESTION_TYPES.MIN} question type required`
            );
        }
        if (
            request.questionTypes.length >
            ValidationConstraints.QUESTION_TYPES.MAX
        ) {
            errors.push(
                `Maximum ${ValidationConstraints.QUESTION_TYPES.MAX} question types allowed`
            );
        }
    }

    if (request.interests) {
        if (request.interests.length < ValidationConstraints.INTERESTS.MIN) {
            errors.push(
                `Minimum ${ValidationConstraints.INTERESTS.MIN} interest required`
            );
        }
        if (request.interests.length > ValidationConstraints.INTERESTS.MAX) {
            errors.push(
                `Maximum ${ValidationConstraints.INTERESTS.MAX} interests allowed`
            );
        }
    } else {
        errors.push("At least one interest is required");
    }

    if (
        request.motivators &&
        request.motivators.length > ValidationConstraints.MOTIVATORS.MAX
    ) {
        errors.push(
            `Maximum ${ValidationConstraints.MOTIVATORS.MAX} motivators allowed`
        );
    }

    // Grade level range
    if (
        request.gradeLevel &&
        (request.gradeLevel < 1 || request.gradeLevel > 12)
    ) {
        errors.push("Grade level must be between 1 and 12");
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

/**
 * Type Guard: Check if request is an Enhanced Question Generation Request
 *
 * TypeScript type guard function that narrows unknown request types to
 * EnhancedQuestionGenerationRequest. Useful for runtime type checking
 * when receiving requests from external sources (API, forms, etc.).
 *
 * **Checks performed:**
 * - Object type validation
 * - Required array fields exist (questionTypes, interests, motivators)
 * - Required string fields exist (category, questionFormat)
 *
 * **Note:** This is a shallow type check. For deep validation, use
 * {@link validateEnhancedRequest} instead.
 *
 * @param {any} request - The request object to check (can be any type)
 *
 * @returns {boolean} True if request matches EnhancedQuestionGenerationRequest structure
 *
 * @example Type Narrowing
 * ```typescript
 * function processRequest(request: unknown) {
 *   if (isEnhancedRequest(request)) {
 *     // TypeScript now knows request is EnhancedQuestionGenerationRequest
 *     console.log(`Generating ${request.numberOfQuestions} questions`);
 *     console.log(`Types: ${request.questionTypes.join(', ')}`);
 *   } else {
 *     console.error('Invalid request format');
 *   }
 * }
 * ```
 *
 * @example API Request Handling
 * ```typescript
 * app.post('/api/questions/generate', (req, res) => {
 *   if (!isEnhancedRequest(req.body)) {
 *     return res.status(400).json({
 *       error: 'Invalid request format',
 *       expected: 'EnhancedQuestionGenerationRequest'
 *     });
 *   }
 *
 *   // Now TypeScript knows req.body is EnhancedQuestionGenerationRequest
 *   const validation = validateEnhancedRequest(req.body);
 *   // ... continue processing
 * });
 * ```
 *
 * @example Combining with Validation
 * ```typescript
 * function safeProcessRequest(request: unknown): string[] | null {
 *   // First check structure
 *   if (!isEnhancedRequest(request)) {
 *     console.error('Wrong request type');
 *     return null;
 *   }
 *
 *   // Then validate values
 *   const validation = validateEnhancedRequest(request);
 *   if (!validation.isValid) {
 *     console.error('Validation failed:', validation.errors);
 *     return null;
 *   }
 *
 *   // Safe to process
 *   return generateQuestions(request);
 * }
 * ```
 *
 * @since 2.0.0
 * @see {@link EnhancedQuestionGenerationRequest}
 * @see {@link validateEnhancedRequest} for deep validation
 */
export function isEnhancedRequest(
    request: any
): request is EnhancedQuestionGenerationRequest {
    return (
        typeof request === "object" &&
        request !== null &&
        Array.isArray(request.questionTypes) &&
        typeof request.category === "string" &&
        typeof request.questionFormat === "string" &&
        Array.isArray(request.interests) &&
        Array.isArray(request.motivators)
    );
}
