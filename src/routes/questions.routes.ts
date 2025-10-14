/**
 * Questions Routes
 *
 * API routes for AI question generation with persona-based personalization
 */

import { Router } from "express";
import { QuestionsController } from "../controllers/questions.controller.js";
import {
    authenticateToken,
    requireRole,
} from "../middleware/auth.middleware.js";
import { UserRole } from "../models/user.model.js";

const router = Router();
const questionsController = new QuestionsController();

/**
 * POST /api/questions/generate
 * Generate AI questions using working production authentication
 *
 * Requires: Simple Bearer token authentication
 * Body: {
 *   subject: string,
 *   topic: string,
 *   difficulty?: string,
 *   numQuestions?: number
 * }
 */
router.post(
    "/generate",
    QuestionsController.authenticateStudent,
    (req: any, res: any) => questionsController.generateQuestions(req, res)
);

/**
 * POST /api/questions/generate-enhanced
 * Generate AI questions with enhanced multi-type support
 *
 * Requires: Simple Bearer token authentication
 * Body: EnhancedQuestionGenerationRequest {
 *   subject: string,
 *   category: string,
 *   gradeLevel: number,
 *   questionTypes: string[] (1-5 types),
 *   questionFormat: QuestionFormat,
 *   difficultyLevel: DifficultyLevel,
 *   numberOfQuestions: number,
 *   learningStyle: LearningStyle,
 *   interests: string[] (1-5),
 *   motivators: string[] (0-3),
 *   focusAreas?: string[],
 *   includeExplanations?: boolean
 * }
 */
router.post(
    "/generate-enhanced",
    QuestionsController.authenticateStudent,
    (req: any, res: any) =>
        questionsController.generateQuestionsEnhanced(req, res)
);

/**
 * POST /api/questions/generate-enhanced-stream
 * Generate questions with Server-Sent Events (SSE) streaming
 *
 * Requires: Simple Bearer token authentication
 * Body: Same as /generate-enhanced
 * Response: text/event-stream with events:
 *   - question: Individual question data
 *   - complete: Generation finished
 *   - error: Error occurred
 */
router.post(
    "/generate-enhanced-stream",
    QuestionsController.authenticateStudent,
    (req: any, res: any) =>
        questionsController.generateQuestionsEnhancedStream(req, res)
);

/**
 * POST /api/questions/validate-answers
 * Validate student answers with AI grading
 *
 * Requires: Simple Bearer token authentication
 * Body: AnswerSubmission {
 *   sessionId: string,
 *   studentId: string,
 *   studentEmail: string,
 *   answers: Array<{
 *     questionId: string,
 *     questionText: string,
 *     studentAnswer: string
 *   }>,
 *   submittedAt: Date
 * }
 */
router.post(
    "/validate-answers",
    QuestionsController.authenticateStudent,
    (req: any, res: any) =>
        questionsController.validateAnswersController(req, res)
);

/**
 * GET /api/questions/subjects
 * Get available subjects for authenticated student's grade
 *
 * Requires: Simple Bearer token authentication
 */
router.get(
    "/subjects",
    QuestionsController.authenticateStudent,
    (req: any, res: any) => questionsController.getSubjectsForGrade(req, res)
);

/**
 * GET /api/questions/health
 * Health check for questions service
 *
 * Public endpoint - no authentication required
 */
router.get("/health", (req, res) => questionsController.healthCheck(req, res));

/**
 * POST /api/questions/demo
 * Demo question generation for testing
 *
 * Public endpoint - no authentication required
 */
router.post("/demo", (req, res) =>
    questionsController.demoQuestionGeneration(req, res)
);

export default router;
