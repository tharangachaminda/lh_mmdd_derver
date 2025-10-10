/**
 * Questions Controller
 *
 * API endpoints for AI question generation with persona-based personalization
 */

import { Request, Response, NextFunction } from "express";
import { AIEnhancedQuestionsService } from "../services/questions-ai-enhanced.service.js";
import { JWTPayload } from "../services/auth.service.js";
import { UserRole } from "../models/user.model.js";
import {
    EnhancedQuestionGenerationRequest,
    validateEnhancedRequest,
} from "../interfaces/question-generation.interface.js";
import { AnswerValidationAgent } from "../agents/answer-validation.agent.js";
import { AnswerSubmissionResult } from "../models/answer-submission.model.js";

interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: UserRole;
        grade: number;
    };
}

export class QuestionsController {
    private aiQuestionsService: AIEnhancedQuestionsService;

    constructor() {
        this.aiQuestionsService = new AIEnhancedQuestionsService();
    }

    /**
     * Validate the simple token format
     */
    private static validateToken(token: string): any {
        try {
            const decoded = JSON.parse(Buffer.from(token, "base64").toString());
            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * Middleware to authenticate student token
     */
    static async authenticateStudent(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                res.status(401).json({
                    success: false,
                    message: "Authorization token required",
                });
                return;
            }

            const token = authHeader.substring(7); // Remove 'Bearer ' prefix
            const decoded = QuestionsController.validateToken(token);

            if (!decoded || !decoded.userId) {
                res.status(401).json({
                    success: false,
                    message: "Invalid token",
                });
                return;
            }

            // Add user info to request
            (req as AuthenticatedRequest).user = {
                userId: decoded.userId,
                email: decoded.email,
                role: decoded.role,
                grade: decoded.grade,
            };

            next();
        } catch (error: any) {
            console.error("❌ Authentication error:", error);
            res.status(401).json({
                success: false,
                message: "Authentication failed",
                details: error.message,
            });
        }
    }

    /**
     * Generate personalized AI questions for authenticated student (working implementation)
     */
    async generateQuestions(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            console.log(
                "🎯 Production AI question generation for user:",
                authReq.user?.email
            );

            const { subject, topic, difficulty, numQuestions } = req.body;

            // Validate required fields
            if (!subject || !topic) {
                res.status(400).json({
                    success: false,
                    message: "Subject and topic are required",
                });
                return;
            }

            // Use authenticated user's grade if not specified
            const userGrade = authReq.user?.grade || 5;
            const questionsCount = Math.min(numQuestions || 5, 10); // Max 10 questions
            const difficultyLevel = difficulty || "medium";

            console.log("📚 Generating questions:", {
                subject,
                topic,
                grade: userGrade,
                difficulty: difficultyLevel,
                count: questionsCount,
                userId: authReq.user?.userId,
            });

            // Create JWT payload from authenticated user
            const jwtPayload = {
                userId: authReq.user?.userId || "",
                email: authReq.user?.email || "",
                role: authReq.user?.role || UserRole.STUDENT,
                grade: authReq.user?.grade || 5,
            };

            // Create student persona (following demo pattern)
            const persona = {
                userId: authReq.user?.userId || "",
                grade: userGrade,
                learningStyle: "visual", // Default
                interests: [subject, "learning"],
                culturalContext: "New Zealand",
                preferredQuestionTypes: ["multiple_choice"],
                performanceLevel: difficultyLevel,
                strengths: ["problem solving"],
                improvementAreas: ["time management"],
                motivationalFactors: ["achievement", "visual feedback"],
            };

            const result = await this.aiQuestionsService.generateQuestions(
                {
                    subject,
                    topic,
                    difficulty: difficultyLevel,
                    questionType: "multiple_choice", // Default
                    count: questionsCount,
                    persona,
                    previousQuestions: [],
                } as any,
                jwtPayload
            );

            console.log(
                "✅ Generated questions successfully for production user"
            );
            res.status(200).json({
                success: true,
                message: "AI questions generated successfully",
                data: {
                    sessionId: result.sessionId,
                    questions: result.questions,
                    estimatedTotalTime: result.estimatedTotalTime,
                    personalizationSummary: result.personalizationSummary,
                },
                metrics: result.qualityMetrics,
                agentMetrics: result.agentMetrics, // Phase 1: Expose agent metrics for frontend
                user: {
                    id: authReq.user?.userId,
                    email: authReq.user?.email,
                    grade: authReq.user?.grade,
                },
            });
        } catch (error: any) {
            console.error("❌ Production question generation error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during question generation",
                details: error.message,
            });
        }
    }

    /**
     * Generate personalized AI questions with enhanced multi-type support
     *
     * This endpoint provides advanced question generation capabilities including:
     * - Multiple question types in a single request (1-5 types)
     * - All question formats (Multiple Choice, Short Answer, True/False, Fill-in-Blank)
     * - Complete persona integration (interests, motivators, learning styles)
     * - Category-based educational taxonomy
     * - Smart question distribution across types
     *
     * **Endpoint:** `POST /api/questions/generate-enhanced`
     *
     * **Authentication:** Required - Bearer token authentication
     *
     * **Request Body Schema:**
     * ```typescript
     * {
     *   subject: string,                    // e.g., "mathematics"
     *   category: string,                   // e.g., "number-operations"
     *   gradeLevel: number,                 // 1-12
     *   questionTypes: string[],            // 1-5 types, e.g., ["ADDITION", "SUBTRACTION"]
     *   questionFormat: QuestionFormat,     // MULTIPLE_CHOICE | SHORT_ANSWER | TRUE_FALSE | FILL_IN_BLANK
     *   difficultyLevel: DifficultyLevel,   // EASY | MEDIUM | HARD
     *   numberOfQuestions: number,          // Total questions to generate
     *   learningStyle: LearningStyle,       // VISUAL | AUDITORY | KINESTHETIC | READING_WRITING
     *   interests: string[],                // 1-5 interests for personalization
     *   motivators: string[],               // 0-3 motivators for engagement
     *   focusAreas?: string[],              // Optional: Specific skills
     *   includeExplanations?: boolean       // Optional: Add step-by-step solutions
     * }
     * ```
     *
     * **Success Response (200):**
     * ```typescript
     * {
     *   success: true,
     *   message: "Successfully generated N questions",
     *   data: {
     *     sessionId: string,
     *     questions: GeneratedQuestion[],
     *     typeDistribution: { [type: string]: number },
     *     categoryContext: string,
     *     personalizationApplied: {
     *       interests: string[],
     *       motivators: string[],
     *       learningStyle: string
     *     },
     *     totalQuestions: number,
     *     qualityMetrics: object
     *   },
     *   user: { id, email, grade }
     * }
     * ```
     *
     * **Error Responses:**
     * - `400` - Validation error (invalid request body)
     * - `401` - Authentication required (missing/invalid token)
     * - `500` - Server error during generation
     *
     * **Validation Rules:**
     * - `questionTypes`: 1-5 types required
     * - `interests`: 1-5 items required
     * - `motivators`: 0-3 items maximum
     * - `category`: Required for enhanced generation
     * - `gradeLevel`: 1-12 range
     *
     * **Question Distribution:**
     * Questions are distributed evenly across selected types:
     * - 10 questions / 2 types = 5 each
     * - 10 questions / 3 types = 4, 3, 3 (first type gets extra)
     * - 3 questions / 4 types = 1, 1, 1, 0 (last type gets 0)
     *
     * @param req - Express request containing EnhancedQuestionGenerationRequest in body
     * @param res - Express response object
     *
     * @returns Promise<void> - Sends JSON response with generated questions or error
     *
     * @throws {400} Validation error - Invalid request body
     * @throws {401} Authentication error - Missing or invalid token
     * @throws {500} Server error - Question generation failed
     *
     * @example
     * ```typescript
     * // Example request
     * POST /api/questions/generate-enhanced
     * Authorization: Bearer <token>
     * {
     *   subject: "mathematics",
     *   category: "number-operations",
     *   gradeLevel: 5,
     *   questionTypes: ["ADDITION", "SUBTRACTION"],
     *   questionFormat: "MULTIPLE_CHOICE",
     *   difficultyLevel: "MEDIUM",
     *   numberOfQuestions: 10,
     *   learningStyle: "VISUAL",
     *   interests: ["Sports", "Gaming"],
     *   motivators: ["Competition", "Achievement"]
     * }
     *
     * // Example response
     * {
     *   success: true,
     *   message: "Successfully generated 10 questions",
     *   data: {
     *     sessionId: "sess_abc123",
     *     questions: [...],
     *     typeDistribution: { ADDITION: 5, SUBTRACTION: 5 },
     *     categoryContext: "number-operations",
     *     personalizationApplied: {
     *       interests: ["Sports", "Gaming"],
     *       motivators: ["Competition", "Achievement"],
     *       learningStyle: "VISUAL"
     *     },
     *     totalQuestions: 10,
     *     qualityMetrics: { ... }
     *   }
     * }
     * ```
     *
     * @see EnhancedQuestionGenerationRequest for complete request schema
     * @see validateEnhancedRequest for validation logic
     * @see AIEnhancedQuestionsService.generateQuestionsEnhanced for generation logic
     *
     * @since 1.0.0 - Session 08 Phase A3
     * @version 1.0.0
     */
    async generateQuestionsEnhanced(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;

            // Check authentication
            if (!authReq.user) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
                return;
            }

            console.log(
                "🎯 Enhanced AI question generation for user:",
                authReq.user?.email
            );

            const enhancedRequest =
                req.body as EnhancedQuestionGenerationRequest;

            // Validate enhanced request
            const validation = validateEnhancedRequest(enhancedRequest);
            if (!validation.isValid) {
                res.status(400).json({
                    success: false,
                    message: validation.errors.join("; "),
                    errors: validation.errors,
                });
                return;
            }

            console.log("📚 Generating enhanced questions:", {
                subject: enhancedRequest.subject,
                category: enhancedRequest.category,
                questionTypes: enhancedRequest.questionTypes,
                format: enhancedRequest.questionFormat,
                difficulty: enhancedRequest.difficultyLevel,
                count: enhancedRequest.numberOfQuestions,
                interests: enhancedRequest.interests,
                motivators: enhancedRequest.motivators,
                learningStyle: enhancedRequest.learningStyle,
                userId: authReq.user?.userId,
            });

            // Create JWT payload from authenticated user
            const jwtPayload: JWTPayload = {
                userId: authReq.user.userId,
                email: authReq.user.email,
                role: authReq.user.role,
            };

            // Generate questions using enhanced service
            const result =
                await this.aiQuestionsService.generateQuestionsEnhanced(
                    enhancedRequest,
                    jwtPayload
                );

            console.log(
                "✅ Enhanced questions generated successfully:",
                result.totalQuestions,
                "questions across",
                enhancedRequest.questionTypes.length,
                "types"
            );

            res.status(200).json({
                success: true,
                message: `Successfully generated ${result.totalQuestions} questions`,
                data: {
                    sessionId: result.sessionId,
                    questions: result.questions,
                    typeDistribution: result.typeDistribution,
                    categoryContext: result.categoryContext,
                    personalizationApplied: result.personalizationApplied,
                    totalQuestions: result.totalQuestions,
                    qualityMetrics: result.qualityMetrics,
                },
                user: {
                    id: authReq.user.userId,
                    email: authReq.user.email,
                    grade: authReq.user.grade,
                },
            });
        } catch (error: any) {
            console.error("❌ Enhanced question generation error:", error);
            res.status(500).json({
                success: false,
                message:
                    "Internal server error during enhanced question generation",
                details: error.message,
            });
        }
    }

    /**
     * Get available subjects for the authenticated student's grade (working implementation)
     */
    async getSubjectsForGrade(req: Request, res: Response): Promise<void> {
        try {
            const authReq = req as AuthenticatedRequest;
            const userGrade = authReq.user?.grade || 5;

            // Define subjects available for each grade
            const subjectsByGrade: Record<number, string[]> = {
                5: ["mathematics", "english", "science", "social-studies"],
                6: ["mathematics", "english", "science", "social-studies"],
                7: ["mathematics", "english", "science", "social-studies"],
                8: [
                    "mathematics",
                    "english",
                    "science",
                    "social-studies",
                    "technology",
                ],
                9: [
                    "mathematics",
                    "english",
                    "science",
                    "social-studies",
                    "technology",
                ],
                10: [
                    "mathematics",
                    "english",
                    "science",
                    "social-studies",
                    "technology",
                ],
            };

            const availableSubjects =
                subjectsByGrade[userGrade] || subjectsByGrade[5];

            res.status(200).json({
                success: true,
                message: "Available subjects retrieved",
                data: {
                    grade: userGrade,
                    subjects: availableSubjects,
                    user: {
                        id: authReq.user?.userId,
                        email: authReq.user?.email,
                        grade: authReq.user?.grade,
                    },
                },
            });
        } catch (error: any) {
            console.error("❌ Error getting subjects:", error);
            res.status(500).json({
                success: false,
                message: "Failed to get available subjects",
                details: error.message,
            });
        }
    }

    /**
     * Health check endpoint
     * GET /api/questions/health
     */
    async healthCheck(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            success: true,
            message: "AI Question Generation Service is operational",
            data: {
                service: "questions-ai-enhanced",
                status: "healthy",
                timestamp: new Date().toISOString(),
            },
        });
    }

    /**
     * Demo question generation (no auth required for testing)
     * POST /api/questions/demo
     */
    async demoQuestionGeneration(req: Request, res: Response): Promise<void> {
        try {
            console.log("🎯 Demo Question Generation Request");

            // Create demo request
            const demoRequest = {
                subject: req.body.subject || "mathematics",
                topic: req.body.topic || "Fractions & Decimals",
                difficulty: req.body.difficulty || "intermediate",
                questionType: req.body.questionType || "multiple_choice",
                count: Math.min(req.body.count || 2, 3), // Limit to 3 for demo
                persona: {
                    userId: "demo-user",
                    grade: req.body.grade || 5,
                    learningStyle: req.body.learningStyle || "visual",
                    interests: req.body.interests || ["mathematics", "puzzles"],
                    culturalContext: req.body.culturalContext || "New Zealand",
                    preferredQuestionTypes: ["multiple_choice"],
                    performanceLevel: "intermediate",
                    strengths: ["logical thinking"],
                    improvementAreas: ["word problems"],
                    motivationalFactors: ["achievement", "visual feedback"],
                },
                previousQuestions: [],
            };

            // Create demo JWT payload
            const demoJwtPayload = {
                userId: "demo-user-id",
                email: "demo@example.com",
                role: "STUDENT" as any,
                grade: demoRequest.persona.grade,
                country: demoRequest.persona.culturalContext,
            };

            console.log("🚀 Generating demo AI-enhanced questions...");

            // Generate questions using AI-enhanced service
            const result = await this.aiQuestionsService.generateQuestions(
                demoRequest as any,
                demoJwtPayload
            );

            console.log("✅ Demo questions generated successfully");

            res.status(200).json({
                success: true,
                message: `Successfully generated ${result.questions.length} AI-enhanced demo questions`,
                data: result,
                demo: true,
            });
        } catch (error: any) {
            console.error("❌ Demo question generation error:", error);
            res.status(500).json({
                success: false,
                message: "Demo generation failed",
                data: null,
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }

    /**
     * Validate student answers with AI grading
     *
     * POST /api/questions/validate-answers
     *
     * Accepts student answer submission, validates each answer using AI,
     * provides partial credit scoring (0-10), generates constructive feedback,
     * analyzes performance patterns, and saves results to MongoDB.
     *
     * @param req - Express request with AnswerSubmission in body
     * @param res - Express response
     *
     * @returns {Promise<void>} Response with ValidationResult
     *
     * @throws {400} Validation errors (missing required fields)
     * @throws {401} Authentication required
     * @throws {500} AI validation or database errors
     *
     * @example
     * ```typescript
     * // Request body
     * {
     *   sessionId: "session-123",
     *   studentId: "student-456",
     *   studentEmail: "student@example.com",
     *   answers: [
     *     {
     *       questionId: "q1",
     *       questionText: "What is 5 + 3?",
     *       studentAnswer: "8"
     *     }
     *   ],
     *   submittedAt: "2025-10-10T10:00:00Z"
     * }
     *
     * // Response
     * {
     *   success: true,
     *   data: {
     *     sessionId: "session-123",
     *     totalScore: 10,
     *     maxScore: 10,
     *     percentageScore: 100,
     *     questions: [...],
     *     overallFeedback: "Excellent work!...",
     *     strengths: ["Addition operations"],
     *     areasForImprovement: []
     *   }
     * }
     * ```
     */
    async validateAnswersController(
        req: Request,
        res: Response
    ): Promise<void> {
        const startTime = Date.now();

        try {
            const authReq = req as AuthenticatedRequest;
            console.log(
                "🧪 Answer validation request from:",
                authReq.user?.email
            );

            // Extract submission from request body
            const { sessionId, studentId, studentEmail, answers, submittedAt } =
                req.body;

            // Validate required fields
            if (
                !sessionId ||
                !studentId ||
                !studentEmail ||
                !answers ||
                !Array.isArray(answers)
            ) {
                res.status(400).json({
                    success: false,
                    message: "Invalid answer submission",
                    errors: [
                        !sessionId && "sessionId is required",
                        !studentId && "studentId is required",
                        !studentEmail && "studentEmail is required",
                        !answers && "answers array is required",
                        answers &&
                            !Array.isArray(answers) &&
                            "answers must be an array",
                    ].filter(Boolean),
                });
                return;
            }

            // Validate answers array not empty
            if (answers.length === 0) {
                res.status(400).json({
                    success: false,
                    message: "At least one answer is required",
                });
                return;
            }

            // Validate each answer has required fields
            for (let i = 0; i < answers.length; i++) {
                const answer = answers[i];
                if (
                    !answer.questionId ||
                    !answer.questionText ||
                    !answer.studentAnswer
                ) {
                    res.status(400).json({
                        success: false,
                        message: `Answer ${i + 1} is missing required fields`,
                        errors: [
                            !answer.questionId && "questionId is required",
                            !answer.questionText && "questionText is required",
                            !answer.studentAnswer &&
                                "studentAnswer is required",
                        ].filter(Boolean),
                    });
                    return;
                }
            }

            console.log("📝 Validating answers:", {
                sessionId,
                studentEmail,
                answerCount: answers.length,
            });

            // Create agent and validate answers
            const agent = new AnswerValidationAgent();
            const validationResult = await agent.validateAnswers({
                sessionId,
                studentId,
                studentEmail,
                answers,
                submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
            });

            const validationTime = Date.now() - startTime;

            // Save results to MongoDB
            try {
                const submissionResult = new AnswerSubmissionResult({
                    sessionId,
                    studentId,
                    studentEmail,
                    submittedAt: submittedAt
                        ? new Date(submittedAt)
                        : new Date(),
                    validatedAt: new Date(),
                    totalScore: validationResult.totalScore,
                    maxScore: validationResult.maxScore,
                    percentageScore: validationResult.percentageScore,
                    questions: validationResult.questions.map((q) => ({
                        id: q.questionId,
                        questionText: q.questionText,
                        questionType: "SHORT_ANSWER", // Default for now
                        difficulty: "medium", // Default for now
                        studentAnswer: q.studentAnswer,
                        score: q.score,
                        maxScore: q.maxScore,
                        isCorrect: q.isCorrect,
                        expectedAnswer: "", // AI doesn't provide this
                        feedback: q.feedback,
                        partialCreditReason:
                            q.score > 0 && q.score < q.maxScore
                                ? `Partial credit: ${q.score}/${q.maxScore} points`
                                : undefined,
                    })),
                    overallFeedback: validationResult.overallFeedback,
                    strengths: validationResult.strengths,
                    areasForImprovement: validationResult.areasForImprovement,
                    qualityMetrics: {
                        modelUsed: "qwen3:14b",
                        validationTime,
                        confidenceScore: 0.85, // Default confidence
                    },
                });

                await submissionResult.save();
                console.log(
                    "✅ Results saved to MongoDB:",
                    submissionResult._id
                );
            } catch (dbError) {
                console.error("⚠️ Failed to save to MongoDB:", dbError);
                // Continue - validation still succeeded
            }

            // Return validation results
            res.status(200).json({
                success: true,
                message: `Successfully validated ${answers.length} answers`,
                data: validationResult,
            });
        } catch (error: any) {
            console.error("❌ Answer validation failed:", error);
            res.status(500).json({
                success: false,
                message: "Answer validation failed",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }
}
