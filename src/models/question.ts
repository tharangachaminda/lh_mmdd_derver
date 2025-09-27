export enum QuestionType {
    ADDITION = "addition",
    SUBTRACTION = "subtraction",
    MULTIPLICATION = "multiplication",
    DIVISION = "division",
    PATTERN = "pattern",
    FRACTION_ADDITION = "fraction_addition",
    FRACTION_SUBTRACTION = "fraction_subtraction",
    FRACTION_MULTIPLICATION = "fraction_multiplication",
    FRACTION_DIVISION = "fraction_division",
}

export enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
}

/**
 * Subject areas supported by the curriculum system
 */
export enum Subject {
    MATHEMATICS = "Mathematics",
    SCIENCE = "Science",
    ENGLISH = "English",
    SOCIAL_STUDIES = "Social Studies",
}

/**
 * Mathematical topics covered in the curriculum
 */
export enum MathTopic {
    ADDITION = "Addition",
    SUBTRACTION = "Subtraction",
    MULTIPLICATION = "Multiplication",
    DIVISION = "Division",
    FRACTIONS = "Fractions",
    DECIMALS = "Decimals",
    GEOMETRY = "Geometry",
    MEASUREMENT = "Measurement",
    DATA_AND_GRAPHING = "Data and Graphing",
    PATTERNS_AND_ALGEBRA = "Patterns and Algebra",
    NUMBER_SENSE = "Number Sense",
    PLACE_VALUE = "Place Value",
    TIME = "Time",
    MONEY = "Money",
}

/**
 * Subtopics for more granular curriculum organization
 */
export enum MathSubtopic {
    // Addition subtopics
    SINGLE_DIGIT_ADDITION = "Single Digit Addition",
    DOUBLE_DIGIT_ADDITION = "Double Digit Addition",
    ADDITION_WITH_REGROUPING = "Addition with Regrouping",
    ADDITION_WORD_PROBLEMS = "Addition Word Problems",

    // Subtraction subtopics
    SINGLE_DIGIT_SUBTRACTION = "Single Digit Subtraction",
    DOUBLE_DIGIT_SUBTRACTION = "Double Digit Subtraction",
    SUBTRACTION_WITH_BORROWING = "Subtraction with Borrowing",
    SUBTRACTION_WORD_PROBLEMS = "Subtraction Word Problems",

    // Multiplication subtopics
    BASIC_MULTIPLICATION = "Basic Multiplication",
    MULTIPLICATION_TABLES = "Multiplication Tables",
    MULTIPLICATION_WITH_REGROUPING = "Multiplication with Regrouping",
    MULTIPLICATION_WORD_PROBLEMS = "Multiplication Word Problems",

    // Division subtopics
    BASIC_DIVISION = "Basic Division",
    DIVISION_WITH_REMAINDERS = "Division with Remainders",
    LONG_DIVISION = "Long Division",
    DIVISION_WORD_PROBLEMS = "Division Word Problems",

    // Fraction subtopics
    FRACTION_BASICS = "Fraction Basics",
    EQUIVALENT_FRACTIONS = "Equivalent Fractions",
    COMPARING_FRACTIONS = "Comparing Fractions",
    MIXED_NUMBERS = "Mixed Numbers",
}

/**
 * Valid grade levels for elementary mathematics
 */
export enum Grade {
    KINDERGARTEN = 0,
    FIRST = 1,
    SECOND = 2,
    THIRD = 3,
    FOURTH = 4,
    FIFTH = 5,
    SIXTH = 6,
}

/**
 * Type for grade level as number (for backward compatibility)
 */
export type GradeLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface Question {
    id: string;
    type: QuestionType;
    difficulty: DifficultyLevel;
    grade: number;
    question: string;
    answer: number;
    context?: string;
    hints?: string[];
    createdAt: Date;
}

export interface QuestionValidationResult {
    correct: boolean;
    feedback: string;
    nextQuestionSuggestion?: {
        type: QuestionType;
        difficulty: DifficultyLevel;
    };
}

// Curriculum-related interfaces have been moved to curriculum.ts
