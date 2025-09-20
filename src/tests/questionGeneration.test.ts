import {
    QuestionType,
    DifficultyLevel,
    MathQuestion,
} from "../models/question";
import { QuestionGenerationService } from "../services/questionGeneration.service";

describe("QuestionGenerationService", () => {
    let questionService: QuestionGenerationService;

    beforeEach(() => {
        questionService = new QuestionGenerationService();
    });

    describe("generateQuestion", () => {
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

        it("should generate age-appropriate questions for grade level", async () => {
            const question = await questionService.generateQuestion(
                QuestionType.ADDITION,
                DifficultyLevel.EASY,
                1 // Grade 1
            );

            // Grade 1 numbers should be single digit for EASY level
            const numbers = question.question.match(/\d+/g);
            expect(numbers).toBeDefined();
            numbers?.forEach((num) => {
                expect(parseInt(num)).toBeLessThan(10);
            });
        });

        it("should include proper mathematical formatting in the question", async () => {
            const question = await questionService.generateQuestion(
                QuestionType.ADDITION,
                DifficultyLevel.EASY
            );

            expect(question.question).toMatch(/What is \d+(\s*\+\s*\d+)+\?/);
        });
    });

    describe("validateAnswer", () => {
        it("should correctly validate a student's answer", async () => {
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

        it("should provide helpful feedback for incorrect answers", async () => {
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
});
