/**
 * Subject-Agnostic Educational Content Routes
 *
 * HTTP routes for educational content management across all subjects.
 * Provides both modern subject-agnostic endpoints and legacy compatibility.
 *
 * @fileoverview Core API routes for educational content
 * @version 2.0.0 - Subject-agnostic refactor
 */

import { Router } from "express";
import { EducationalContentController } from "../controllers/educational-content.controller.js";

const router = Router();
const contentController = new EducationalContentController();

// === MODERN SUBJECT-AGNOSTIC ENDPOINTS ===

/**
 * POST /api/content/generate
 * Generate educational content for any subject
 *
 * Body: {
 *   subject: 'mathematics' | 'science' | 'english' | 'social_studies',
 *   grade: number,
 *   topic: string,
 *   subtopic?: string,
 *   difficulty: 'easy' | 'medium' | 'hard',
 *   format: 'multiple_choice' | 'short_answer' | 'calculation' | ...,
 *   count?: number,
 *   context?: string,
 *   curriculum?: string
 * }
 */
router.post("/generate", contentController.generateContent);

/**
 * GET /api/content/:id
 * Get specific educational content by ID
 */
router.get("/:id", contentController.getContent);

/**
 * GET /api/content/search
 * Search educational content across subjects
 *
 * Query params:
 * - query: string (required)
 * - subject?: Subject
 * - grade?: number
 * - difficulty?: DifficultyLevel
 * - limit?: number (default: 10)
 * - offset?: number (default: 0)
 */
router.get("/search", contentController.searchContent);

/**
 * GET /api/content/curriculum/:subject/:grade
 * Get curriculum information for a subject and grade
 */
router.get("/curriculum/:subject/:grade", contentController.getCurriculumInfo);

// === LEGACY MATHEMATICS ENDPOINTS (Backward Compatibility) ===

/**
 * POST /api/v1/mathematics/generate
 * Legacy mathematics question generation (maintains exact backward compatibility)
 *
 * @deprecated Use POST /api/v1/content/generate with subject=MATHEMATICS instead
 */
router.post("/generate", contentController.generateMathQuestion);

/**
 * POST /api/content/math/generate
 * Alternative legacy mathematics endpoint
 *
 * @deprecated Use POST /api/v1/content/generate with subject=MATHEMATICS instead
 */
router.post("/math/generate", contentController.generateMathQuestion);

export default router;
