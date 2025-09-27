import {
    Subject,
    MathTopic,
    MathSubtopic,
    GradeLevel,
    Grade,
    DifficultyLevel,
    QuestionType,
} from "../models/question.js";

/**
 * Type guards and conversion utilities for curriculum data
 */

/**
 * Converts a string subject to Subject enum
 */
export function parseSubject(subject: string): Subject {
    const normalizedSubject = subject.trim();

    switch (normalizedSubject) {
        case "Mathematics":
            return Subject.MATHEMATICS;
        case "Science":
            return Subject.SCIENCE;
        case "English":
            return Subject.ENGLISH;
        case "Social Studies":
            return Subject.SOCIAL_STUDIES;
        default:
            // Default to Mathematics if not recognized
            return Subject.MATHEMATICS;
    }
}

/**
 * Converts a string topic to MathTopic enum
 */
export function parseMathTopic(topic: string): MathTopic {
    const normalizedTopic = topic.trim();

    switch (normalizedTopic) {
        case "Addition":
            return MathTopic.ADDITION;
        case "Subtraction":
            return MathTopic.SUBTRACTION;
        case "Multiplication":
            return MathTopic.MULTIPLICATION;
        case "Division":
            return MathTopic.DIVISION;
        case "Fractions":
            return MathTopic.FRACTIONS;
        case "Decimals":
            return MathTopic.DECIMALS;
        case "Geometry":
            return MathTopic.GEOMETRY;
        case "Measurement":
            return MathTopic.MEASUREMENT;
        case "Data and Graphing":
            return MathTopic.DATA_AND_GRAPHING;
        case "Patterns and Algebra":
            return MathTopic.PATTERNS_AND_ALGEBRA;
        case "Number Sense":
            return MathTopic.NUMBER_SENSE;
        case "Place Value":
            return MathTopic.PLACE_VALUE;
        case "Time":
            return MathTopic.TIME;
        case "Money":
            return MathTopic.MONEY;
        default:
            throw new Error(`Unknown math topic: ${topic}`);
    }
}

/**
 * Converts a string subtopic to MathSubtopic enum
 */
export function parseMathSubtopic(subtopic: string): MathSubtopic {
    const normalizedSubtopic = subtopic.trim();

    switch (normalizedSubtopic) {
        // Addition subtopics
        case "Single Digit Addition":
            return MathSubtopic.SINGLE_DIGIT_ADDITION;
        case "Double Digit Addition":
            return MathSubtopic.DOUBLE_DIGIT_ADDITION;
        case "Addition with Regrouping":
            return MathSubtopic.ADDITION_WITH_REGROUPING;
        case "Addition Word Problems":
            return MathSubtopic.ADDITION_WORD_PROBLEMS;

        // Subtraction subtopics
        case "Single Digit Subtraction":
            return MathSubtopic.SINGLE_DIGIT_SUBTRACTION;
        case "Double Digit Subtraction":
            return MathSubtopic.DOUBLE_DIGIT_SUBTRACTION;
        case "Subtraction with Borrowing":
            return MathSubtopic.SUBTRACTION_WITH_BORROWING;
        case "Subtraction Word Problems":
            return MathSubtopic.SUBTRACTION_WORD_PROBLEMS;

        // Multiplication subtopics
        case "Basic Multiplication":
            return MathSubtopic.BASIC_MULTIPLICATION;
        case "Multiplication Tables":
            return MathSubtopic.MULTIPLICATION_TABLES;
        case "Multiplication with Regrouping":
            return MathSubtopic.MULTIPLICATION_WITH_REGROUPING;
        case "Multiplication Word Problems":
            return MathSubtopic.MULTIPLICATION_WORD_PROBLEMS;

        // Division subtopics
        case "Basic Division":
            return MathSubtopic.BASIC_DIVISION;
        case "Division with Remainders":
            return MathSubtopic.DIVISION_WITH_REMAINDERS;
        case "Long Division":
            return MathSubtopic.LONG_DIVISION;
        case "Division Word Problems":
            return MathSubtopic.DIVISION_WORD_PROBLEMS;

        // Fraction subtopics
        case "Fraction Basics":
            return MathSubtopic.FRACTION_BASICS;
        case "Equivalent Fractions":
            return MathSubtopic.EQUIVALENT_FRACTIONS;
        case "Comparing Fractions":
            return MathSubtopic.COMPARING_FRACTIONS;
        case "Mixed Numbers":
            return MathSubtopic.MIXED_NUMBERS;

        default:
            throw new Error(`Unknown math subtopic: ${subtopic}`);
    }
}

/**
 * Converts a number to GradeLevel type with validation
 */
export function parseGradeLevel(grade: number): GradeLevel {
    if (grade < 0 || grade > 6 || !Number.isInteger(grade)) {
        throw new Error(
            `Invalid grade level: ${grade}. Must be an integer from 0-6.`
        );
    }
    return grade as GradeLevel;
}

/**
 * Converts a string difficulty to DifficultyLevel enum
 */
export function parseDifficultyLevel(difficulty: string): DifficultyLevel {
    const normalizedDifficulty = difficulty.toLowerCase().trim();

    switch (normalizedDifficulty) {
        case "easy":
            return DifficultyLevel.EASY;
        case "medium":
            return DifficultyLevel.MEDIUM;
        case "hard":
            return DifficultyLevel.HARD;
        default:
            throw new Error(`Unknown difficulty level: ${difficulty}`);
    }
}

/**
 * Converts a string question type to QuestionType enum
 */
export function parseQuestionType(type: string): QuestionType {
    const normalizedType = type.toLowerCase().trim();

    switch (normalizedType) {
        case "addition":
            return QuestionType.ADDITION;
        case "subtraction":
            return QuestionType.SUBTRACTION;
        case "multiplication":
            return QuestionType.MULTIPLICATION;
        case "division":
            return QuestionType.DIVISION;
        case "pattern":
            return QuestionType.PATTERN;
        case "fraction_addition":
            return QuestionType.FRACTION_ADDITION;
        case "fraction_subtraction":
            return QuestionType.FRACTION_SUBTRACTION;
        case "fraction_multiplication":
            return QuestionType.FRACTION_MULTIPLICATION;
        case "fraction_division":
            return QuestionType.FRACTION_DIVISION;
        default:
            throw new Error(`Unknown question type: ${type}`);
    }
}

/**
 * Type guard to check if a value is a valid GradeLevel
 */
export function isValidGradeLevel(grade: any): grade is GradeLevel {
    return (
        typeof grade === "number" &&
        Number.isInteger(grade) &&
        grade >= 0 &&
        grade <= 6
    );
}

/**
 * Type guard to check if a string is a valid Subject
 */
export function isValidSubject(subject: string): subject is Subject {
    return Object.values(Subject).includes(subject as Subject);
}

/**
 * Type guard to check if a string is a valid MathTopic
 */
export function isValidMathTopic(topic: string): topic is MathTopic {
    return Object.values(MathTopic).includes(topic as MathTopic);
}

/**
 * Type guard to check if a string is a valid MathSubtopic
 */
export function isValidMathSubtopic(
    subtopic: string
): subtopic is MathSubtopic {
    return Object.values(MathSubtopic).includes(subtopic as MathSubtopic);
}

/**
 * Type guard to check if a string is a valid DifficultyLevel
 */
export function isValidDifficultyLevel(
    difficulty: string
): difficulty is DifficultyLevel {
    return Object.values(DifficultyLevel).includes(
        difficulty as DifficultyLevel
    );
}

/**
 * Type guard to check if a string is a valid QuestionType
 */
export function isValidQuestionType(type: string): type is QuestionType {
    return Object.values(QuestionType).includes(type as QuestionType);
}

/**
 * Utility to get all valid values for debugging/validation
 */
export const CurriculumValidValues = {
    subjects: Object.values(Subject),
    mathTopics: Object.values(MathTopic),
    mathSubtopics: Object.values(MathSubtopic),
    gradeLevels: [0, 1, 2, 3, 4, 5, 6] as GradeLevel[],
    difficultyLevels: Object.values(DifficultyLevel),
    questionTypes: Object.values(QuestionType),
} as const;
