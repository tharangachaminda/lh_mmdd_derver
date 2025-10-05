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
 * Generate AI questions based on subject, topic, and student persona
 *
 * Requires: Authentication (Student or Admin role)
 * Body: {
 *   subject: string,
 *   topic: string,
 *   subtopic?: string,
 *   difficulty: string,
 *   questionType: string,
 *   count: number,
 *   persona: StudentPersona,
 *   previousQuestions?: string[]
 * }
 */
router.post(
    "/generate",
    authenticateToken,
    requireRole([UserRole.STUDENT, UserRole.ADMIN]),
    (req: any, res: any) => questionsController.generateQuestions(req, res)
);

/**
 * GET /api/questions/subjects/:grade
 * Get available subjects and topics for a grade level
 *
 * Requires: Authentication (any role)
 */
router.get("/subjects/:grade", authenticateToken, (req, res) =>
    questionsController.getSubjectsForGrade(req, res)
);

/**
 * GET /api/questions/health
 * Health check for questions service
 *
 * Public endpoint - no authentication required
 */
router.get("/health", (req, res) => questionsController.healthCheck(req, res));

export default router;
