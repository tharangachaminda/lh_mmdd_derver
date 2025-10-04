/**
 * Curriculum Routes
 *
 * HTTP routes for curriculum data management, question search,
 * vector similarity operations, and content recommendations.
 *
 * @fileoverview Curriculum API routes
 * @version 1.0.0
 */

import { Router, Request, Response } from "express";
import { curriculumController } from "../controllers/curriculum.controller.js";

/**
 * Curriculum Routes
 *
 * Defines HTTP routes for curriculum data operations including:
 * - Question search and similarity search
 * - Content recommendations and curriculum alignment
 * - Administrative operations (bulk ingestion, health monitoring)
 */

const router = Router();

// Question search endpoint
router.get("/search", (req: Request, res: Response) => {
    curriculumController.searchQuestions(req, res);
});

// Similarity search endpoint
router.post("/similar", (req: Request, res: Response) => {
    curriculumController.findSimilarQuestions(req, res);
});

// Content recommendations endpoint
router.post("/recommendations", (req: Request, res: Response) => {
    curriculumController.getContentRecommendations(req, res);
});

// Curriculum alignment endpoint
router.post("/align", (req: Request, res: Response) => {
    curriculumController.getCurriculumAlignment(req, res);
});

// Administrative endpoints
router.post("/admin/ingest", (req: Request, res: Response) => {
    curriculumController.performBulkIngestion(req, res);
});

router.get("/admin/health", (req: Request, res: Response) => {
    curriculumController.getHealthStatus(req, res);
});

router.get("/admin/stats", (req: Request, res: Response) => {
    curriculumController.getStatistics(req, res);
});

export default router;
