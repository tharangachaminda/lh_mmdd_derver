import { Request, Response } from "express";
import { QuestionGenerationService } from "../services/questionGeneration.service.js";
import { AgenticQuestionService } from "../services/agentic-question.service.js";
import { SimplifiedQuestionService } from "../services/simplified-question.service.js";
import { QuestionType, DifficultyLevel, Question } from "../models/question.js";
import {
    MainQuestionType,
    QuestionGenerationRequestSchema,
    convertLegacyToMainType,
} from "../models/simplified-question-types.js";

export class QuestionController {
    private questionService: QuestionGenerationService;
    private agenticService: AgenticQuestionService;
    private simplifiedService: SimplifiedQuestionService;

    constructor() {
        this.questionService = new QuestionGenerationService();
        this.agenticService = new AgenticQuestionService();
        this.simplifiedService = new SimplifiedQuestionService();
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
                if (
                    isNaN(Number(count)) ||
                    Number(count) < 1 ||
                    Number(count) > 10
                ) {
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

            // Generate questions using agentic workflow
            try {
                if (questionCount === 1) {
                    // Generate single question using agentic workflow
                    const agenticResult =
                        await this.agenticService.generateSingleQuestion({
                            type: questionType || QuestionType.ADDITION,
                            difficulty: difficultyLevel || DifficultyLevel.EASY,
                            grade: gradeNumber,
                        });

                    if (agenticResult.question) {
                        res.status(200).json({
                            ...agenticResult.question,
                            agenticMetadata: {
                                workflowUsed: true,
                                qualityChecks:
                                    agenticResult.metadata.qualityChecks,
                                vectorContext:
                                    agenticResult.metadata.vectorContext,
                                workflowPerformance:
                                    agenticResult.metadata.workflow,
                            },
                        });
                        return;
                    }
                } else {
                    // Generate multiple questions using agentic workflow
                    const agenticResult =
                        await this.agenticService.generateQuestions({
                            type: questionType || QuestionType.ADDITION,
                            difficulty: difficultyLevel || DifficultyLevel.EASY,
                            grade: gradeNumber,
                            count: questionCount,
                        });

                    if (agenticResult.questions.length > 0) {
                        res.status(200).json({
                            questions: agenticResult.questions,
                            count: agenticResult.questions.length,
                            agenticMetadata: {
                                workflowUsed: true,
                                qualityChecks:
                                    agenticResult.metadata.qualityChecks,
                                vectorContext:
                                    agenticResult.metadata.vectorContext,
                                enhancedQuestions:
                                    agenticResult.metadata.enhancedQuestions,
                                workflowPerformance:
                                    agenticResult.metadata.workflow,
                            },
                        });
                        return;
                    }
                }

                // Fallback to basic service if agentic workflow fails
                console.warn(
                    "Agentic workflow failed, falling back to basic service"
                );
            } catch (agenticError) {
                console.error("Agentic workflow error:", agenticError);
                console.warn(
                    "Falling back to basic question generation service"
                );
            }

            // Fallback: Generate using basic service
            if (questionCount === 1) {
                const question = await this.questionService.generateQuestion(
                    questionType || QuestionType.ADDITION,
                    difficultyLevel || DifficultyLevel.EASY,
                    gradeNumber
                );
                res.status(200).json({
                    ...question,
                    agenticMetadata: {
                        workflowUsed: false,
                        fallbackReason: "Agentic workflow unavailable",
                    },
                });
            } else {
                // Generate multiple questions using basic service
                const questions = [];
                for (let i = 0; i < questionCount; i++) {
                    const question =
                        await this.questionService.generateQuestion(
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
                    agenticMetadata: {
                        workflowUsed: false,
                        fallbackReason: "Agentic workflow unavailable",
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

    /**
     * Generate questions using simplified main types with intelligent sub-type selection
     */
    public generateQuestionsSimplified = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            // Validate request body with Zod
            const validatedRequest = QuestionGenerationRequestSchema.parse(
                req.body
            );

            console.log(
                "🚀 Simplified question generation request:",
                validatedRequest
            );

            // Generate questions using simplified service
            const result = await this.simplifiedService.generateQuestions(
                validatedRequest
            );

            console.log("✅ Simplified questions generated:", {
                count: result.questions.length,
                subTypes: result.metadata.subTypesUsed,
                generationTime: result.metadata.generationTime,
            });

            res.status(200).json({
                success: true,
                ...result,
                apiVersion: "simplified-v1",
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error("❌ Simplified question generation error:", error);

            if (error instanceof Error && error.name === "ZodError") {
                res.status(400).json({
                    success: false,
                    error: "Invalid request format",
                    details: error.message,
                    apiVersion: "simplified-v1",
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: "Failed to generate questions",
                details:
                    error instanceof Error ? error.message : "Unknown error",
                apiVersion: "simplified-v1",
            });
        }
    };

    /**
     * Get available question types and sub-types for a grade
     */
    public getAvailableTypes = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { grade } = req.query;

            if (!grade || isNaN(Number(grade))) {
                res.status(400).json({
                    success: false,
                    error: "Valid grade parameter is required",
                });
                return;
            }

            const gradeNumber = Number(grade);
            const mainTypes = this.simplifiedService.getMainTypes();

            const availableTypes = mainTypes.map((mainType) => ({
                mainType,
                subTypes: this.simplifiedService.getAvailableSubTypes(
                    mainType,
                    gradeNumber
                ),
                description: this.getMainTypeDescription(mainType),
            }));

            res.status(200).json({
                success: true,
                grade: gradeNumber,
                availableTypes,
                apiVersion: "simplified-v1",
                timestamp: new Date().toISOString(),
            });
        } catch (error) {
            console.error("Error getting available types:", error);
            res.status(500).json({
                success: false,
                error: "Failed to get available types",
                details:
                    error instanceof Error ? error.message : "Unknown error",
            });
        }
    };

    /**
     * Get description for main question types
     */
    private getMainTypeDescription(mainType: MainQuestionType): string {
        const descriptions = {
            [MainQuestionType.ADDITION]:
                "Adding numbers together to find the sum",
            [MainQuestionType.SUBTRACTION]:
                "Taking away one number from another to find the difference",
            [MainQuestionType.MULTIPLICATION]:
                "Repeated addition or finding the product of numbers",
            [MainQuestionType.DIVISION]:
                "Splitting a number into equal parts or finding how many times one number fits into another",
            [MainQuestionType.PATTERN_RECOGNITION]:
                "Identifying and continuing patterns in numbers, shapes, or sequences",
        };

        return descriptions[mainType] || "Mathematical problem solving";
    }
}
