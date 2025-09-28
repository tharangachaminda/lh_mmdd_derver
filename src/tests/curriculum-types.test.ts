import { jest, describe, it, expect } from "@jest/globals";
import {
    parseSubject,
    parseMathTopic,
    parseMathSubtopic,
    parseGradeLevel,
    parseDifficultyLevel,
    parseQuestionType,
    isValidGradeLevel,
    isValidSubject,
    isValidMathTopic,
    isValidMathSubtopic,
    isValidDifficultyLevel,
    isValidQuestionType,
    CurriculumValidValues,
} from "../utils/curriculum-types.util.js";
import {
    Subject,
    MathTopic,
    MathSubtopic,
    GradeLevel,
    DifficultyLevel,
    QuestionType,
} from "../models/question.js";

describe("Curriculum Type Utilities", () => {
    describe("parseSubject", () => {
        it("should parse valid subjects correctly", () => {
            expect(parseSubject("Mathematics")).toBe(Subject.MATHEMATICS);
            expect(parseSubject("Science")).toBe(Subject.SCIENCE);
            expect(parseSubject("English")).toBe(Subject.ENGLISH);
            expect(parseSubject("Social Studies")).toBe(Subject.SOCIAL_STUDIES);
        });

        it("should default to Mathematics for unknown subjects", () => {
            expect(parseSubject("Unknown Subject")).toBe(Subject.MATHEMATICS);
        });
    });

    describe("parseMathTopic", () => {
        it("should parse valid math topics correctly", () => {
            expect(parseMathTopic("Addition")).toBe(MathTopic.ADDITION);
            expect(parseMathTopic("Subtraction")).toBe(MathTopic.SUBTRACTION);
            expect(parseMathTopic("Multiplication")).toBe(
                MathTopic.MULTIPLICATION
            );
            expect(parseMathTopic("Division")).toBe(MathTopic.DIVISION);
        });

        it("should throw error for unknown topics", () => {
            expect(() => parseMathTopic("Unknown Topic")).toThrow(
                "Unknown math topic: Unknown Topic"
            );
        });
    });

    describe("parseMathSubtopic", () => {
        it("should parse valid math subtopics correctly", () => {
            expect(parseMathSubtopic("Multi-Digit Addition")).toBe(
                MathSubtopic.MULTI_DIGIT_ADDITION
            );
            expect(parseMathSubtopic("Multi-Digit Multiplication")).toBe(
                MathSubtopic.MULTI_DIGIT_MULTIPLICATION
            );
            expect(parseMathSubtopic("Division with Remainders")).toBe(
                MathSubtopic.DIVISION_WITH_REMAINDERS
            );
        });

        it("should throw error for unknown subtopics", () => {
            expect(() => parseMathSubtopic("Unknown Subtopic")).toThrow(
                "Unknown math subtopic: Unknown Subtopic"
            );
        });
    });

    describe("parseGradeLevel", () => {
        it("should parse valid grade levels correctly", () => {
            expect(parseGradeLevel(0)).toBe(0);
            expect(parseGradeLevel(2)).toBe(2);
            expect(parseGradeLevel(6)).toBe(6);
        });

        it("should throw error for invalid grade levels", () => {
            expect(() => parseGradeLevel(-1)).toThrow(
                "Invalid grade level: -1"
            );
            expect(() => parseGradeLevel(7)).toThrow("Invalid grade level: 7");
            expect(() => parseGradeLevel(2.5)).toThrow(
                "Invalid grade level: 2.5"
            );
        });
    });

    describe("parseDifficultyLevel", () => {
        it("should parse valid difficulty levels correctly", () => {
            expect(parseDifficultyLevel("easy")).toBe(DifficultyLevel.EASY);
            expect(parseDifficultyLevel("MEDIUM")).toBe(DifficultyLevel.MEDIUM);
            expect(parseDifficultyLevel(" Hard ")).toBe(DifficultyLevel.HARD);
        });

        it("should throw error for unknown difficulty levels", () => {
            expect(() => parseDifficultyLevel("impossible")).toThrow(
                "Unknown difficulty level: impossible"
            );
        });
    });

    describe("parseQuestionType", () => {
        it("should parse valid question types correctly", () => {
            expect(parseQuestionType("addition")).toBe(QuestionType.ADDITION);
            expect(parseQuestionType("SUBTRACTION")).toBe(
                QuestionType.SUBTRACTION
            );
            expect(parseQuestionType(" multiplication ")).toBe(
                QuestionType.MULTIPLICATION
            );
        });

        it("should parse division question types correctly", () => {
            expect(parseQuestionType("division")).toBe(QuestionType.DIVISION);
            expect(parseQuestionType("whole_number_division")).toBe(
                QuestionType.WHOLE_NUMBER_DIVISION
            );
            expect(parseQuestionType("division_with_remainders")).toBe(
                QuestionType.DIVISION_WITH_REMAINDERS
            );
            expect(parseQuestionType("long_division")).toBe(
                QuestionType.LONG_DIVISION
            );
        });

        it("should parse whole number operation types correctly", () => {
            expect(parseQuestionType("whole_number_addition")).toBe(
                QuestionType.WHOLE_NUMBER_ADDITION
            );
            expect(parseQuestionType("whole_number_subtraction")).toBe(
                QuestionType.WHOLE_NUMBER_SUBTRACTION
            );
            expect(parseQuestionType("whole_number_multiplication")).toBe(
                QuestionType.WHOLE_NUMBER_MULTIPLICATION
            );
        });

        it("should parse decimal operation types correctly", () => {
            expect(parseQuestionType("decimal_addition")).toBe(
                QuestionType.DECIMAL_ADDITION
            );
            expect(parseQuestionType("decimal_subtraction")).toBe(
                QuestionType.DECIMAL_SUBTRACTION
            );
            expect(parseQuestionType("decimal_multiplication")).toBe(
                QuestionType.DECIMAL_MULTIPLICATION
            );
        });

        it("should parse word problem types correctly", () => {
            expect(parseQuestionType("word_problem_addition")).toBe(
                QuestionType.WORD_PROBLEM_ADDITION
            );
            expect(parseQuestionType("word_problem_subtraction")).toBe(
                QuestionType.WORD_PROBLEM_SUBTRACTION
            );
            expect(parseQuestionType("word_problem_division")).toBe(
                QuestionType.WORD_PROBLEM_DIVISION
            );
        });

        it("should throw error for unknown question types", () => {
            expect(() => parseQuestionType("unknown_type")).toThrow(
                "Unknown question type: unknown_type"
            );
        });
    });

    describe("Type Guards", () => {
        it("should validate grade levels correctly", () => {
            expect(isValidGradeLevel(2)).toBe(true);
            expect(isValidGradeLevel(0)).toBe(true);
            expect(isValidGradeLevel(6)).toBe(true);
            expect(isValidGradeLevel(-1)).toBe(false);
            expect(isValidGradeLevel(7)).toBe(false);
            expect(isValidGradeLevel(2.5)).toBe(false);
            expect(isValidGradeLevel("2")).toBe(false);
        });

        it("should validate subjects correctly", () => {
            expect(isValidSubject("Mathematics")).toBe(true);
            expect(isValidSubject("Science")).toBe(true);
            expect(isValidSubject("Unknown")).toBe(false);
        });

        it("should validate math topics correctly", () => {
            expect(isValidMathTopic("Addition")).toBe(true);
            expect(isValidMathTopic("Subtraction")).toBe(true);
            expect(isValidMathTopic("Unknown Topic")).toBe(false);
        });

        it("should validate math subtopics correctly", () => {
            expect(isValidMathSubtopic("Multi-Digit Addition")).toBe(true);
            expect(isValidMathSubtopic("Division with Remainders")).toBe(true);
            expect(isValidMathSubtopic("Unknown Subtopic")).toBe(false);
        });

        it("should validate difficulty levels correctly", () => {
            expect(isValidDifficultyLevel("easy")).toBe(true);
            expect(isValidDifficultyLevel("medium")).toBe(true);
            expect(isValidDifficultyLevel("hard")).toBe(true);
            expect(isValidDifficultyLevel("impossible")).toBe(false);
        });

        it("should validate question types correctly", () => {
            expect(isValidQuestionType("addition")).toBe(true);
            expect(isValidQuestionType("subtraction")).toBe(true);
            expect(isValidQuestionType("unknown_type")).toBe(false);
        });
    });

    describe("CurriculumValidValues", () => {
        it("should contain all expected valid values", () => {
            expect(CurriculumValidValues.subjects).toContain("Mathematics");
            expect(CurriculumValidValues.mathTopics).toContain("Addition");
            expect(CurriculumValidValues.mathSubtopics).toContain(
                "Multi-Digit Addition"
            );
            expect(CurriculumValidValues.gradeLevels).toContain(2);
            expect(CurriculumValidValues.difficultyLevels).toContain("easy");
            expect(CurriculumValidValues.questionTypes).toContain("addition");
        });

        it("should have correct counts for each category", () => {
            expect(CurriculumValidValues.subjects).toHaveLength(4);
            expect(CurriculumValidValues.mathTopics).toHaveLength(39); // Updated count for all math topics
            expect(CurriculumValidValues.gradeLevels).toHaveLength(7);
            expect(CurriculumValidValues.difficultyLevels).toHaveLength(3);
            expect(CurriculumValidValues.questionTypes).toHaveLength(57); // Updated count for all question types
        });
    });

    describe("Sample Data Compatibility", () => {
        it("should handle sample curriculum data values correctly", () => {
            // Test values from sample-curriculum-data.json
            expect(() => parseGradeLevel(2)).not.toThrow();
            expect(() => parseSubject("Mathematics")).not.toThrow();
            expect(() => parseMathTopic("Addition")).not.toThrow();
            expect(() =>
                parseMathSubtopic("Multi-Digit Addition")
            ).not.toThrow();
            expect(() => parseDifficultyLevel("easy")).not.toThrow();
            expect(() => parseQuestionType("addition")).not.toThrow();
        });

        it("should handle batch sample data values correctly", () => {
            // Test values from curriculum-batch-sample.json
            expect(() => parseMathTopic("Subtraction")).not.toThrow();
            expect(() => parseMathTopic("Multiplication")).not.toThrow();
            expect(() =>
                parseMathSubtopic("Multi-Digit Subtraction")
            ).not.toThrow();
            expect(() =>
                parseMathSubtopic("Multi-Digit Multiplication")
            ).not.toThrow();
            expect(() => parseDifficultyLevel("medium")).not.toThrow();
        });

        it("should handle Grade 5 curriculum data question types correctly", () => {
            // Test question types from curriculum-batch-grades3-8.json
            expect(() =>
                parseQuestionType("division_with_remainders")
            ).not.toThrow();
            expect(() =>
                parseQuestionType("whole_number_division")
            ).not.toThrow();
            expect(() => parseQuestionType("long_division")).not.toThrow();
            expect(() =>
                parseQuestionType("word_problem_division")
            ).not.toThrow();
            expect(() =>
                parseQuestionType("whole_number_subtraction")
            ).not.toThrow();
            expect(() =>
                parseQuestionType("decimal_subtraction")
            ).not.toThrow();
            expect(() =>
                parseQuestionType("word_problem_subtraction")
            ).not.toThrow();
            expect(() =>
                parseQuestionType("whole_number_addition")
            ).not.toThrow();
            expect(() => parseQuestionType("decimal_addition")).not.toThrow();
            expect(() =>
                parseQuestionType("word_problem_addition")
            ).not.toThrow();
            expect(() =>
                parseQuestionType("whole_number_multiplication")
            ).not.toThrow();
            expect(() =>
                parseQuestionType("decimal_multiplication")
            ).not.toThrow();
            expect(() =>
                parseQuestionType("word_problem_multiplication")
            ).not.toThrow();
        });
    });
});
