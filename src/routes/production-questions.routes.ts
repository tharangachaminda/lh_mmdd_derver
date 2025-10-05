/**
 * Production Questions Routes
 * Authenticated endpoints for real student AI question generation
 */

import { Router } from "express";
import { ProductionQuestionsController } from "../controllers/production-questions.controller.js";

const router = Router();

/**
 * @swagger
 * /api/production-questions/health:
 *   get:
 *     summary: Health check for production questions service
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/health", ProductionQuestionsController.healthCheck);

/**
 * @swagger
 * /api/production-questions/generate:
 *   post:
 *     summary: Generate personalized AI questions for authenticated student
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - topic
 *             properties:
 *               subject:
 *                 type: string
 *                 description: Subject area (e.g., mathematics, english, science)
 *               topic:
 *                 type: string
 *                 description: Specific topic within the subject
 *               difficulty:
 *                 type: string
 *                 enum: [easy, medium, hard]
 *                 default: medium
 *               numQuestions:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 5
 *     responses:
 *       200:
 *         description: AI questions generated successfully
 *       401:
 *         description: Authentication required
 *       400:
 *         description: Invalid request parameters
 *       500:
 *         description: Server error
 */
router.post(
    "/generate",
    ProductionQuestionsController.authenticateStudent,
    ProductionQuestionsController.generateQuestions
);

/**
 * @swagger
 * /api/production-questions/subjects:
 *   get:
 *     summary: Get available subjects for the authenticated student's grade
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available subjects retrieved
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get(
    "/subjects",
    ProductionQuestionsController.authenticateStudent,
    ProductionQuestionsController.getSubjectsForGrade
);

export default router;
