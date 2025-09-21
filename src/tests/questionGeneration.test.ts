import {
    QuestionType,
    DifficultyLevel,
    MathQuestion,
} from "../models/question.js";
import { QuestionGenerationService } from "../services/questionGeneration.service.js";

describe("QuestionGenerationService", () => {
    let questionService: QuestionGenerationService;

    beforeEach(() => {
        questionService = new QuestionGenerationService();
    });

    describe("generateQuestion", () => {
        describe("Basic Question Generation", () => {
            it("should generate an addition question with correct properties", async () => {
                const type = QuestionType.ADDITION;
                const level = DifficultyLevel.EASY;

                const question = await questionService.generateQuestion(
                    type,
                    level
                );

                expect(question).toBeDefined();
                expect(question.type).toBe(type);
                expect(question.difficulty).toBe(level);
                expect(question.question).toBeDefined();
                expect(question.answer).toBeDefined();
                expect(typeof question.answer).toBe("number");
            });

            it("should generate unique IDs for each question", async () => {
                const type = QuestionType.ADDITION;
                const level = DifficultyLevel.EASY;

                const question1 = await questionService.generateQuestion(
                    type,
                    level
                );
                const question2 = await questionService.generateQuestion(
                    type,
                    level
                );

                expect(question1.id).not.toBe(question2.id);
            });

            it("should include creation timestamp", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.EASY
                );

                expect(question.createdAt).toBeDefined();
                expect(question.createdAt).toBeInstanceOf(Date);
            });
        });

        describe("Grade-Appropriate Questions", () => {
            it("should generate age-appropriate questions for grade 1", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.EASY,
                    1
                );

                const numbers = question.question.match(/\d+/g);
                expect(numbers).toBeDefined();
                numbers?.forEach((num) => {
                    expect(parseInt(num)).toBeLessThan(10);
                });
            });

            it("should generate harder questions for higher grades", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.MULTIPLICATION,
                    DifficultyLevel.HARD,
                    5
                );

                const numbers = question.question.match(/\d+/g);
                expect(numbers).toBeDefined();
                numbers?.forEach((num) => {
                    const value = parseInt(num);
                    expect(value).toBeGreaterThanOrEqual(10);
                    expect(value).toBeLessThanOrEqual(100);
                });
            });

            it("should handle different difficulty levels for grade 1", async () => {
                const mediumQuestion = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.MEDIUM,
                    1
                );
                const hardQuestion = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.HARD,
                    1
                );

                const mediumNumbers = mediumQuestion.question.match(/\d+/g);
                const hardNumbers = hardQuestion.question.match(/\d+/g);

                mediumNumbers?.forEach((num) => {
                    const value = parseInt(num);
                    expect(value).toBeLessThanOrEqual(15);
                });

                hardNumbers?.forEach((num) => {
                    const value = parseInt(num);
                    expect(value).toBeLessThanOrEqual(20);
                });
            });
        });

        describe("Question Formatting", () => {
            it("should format addition questions correctly", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.EASY
                );

                expect(question.question).toMatch(
                    /What is \d+(\s*\+\s*\d+)+\?/
                );
            });

            it("should format subtraction questions correctly", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.SUBTRACTION,
                    DifficultyLevel.EASY
                );

                expect(question.question).toMatch(/What is \d+(\s*-\s*\d+)+\?/);
            });

            it("should format multiplication questions correctly", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.MULTIPLICATION,
                    DifficultyLevel.EASY
                );

                expect(question.question).toMatch(/What is \d+(\s*×\s*\d+)+\?/);
            });

            it("should format division questions correctly", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.DIVISION,
                    DifficultyLevel.EASY
                );

                expect(question.question).toMatch(/What is \d+(\s*÷\s*\d+)+\?/);
            });

            it("should throw error for unsupported question type", async () => {
                await expect(
                    questionService.generateQuestion(
                        QuestionType.PATTERN,
                        DifficultyLevel.EASY
                    )
                ).rejects.toThrow("Question type pattern not implemented");
            });
        });

        describe("Answer Calculation", () => {
            it("should calculate correct answers for all operations", async () => {
                const additionQ = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.EASY
                );
                const subtractionQ = await questionService.generateQuestion(
                    QuestionType.SUBTRACTION,
                    DifficultyLevel.EASY
                );
                const multiplicationQ = await questionService.generateQuestion(
                    QuestionType.MULTIPLICATION,
                    DifficultyLevel.EASY
                );
                const divisionQ = await questionService.generateQuestion(
                    QuestionType.DIVISION,
                    DifficultyLevel.EASY
                );

                const [a1, b1] = additionQ.question.match(/\d+/g)!.map(Number);
                expect(additionQ.answer).toBe(a1 + b1);

                const [a2, b2] = subtractionQ.question
                    .match(/\d+/g)!
                    .map(Number);
                expect(subtractionQ.answer).toBe(a2 - b2);

                const [a3, b3] = multiplicationQ.question
                    .match(/\d+/g)!
                    .map(Number);
                expect(multiplicationQ.answer).toBe(a3 * b3);

                const [a4, b4] = divisionQ.question.match(/\d+/g)!.map(Number);
                expect(divisionQ.answer).toBe(
                    Math.round((a4 / b4) * 100) / 100
                );
            });
        });
    });

    describe("validateAnswer", () => {
        describe("Basic Validation", () => {
            it("should correctly validate a correct answer", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.EASY
                );

                const result = await questionService.validateAnswer(
                    question,
                    question.answer
                );

                expect(result.correct).toBe(true);
                expect(result.feedback).toBeDefined();
            });

            it("should correctly validate an incorrect answer", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.EASY
                );

                const result = await questionService.validateAnswer(
                    question,
                    question.answer + 1
                );

                expect(result.correct).toBe(false);
                expect(result.feedback).toBeDefined();
                expect(result.feedback).toMatch(/Try again/);
            });
        });

        describe("Difficulty Progression", () => {
            it("should suggest harder difficulty after correct answer", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.EASY
                );

                const result = await questionService.validateAnswer(
                    question,
                    question.answer
                );

                expect(result.nextQuestionSuggestion).toBeDefined();
                expect(result.nextQuestionSuggestion?.difficulty).toBe(
                    DifficultyLevel.MEDIUM
                );
            });

            it("should suggest easier difficulty after incorrect answer", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.MEDIUM
                );

                const result = await questionService.validateAnswer(
                    question,
                    question.answer + 1
                );

                expect(result.nextQuestionSuggestion).toBeDefined();
                expect(result.nextQuestionSuggestion?.difficulty).toBe(
                    DifficultyLevel.EASY
                );
            });

            it("should maintain hard difficulty for correct answers", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.HARD
                );

                const result = await questionService.validateAnswer(
                    question,
                    question.answer
                );

                expect(result.nextQuestionSuggestion?.difficulty).toBe(
                    DifficultyLevel.HARD
                );
            });

            it("should maintain easy difficulty for incorrect answers", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.EASY
                );

                const result = await questionService.validateAnswer(
                    question,
                    question.answer + 1
                );

                expect(result.nextQuestionSuggestion?.difficulty).toBe(
                    DifficultyLevel.EASY
                );
            });

            it("should rotate through all question types on success", async () => {
                const question = await questionService.generateQuestion(
                    QuestionType.ADDITION,
                    DifficultyLevel.EASY
                );

                const result = await questionService.validateAnswer(
                    question,
                    question.answer
                );

                expect(result.nextQuestionSuggestion).toBeDefined();
                expect(result.nextQuestionSuggestion?.type).toBe(
                    QuestionType.SUBTRACTION
                );
            });

            it("should complete full rotation of question types", async () => {
                const types = [
                    QuestionType.ADDITION,
                    QuestionType.SUBTRACTION,
                    QuestionType.MULTIPLICATION,
                    QuestionType.DIVISION,
                ];

                let currentType = QuestionType.ADDITION;
                for (let i = 0; i < types.length; i++) {
                    const question = await questionService.generateQuestion(
                        currentType,
                        DifficultyLevel.EASY
                    );

                    const result = await questionService.validateAnswer(
                        question,
                        question.answer
                    );

                    const expectedNextType = types[(i + 1) % types.length];
                    expect(result.nextQuestionSuggestion?.type).toBe(
                        expectedNextType
                    );
                    currentType = expectedNextType;
                }
            });
        });
    });
});
