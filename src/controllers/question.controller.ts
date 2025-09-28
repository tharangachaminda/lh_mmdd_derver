import { Request, Response } from "express";
import { QuestionGenerationService } from "../services/questionGeneration.service.js";
import { QuestionType, DifficultyLevel, Question } from "../models/question.js";

export class QuestionController {
    private questionService: QuestionGenerationService;

    constructor() {
        this.questionService = new QuestionGenerationService();
    }

    public generateQuestion = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { grade, type, difficulty, context, count } = req.body;

            // Validate required parameters
            if (!grade || isNaN(Number(grade))) {
                res.status(400).json({
                    error: "Valid grade parameter is required",
                });
                return;
            }

            // Validate and set count parameter
            let questionCount = 1; // default value
            if (count !== undefined) {
                if (isNaN(Number(count)) || Number(count) < 1 || Number(count) > 10) {
                    res.status(400).json({
                        error: "Count must be between 1 and 10",
                    });
                    return;
                }
                questionCount = Number(count);
            }

            // Convert and validate type
            const normalizedType = type ? String(type).toLowerCase() : "";
            const questionType =
                Object.values(QuestionType).find(
                    (t) => t.toLowerCase() === normalizedType
                ) || QuestionType.ADDITION;

            // Convert and validate difficulty
            const normalizedDifficulty = difficulty
                ? String(difficulty).toLowerCase()
                : "";
            const difficultyLevel =
                Object.values(DifficultyLevel).find(
                    (d) => d.toLowerCase() === normalizedDifficulty
                ) || DifficultyLevel.EASY;

            const gradeNumber = Number(grade);

            // Generate multiple questions if count > 1
            if (questionCount === 1) {
                const question = await this.questionService.generateQuestion(
                    questionType || QuestionType.ADDITION,
                    difficultyLevel || DifficultyLevel.EASY,
                    gradeNumber
                );
                res.status(200).json(question);
            } else {
                // Generate multiple questions
                const questions = [];
                for (let i = 0; i < questionCount; i++) {
                    const question = await this.questionService.generateQuestion(
                        questionType || QuestionType.ADDITION,
                        difficultyLevel || DifficultyLevel.EASY,
                        gradeNumber
                    );
                    questions.push(question);
                }
                res.status(200).json({
                    questions,
                    count: questions.length,
                    metadata: {
                        grade: gradeNumber,
                        type: questionType,
                        difficulty: difficultyLevel,
                        context: context || null,
                    },
                });
            }
        } catch (error) {
            res.status(500).json({
                error: "Internal server error",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    private questions = new Map<string, Question>();

    public validateAnswer = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { questionId, answer } = req.body;

            // Validate required fields
            if (!questionId || answer === undefined) {
                res.status(400).json({
                    error: "Question ID and answer are required",
                });
                return;
            }

            // For now, we'll use a mock question since we don't have persistence
            // In a real implementation, we'd fetch this from a database
            const mockQuestion: Question = {
                id: questionId,
                type: QuestionType.ADDITION,
                difficulty: DifficultyLevel.EASY,
                grade: 5,
                question: "What is 5 + 5?",
                answer: 10,
                createdAt: new Date(),
            };

            const validationResult = await this.questionService.validateAnswer(
                mockQuestion,
                answer
            );
            res.status(200).json(validationResult);
        } catch (error) {
            res.status(500).json({
                error: "Internal server error",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    };
}
