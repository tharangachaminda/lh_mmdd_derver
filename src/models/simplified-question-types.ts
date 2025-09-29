import { z } from "zod";

/**
 * Main question types exposed to users - simplified API
 */
export enum MainQuestionType {
    ADDITION = "addition",
    SUBTRACTION = "subtraction",
    MULTIPLICATION = "multiplication",
    DIVISION = "division",
    PATTERN_RECOGNITION = "pattern_recognition",
}

/**
 * Internal question sub-types for specific generation and classification
 * These provide granular control for the AI generation system
 */
export enum QuestionSubType {
    // Addition sub-types
    BASIC_ADDITION = "basic_addition",
    WHOLE_NUMBER_ADDITION = "whole_number_addition",
    DECIMAL_ADDITION = "decimal_addition",
    FRACTION_ADDITION = "fraction_addition",
    WORD_PROBLEM_ADDITION = "word_problem_addition",

    // Subtraction sub-types
    BASIC_SUBTRACTION = "basic_subtraction",
    WHOLE_NUMBER_SUBTRACTION = "whole_number_subtraction",
    DECIMAL_SUBTRACTION = "decimal_subtraction",
    FRACTION_SUBTRACTION = "fraction_subtraction",
    WORD_PROBLEM_SUBTRACTION = "word_problem_subtraction",

    // Multiplication sub-types
    BASIC_MULTIPLICATION = "basic_multiplication",
    WHOLE_NUMBER_MULTIPLICATION = "whole_number_multiplication",
    DECIMAL_MULTIPLICATION = "decimal_multiplication",
    FRACTION_MULTIPLICATION = "fraction_multiplication",
    WORD_PROBLEM_MULTIPLICATION = "word_problem_multiplication",

    // Division sub-types
    BASIC_DIVISION = "basic_division",
    WHOLE_NUMBER_DIVISION = "whole_number_division",
    DIVISION_WITH_REMAINDERS = "division_with_remainders",
    LONG_DIVISION = "long_division",
    DECIMAL_DIVISION = "decimal_division",
    FRACTION_DIVISION = "fraction_division",
    WORD_PROBLEM_DIVISION = "word_problem_division",

    // Pattern Recognition sub-types
    NUMBER_PATTERN = "number_pattern",
    SEQUENCE_PATTERN = "sequence_pattern",
    SHAPE_PATTERN = "shape_pattern",
    FUNCTION_TABLE = "function_table",
    ALGEBRAIC_PATTERN = "algebraic_pattern",
}

/**
 * Mapping from main types to their available sub-types
 */
export const MAIN_TYPE_TO_SUBTYPES: Record<
    MainQuestionType,
    QuestionSubType[]
> = {
    [MainQuestionType.ADDITION]: [
        QuestionSubType.BASIC_ADDITION,
        QuestionSubType.WHOLE_NUMBER_ADDITION,
        QuestionSubType.DECIMAL_ADDITION,
        QuestionSubType.FRACTION_ADDITION,
        QuestionSubType.WORD_PROBLEM_ADDITION,
    ],
    [MainQuestionType.SUBTRACTION]: [
        QuestionSubType.BASIC_SUBTRACTION,
        QuestionSubType.WHOLE_NUMBER_SUBTRACTION,
        QuestionSubType.DECIMAL_SUBTRACTION,
        QuestionSubType.FRACTION_SUBTRACTION,
        QuestionSubType.WORD_PROBLEM_SUBTRACTION,
    ],
    [MainQuestionType.MULTIPLICATION]: [
        QuestionSubType.BASIC_MULTIPLICATION,
        QuestionSubType.WHOLE_NUMBER_MULTIPLICATION,
        QuestionSubType.DECIMAL_MULTIPLICATION,
        QuestionSubType.FRACTION_MULTIPLICATION,
        QuestionSubType.WORD_PROBLEM_MULTIPLICATION,
    ],
    [MainQuestionType.DIVISION]: [
        QuestionSubType.BASIC_DIVISION,
        QuestionSubType.WHOLE_NUMBER_DIVISION,
        QuestionSubType.DIVISION_WITH_REMAINDERS,
        QuestionSubType.LONG_DIVISION,
        QuestionSubType.DECIMAL_DIVISION,
        QuestionSubType.FRACTION_DIVISION,
        QuestionSubType.WORD_PROBLEM_DIVISION,
    ],
    [MainQuestionType.PATTERN_RECOGNITION]: [
        QuestionSubType.NUMBER_PATTERN,
        QuestionSubType.SEQUENCE_PATTERN,
        QuestionSubType.SHAPE_PATTERN,
        QuestionSubType.FUNCTION_TABLE,
        QuestionSubType.ALGEBRAIC_PATTERN,
    ],
};

/**
 * Grade-based sub-type recommendations
 */
export const GRADE_SUBTYPE_RECOMMENDATIONS: Record<
    number,
    Record<MainQuestionType, QuestionSubType[]>
> = {
    1: {
        [MainQuestionType.ADDITION]: [QuestionSubType.BASIC_ADDITION],
        [MainQuestionType.SUBTRACTION]: [QuestionSubType.BASIC_SUBTRACTION],
        [MainQuestionType.MULTIPLICATION]: [],
        [MainQuestionType.DIVISION]: [],
        [MainQuestionType.PATTERN_RECOGNITION]: [
            QuestionSubType.NUMBER_PATTERN,
            QuestionSubType.SHAPE_PATTERN,
        ],
    },
    2: {
        [MainQuestionType.ADDITION]: [
            QuestionSubType.BASIC_ADDITION,
            QuestionSubType.WHOLE_NUMBER_ADDITION,
        ],
        [MainQuestionType.SUBTRACTION]: [
            QuestionSubType.BASIC_SUBTRACTION,
            QuestionSubType.WHOLE_NUMBER_SUBTRACTION,
        ],
        [MainQuestionType.MULTIPLICATION]: [
            QuestionSubType.BASIC_MULTIPLICATION,
        ],
        [MainQuestionType.DIVISION]: [QuestionSubType.BASIC_DIVISION],
        [MainQuestionType.PATTERN_RECOGNITION]: [
            QuestionSubType.NUMBER_PATTERN,
            QuestionSubType.SEQUENCE_PATTERN,
        ],
    },
    3: {
        [MainQuestionType.ADDITION]: [
            QuestionSubType.BASIC_ADDITION,
            QuestionSubType.WHOLE_NUMBER_ADDITION,
            QuestionSubType.WORD_PROBLEM_ADDITION,
        ],
        [MainQuestionType.SUBTRACTION]: [
            QuestionSubType.BASIC_SUBTRACTION,
            QuestionSubType.WHOLE_NUMBER_SUBTRACTION,
            QuestionSubType.WORD_PROBLEM_SUBTRACTION,
        ],
        [MainQuestionType.MULTIPLICATION]: [
            QuestionSubType.BASIC_MULTIPLICATION,
            QuestionSubType.WHOLE_NUMBER_MULTIPLICATION,
        ],
        [MainQuestionType.DIVISION]: [
            QuestionSubType.BASIC_DIVISION,
            QuestionSubType.DIVISION_WITH_REMAINDERS,
        ],
        [MainQuestionType.PATTERN_RECOGNITION]: [
            QuestionSubType.NUMBER_PATTERN,
            QuestionSubType.SEQUENCE_PATTERN,
            QuestionSubType.FUNCTION_TABLE,
        ],
    },
    4: {
        [MainQuestionType.ADDITION]: [
            QuestionSubType.WHOLE_NUMBER_ADDITION,
            QuestionSubType.DECIMAL_ADDITION,
            QuestionSubType.WORD_PROBLEM_ADDITION,
        ],
        [MainQuestionType.SUBTRACTION]: [
            QuestionSubType.WHOLE_NUMBER_SUBTRACTION,
            QuestionSubType.DECIMAL_SUBTRACTION,
            QuestionSubType.WORD_PROBLEM_SUBTRACTION,
        ],
        [MainQuestionType.MULTIPLICATION]: [
            QuestionSubType.WHOLE_NUMBER_MULTIPLICATION,
            QuestionSubType.DECIMAL_MULTIPLICATION,
            QuestionSubType.WORD_PROBLEM_MULTIPLICATION,
        ],
        [MainQuestionType.DIVISION]: [
            QuestionSubType.DIVISION_WITH_REMAINDERS,
            QuestionSubType.LONG_DIVISION,
            QuestionSubType.DECIMAL_DIVISION,
        ],
        [MainQuestionType.PATTERN_RECOGNITION]: [
            QuestionSubType.NUMBER_PATTERN,
            QuestionSubType.SEQUENCE_PATTERN,
            QuestionSubType.FUNCTION_TABLE,
        ],
    },
    5: {
        [MainQuestionType.ADDITION]: [
            QuestionSubType.DECIMAL_ADDITION,
            QuestionSubType.FRACTION_ADDITION,
            QuestionSubType.WORD_PROBLEM_ADDITION,
        ],
        [MainQuestionType.SUBTRACTION]: [
            QuestionSubType.DECIMAL_SUBTRACTION,
            QuestionSubType.FRACTION_SUBTRACTION,
            QuestionSubType.WORD_PROBLEM_SUBTRACTION,
        ],
        [MainQuestionType.MULTIPLICATION]: [
            QuestionSubType.DECIMAL_MULTIPLICATION,
            QuestionSubType.FRACTION_MULTIPLICATION,
            QuestionSubType.WORD_PROBLEM_MULTIPLICATION,
        ],
        [MainQuestionType.DIVISION]: [
            QuestionSubType.LONG_DIVISION,
            QuestionSubType.DECIMAL_DIVISION,
            QuestionSubType.FRACTION_DIVISION,
            QuestionSubType.WORD_PROBLEM_DIVISION,
        ],
        [MainQuestionType.PATTERN_RECOGNITION]: [
            QuestionSubType.SEQUENCE_PATTERN,
            QuestionSubType.FUNCTION_TABLE,
            QuestionSubType.ALGEBRAIC_PATTERN,
        ],
    },
};

/**
 * Zod schemas for structured AI output validation
 */

// Basic question schema for AI output
export const QuestionOutputSchema = z.object({
    question: z.string().min(10, "Question must be at least 10 characters"),
    answer: z.union([z.number(), z.string()]).describe("The correct answer"),
    explanation: z
        .string()
        .optional()
        .describe("Optional explanation of the solution"),
    workingSteps: z
        .array(z.string())
        .optional()
        .describe("Step-by-step solution"),
    subType: z
        .nativeEnum(QuestionSubType)
        .describe("The specific sub-type of question"),
    difficulty: z
        .enum(["easy", "medium", "hard"])
        .describe("Assessed difficulty level"),
    grade: z.number().min(1).max(12).describe("Target grade level"),
    context: z.string().optional().describe("Real-world context or scenario"),
});

// Multiple questions output schema
export const MultipleQuestionsOutputSchema = z.object({
    questions: z.array(QuestionOutputSchema),
    metadata: z.object({
        totalQuestions: z.number(),
        mainType: z.nativeEnum(MainQuestionType),
        subTypesUsed: z.array(z.nativeEnum(QuestionSubType)),
        difficultyDistribution: z.record(z.string(), z.number()).optional(),
        generationTime: z.number().optional(),
    }),
});

// Question generation request schema (user input)
export const QuestionGenerationRequestSchema = z.object({
    types: z
        .array(z.nativeEnum(MainQuestionType))
        .min(1, "At least one question type required"),
    grade: z.number().min(1).max(12),
    difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
    count: z.number().min(1).max(10).optional().default(1),
    includeWordProblems: z.boolean().optional().default(false),
    includeDecimals: z.boolean().optional().default(false),
    includeFractions: z.boolean().optional().default(false),
    context: z
        .string()
        .optional()
        .describe("Preferred context or theme for questions"),
});

/**
 * Legacy question type enum (for backward compatibility)
 * @deprecated Use MainQuestionType and QuestionSubType instead
 */
export enum QuestionType {
    // Main types (mapped to new system)
    ADDITION = "addition",
    SUBTRACTION = "subtraction",
    MULTIPLICATION = "multiplication",
    DIVISION = "division",
    PATTERN = "pattern_recognition",

    // Legacy specific types (still supported but discouraged)
    WHOLE_NUMBER_ADDITION = "whole_number_addition",
    WHOLE_NUMBER_SUBTRACTION = "whole_number_subtraction",
    WHOLE_NUMBER_MULTIPLICATION = "whole_number_multiplication",
    WHOLE_NUMBER_DIVISION = "whole_number_division",
    DIVISION_WITH_REMAINDERS = "division_with_remainders",
    LONG_DIVISION = "long_division",
    DECIMAL_ADDITION = "decimal_addition",
    DECIMAL_SUBTRACTION = "decimal_subtraction",
    DECIMAL_MULTIPLICATION = "decimal_multiplication",
    DECIMAL_DIVISION = "decimal_division",
    FRACTION_ADDITION = "fraction_addition",
    FRACTION_SUBTRACTION = "fraction_subtraction",
    FRACTION_MULTIPLICATION = "fraction_multiplication",
    FRACTION_DIVISION = "fraction_division",
    WORD_PROBLEM_ADDITION = "word_problem_addition",
    WORD_PROBLEM_SUBTRACTION = "word_problem_subtraction",
    WORD_PROBLEM_MULTIPLICATION = "word_problem_multiplication",
    WORD_PROBLEM_DIVISION = "word_problem_division",
}

export enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
}

export enum Subject {
    MATHEMATICS = "Mathematics",
    SCIENCE = "Science",
    ENGLISH = "English",
    SOCIAL_STUDIES = "Social Studies",
}

/**
 * Utility functions for question type management
 */

/**
 * Get appropriate sub-types for a main type and grade
 */
export function getSubTypesForGrade(
    mainType: MainQuestionType,
    grade: number
): QuestionSubType[] {
    const gradeRecommendations = GRADE_SUBTYPE_RECOMMENDATIONS[grade];
    if (gradeRecommendations && gradeRecommendations[mainType]) {
        return gradeRecommendations[mainType];
    }

    // Fallback to all sub-types if no grade-specific recommendations
    return MAIN_TYPE_TO_SUBTYPES[mainType] || [];
}

/**
 * Convert legacy QuestionType to MainQuestionType
 */
export function convertLegacyToMainType(
    legacyType: QuestionType
): MainQuestionType {
    const legacyToMainMap: Record<string, MainQuestionType> = {
        [QuestionType.ADDITION]: MainQuestionType.ADDITION,
        [QuestionType.SUBTRACTION]: MainQuestionType.SUBTRACTION,
        [QuestionType.MULTIPLICATION]: MainQuestionType.MULTIPLICATION,
        [QuestionType.DIVISION]: MainQuestionType.DIVISION,
        [QuestionType.PATTERN]: MainQuestionType.PATTERN_RECOGNITION,

        // Legacy specific types map to their main types
        [QuestionType.WHOLE_NUMBER_ADDITION]: MainQuestionType.ADDITION,
        [QuestionType.DECIMAL_ADDITION]: MainQuestionType.ADDITION,
        [QuestionType.FRACTION_ADDITION]: MainQuestionType.ADDITION,
        [QuestionType.WORD_PROBLEM_ADDITION]: MainQuestionType.ADDITION,

        [QuestionType.WHOLE_NUMBER_SUBTRACTION]: MainQuestionType.SUBTRACTION,
        [QuestionType.DECIMAL_SUBTRACTION]: MainQuestionType.SUBTRACTION,
        [QuestionType.FRACTION_SUBTRACTION]: MainQuestionType.SUBTRACTION,
        [QuestionType.WORD_PROBLEM_SUBTRACTION]: MainQuestionType.SUBTRACTION,

        [QuestionType.WHOLE_NUMBER_MULTIPLICATION]:
            MainQuestionType.MULTIPLICATION,
        [QuestionType.DECIMAL_MULTIPLICATION]: MainQuestionType.MULTIPLICATION,
        [QuestionType.FRACTION_MULTIPLICATION]: MainQuestionType.MULTIPLICATION,
        [QuestionType.WORD_PROBLEM_MULTIPLICATION]:
            MainQuestionType.MULTIPLICATION,

        [QuestionType.WHOLE_NUMBER_DIVISION]: MainQuestionType.DIVISION,
        [QuestionType.DIVISION_WITH_REMAINDERS]: MainQuestionType.DIVISION,
        [QuestionType.LONG_DIVISION]: MainQuestionType.DIVISION,
        [QuestionType.DECIMAL_DIVISION]: MainQuestionType.DIVISION,
        [QuestionType.FRACTION_DIVISION]: MainQuestionType.DIVISION,
        [QuestionType.WORD_PROBLEM_DIVISION]: MainQuestionType.DIVISION,
    };

    return legacyToMainMap[legacyType] || MainQuestionType.ADDITION;
}

/**
 * Select appropriate sub-types based on user preferences
 */
export function selectSubTypes(
    mainType: MainQuestionType,
    grade: number,
    options: {
        includeWordProblems?: boolean;
        includeDecimals?: boolean;
        includeFractions?: boolean;
    } = {}
): QuestionSubType[] {
    const gradeSubTypes = getSubTypesForGrade(mainType, grade);
    let availableSubTypes = [...gradeSubTypes];

    // Filter based on user preferences
    if (!options.includeWordProblems) {
        availableSubTypes = availableSubTypes.filter(
            (subType) => !subType.includes("word_problem")
        );
    }

    if (!options.includeDecimals) {
        availableSubTypes = availableSubTypes.filter(
            (subType) => !subType.includes("decimal")
        );
    }

    if (!options.includeFractions) {
        availableSubTypes = availableSubTypes.filter(
            (subType) => !subType.includes("fraction")
        );
    }

    // Ensure we have at least one sub-type
    if (availableSubTypes.length === 0) {
        // Fallback to basic sub-type
        const basicSubTypes = gradeSubTypes.filter(
            (subType) =>
                subType.includes("basic") || subType.includes("whole_number")
        );
        return basicSubTypes.length > 0
            ? [basicSubTypes[0]]
            : [gradeSubTypes[0]];
    }

    return availableSubTypes;
}

// Export types for external use
export type QuestionGenerationRequest = z.infer<
    typeof QuestionGenerationRequestSchema
>;
export type QuestionOutput = z.infer<typeof QuestionOutputSchema>;
export type MultipleQuestionsOutput = z.infer<
    typeof MultipleQuestionsOutputSchema
>;
