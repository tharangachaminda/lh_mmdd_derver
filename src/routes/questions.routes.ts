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
    questionsController.generateQuestions
);

/**
 * GET /api/questions/persona
 * Get student persona for current user
 *
 * Requires: Authentication (Student or Admin role)
 */
router.get(
    "/persona",
    authenticateToken,
    requireRole([UserRole.STUDENT, UserRole.ADMIN]),
    questionsController.getPersona
);

/**
 * PUT /api/questions/persona
 * Update student persona for current user
 *
 * Requires: Authentication (Student or Admin role)
 * Body: {
 *   learningStyle?: string,
 *   interests?: string[],
 *   culturalContext?: string,
 *   motivationalFactors?: string[],
 *   performanceLevel?: string,
 *   preferredDifficulty?: string
 * }
 */
router.put(
    "/persona",
    authenticateToken,
    requireRole([UserRole.STUDENT, UserRole.ADMIN]),
    questionsController.updatePersona
);

/**
 * GET /api/questions/subjects
 * Get available subjects and topics for question generation
 *
 * Requires: Authentication (any role)
 */
router.get("/subjects", authenticateToken, questionsController.getSubjects);

/**
 * GET /api/questions/health
 * Health check for questions service
 *
 * Public endpoint - no authentication required
 */
router.get("/health", questionsController.healthCheck);

export default router;
