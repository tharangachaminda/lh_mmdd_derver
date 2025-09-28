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
        // Number and Operations topics
        case "Number and Operations":
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
        case "Percentages":
            return MathTopic.PERCENTAGES;
        case "Integers":
            return MathTopic.INTEGERS;
        case "Number Sense":
            return MathTopic.NUMBER_SENSE;
        case "Place Value":
            return MathTopic.PLACE_VALUE;

        // Algebra topics
        case "Patterns and Algebra":
        case "Algebraic Expressions":
            return MathTopic.ALGEBRAIC_EXPRESSIONS;
        case "Equations":
            return MathTopic.EQUATIONS;
        case "Functions":
            return MathTopic.FUNCTIONS;
        case "Patterns and Sequences":
            return MathTopic.PATTERNS_AND_SEQUENCES;

        // Geometry topics
        case "Geometry":
        case "Shapes and Solids":
            return MathTopic.SHAPES_AND_SOLIDS;
        case "Angles":
            return MathTopic.ANGLES;
        case "Area and Perimeter":
            return MathTopic.AREA_AND_PERIMETER;

        // Measurement topics
        case "Measurement":
        case "Length and Distance":
            return MathTopic.LENGTH_AND_DISTANCE;
        case "Time":
            return MathTopic.TIME;
        case "Money":
            return MathTopic.MONEY;

        // Data and Statistics topics
        case "Data and Graphing":
        case "Graphs and Charts":
            return MathTopic.GRAPHS_AND_CHARTS;
        case "Probability":
            return MathTopic.PROBABILITY;

        // Ratios and Proportions
        case "Ratios":
            return MathTopic.RATIOS;
        case "Proportions":
            return MathTopic.PROPORTIONS;

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
        // Number Operations (Grades 3-5)
        case "Multi-Digit Addition":
            return MathSubtopic.MULTI_DIGIT_ADDITION;
        case "Multi-Digit Subtraction":
            return MathSubtopic.MULTI_DIGIT_SUBTRACTION;
        case "Multiplication Tables":
            return MathSubtopic.MULTIPLICATION_TABLES;
        case "Multi-Digit Multiplication":
            return MathSubtopic.MULTI_DIGIT_MULTIPLICATION;
        case "Long Division":
            return MathSubtopic.LONG_DIVISION;
        case "Division with Remainders":
            return MathSubtopic.DIVISION_WITH_REMAINDERS;

        // Fractions (Grades 3-6)
        case "Fraction Basics":
            return MathSubtopic.FRACTION_BASICS;
        case "Equivalent Fractions":
            return MathSubtopic.EQUIVALENT_FRACTIONS;
        case "Comparing Fractions":
            return MathSubtopic.COMPARING_FRACTIONS;
        case "Adding Fractions":
            return MathSubtopic.ADDING_FRACTIONS;
        case "Subtracting Fractions":
            return MathSubtopic.SUBTRACTING_FRACTIONS;
        case "Multiplying Fractions":
            return MathSubtopic.MULTIPLYING_FRACTIONS;
        case "Dividing Fractions":
            return MathSubtopic.DIVIDING_FRACTIONS;
        case "Mixed Numbers":
            return MathSubtopic.MIXED_NUMBERS;
        case "Improper Fractions":
            return MathSubtopic.IMPROPER_FRACTIONS;

        // Decimals (Grades 4-6)
        case "Decimal Place Value":
            return MathSubtopic.DECIMAL_PLACE_VALUE;
        case "Comparing Decimals":
            return MathSubtopic.COMPARING_DECIMALS;
        case "Adding Decimals":
            return MathSubtopic.ADDING_DECIMALS;
        case "Subtracting Decimals":
            return MathSubtopic.SUBTRACTING_DECIMALS;
        case "Multiplying Decimals":
            return MathSubtopic.MULTIPLYING_DECIMALS;
        case "Dividing Decimals":
            return MathSubtopic.DIVIDING_DECIMALS;
        case "Rounding Decimals":
            return MathSubtopic.ROUNDING_DECIMALS;

        // Percentages (Grades 5-8)
        case "Percent Basics":
            return MathSubtopic.PERCENT_BASICS;
        case "Percent of a Number":
            return MathSubtopic.PERCENT_OF_NUMBER;
        case "Percent Increase and Decrease":
            return MathSubtopic.PERCENT_INCREASE_DECREASE;
        case "Sales Tax and Discounts":
            return MathSubtopic.SALES_TAX_AND_DISCOUNTS;
        case "Simple Interest":
            return MathSubtopic.SIMPLE_INTEREST;

        // Integers (Grades 6-8)
        case "Positive and Negative Numbers":
            return MathSubtopic.POSITIVE_AND_NEGATIVE_NUMBERS;
        case "Adding Integers":
            return MathSubtopic.ADDING_INTEGERS;
        case "Subtracting Integers":
            return MathSubtopic.SUBTRACTING_INTEGERS;
        case "Multiplying Integers":
            return MathSubtopic.MULTIPLYING_INTEGERS;
        case "Dividing Integers":
            return MathSubtopic.DIVIDING_INTEGERS;

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
        case "whole_number_division":
            return QuestionType.WHOLE_NUMBER_DIVISION;
        case "division_with_remainders":
            return QuestionType.DIVISION_WITH_REMAINDERS;
        case "long_division":
            return QuestionType.LONG_DIVISION;
        case "decimal_division_exact":
            return QuestionType.DECIMAL_DIVISION_EXACT;
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
        case "fraction_comparison":
            return QuestionType.FRACTION_COMPARISON;
        case "fraction_simplification":
            return QuestionType.FRACTION_SIMPLIFICATION;

        // Decimal Operations
        case "decimal_addition":
            return QuestionType.DECIMAL_ADDITION;
        case "decimal_subtraction":
            return QuestionType.DECIMAL_SUBTRACTION;
        case "decimal_multiplication":
            return QuestionType.DECIMAL_MULTIPLICATION;
        case "decimal_division":
            return QuestionType.DECIMAL_DIVISION;
        case "decimal_comparison":
            return QuestionType.DECIMAL_COMPARISON;
        case "decimal_rounding":
            return QuestionType.DECIMAL_ROUNDING;

        // Whole Number Operations (specific types used in curriculum data)
        case "whole_number_addition":
            return QuestionType.WHOLE_NUMBER_ADDITION;
        case "whole_number_subtraction":
            return QuestionType.WHOLE_NUMBER_SUBTRACTION;
        case "whole_number_multiplication":
            return QuestionType.WHOLE_NUMBER_MULTIPLICATION;

        // Word Problems
        case "word_problem_addition":
            return QuestionType.WORD_PROBLEM_ADDITION;
        case "word_problem_subtraction":
            return QuestionType.WORD_PROBLEM_SUBTRACTION;
        case "word_problem_multiplication":
            return QuestionType.WORD_PROBLEM_MULTIPLICATION;
        case "word_problem_division":
            return QuestionType.WORD_PROBLEM_DIVISION;
        case "word_problem_mixed":
            return QuestionType.WORD_PROBLEM_MIXED;

        // Percentage
        case "percentage_calculation":
            return QuestionType.PERCENTAGE_CALCULATION;
        case "percentage_of_number":
            return QuestionType.PERCENTAGE_OF_NUMBER;
        case "percentage_increase":
            return QuestionType.PERCENTAGE_INCREASE;
        case "percentage_decrease":
            return QuestionType.PERCENTAGE_DECREASE;

        // Integer Operations
        case "integer_addition":
            return QuestionType.INTEGER_ADDITION;
        case "integer_subtraction":
            return QuestionType.INTEGER_SUBTRACTION;
        case "integer_multiplication":
            return QuestionType.INTEGER_MULTIPLICATION;
        case "integer_division":
            return QuestionType.INTEGER_DIVISION;

        // Algebra
        case "algebraic_expression":
            return QuestionType.ALGEBRAIC_EXPRESSION;
        case "solving_equations":
            return QuestionType.SOLVING_EQUATIONS;
        case "graphing":
            return QuestionType.GRAPHING;
        case "slope_calculation":
            return QuestionType.SLOPE_CALCULATION;

        // Geometry
        case "area_calculation":
            return QuestionType.AREA_CALCULATION;
        case "perimeter_calculation":
            return QuestionType.PERIMETER_CALCULATION;
        case "volume_calculation":
            return QuestionType.VOLUME_CALCULATION;
        case "angle_measurement":
            return QuestionType.ANGLE_MEASUREMENT;
        case "shape_identification":
            return QuestionType.SHAPE_IDENTIFICATION;

        // Ratios and Proportions
        case "ratio_simplification":
            return QuestionType.RATIO_SIMPLIFICATION;
        case "proportion_solving":
            return QuestionType.PROPORTION_SOLVING;
        case "unit_rate":
            return QuestionType.UNIT_RATE;
        case "scale_factor":
            return QuestionType.SCALE_FACTOR;

        // Statistics and Probability
        case "mean_calculation":
            return QuestionType.MEAN_CALCULATION;
        case "median_calculation":
            return QuestionType.MEDIAN_CALCULATION;
        case "mode_calculation":
            return QuestionType.MODE_CALCULATION;
        case "probability_calculation":
            return QuestionType.PROBABILITY_CALCULATION;
        case "data_interpretation":
            return QuestionType.DATA_INTERPRETATION;

        // Pattern Recognition
        case "sequence":
            return QuestionType.SEQUENCE;
        case "function_table":
            return QuestionType.FUNCTION_TABLE;

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
