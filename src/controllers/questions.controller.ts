/**
 * Questions Controller
 *
 * API endpoints for AI question generation with persona-based personalization
 */

import { Request, Response } from "express";
import { AIEnhancedQuestionsService } from "../services/questions-ai-enhanced.service.js";
import { JWTPayload } from "../services/auth.service.js";

interface AuthenticatedRequest extends Request {
    user?: JWTPayload;
}

export class QuestionsController {
    private aiQuestionsService: AIEnhancedQuestionsService;

    constructor() {
        this.aiQuestionsService = new AIEnhancedQuestionsService();
    }

    /**
     * Generate AI-enhanced questions with persona-based personalization
     * POST /api/questions/generate
     */
    async generateQuestions(
        req: AuthenticatedRequest,
        res: Response
    ): Promise<void> {
        try {
            console.log("🎯 Generate Questions Request:", {
                body: req.body,
                user: req.user,
            });

            // Validate request body
            if (!req.body || typeof req.body !== "object") {
                res.status(400).json({
                    success: false,
                    message: "Invalid request body",
                    data: null,
                });
                return;
            }

            const {
                subject,
                topic,
                subtopic,
                difficulty,
                questionType,
                count,
                persona,
            } = req.body;

            // Validate required fields
            if (
                !subject ||
                !topic ||
                !difficulty ||
                !questionType ||
                !count ||
                !persona
            ) {
                res.status(400).json({
                    success: false,
                    message:
                        "Missing required fields: subject, topic, difficulty, questionType, count, persona",
                    data: null,
                });
                return;
            }

            // Validate count
            if (typeof count !== "number" || count < 1 || count > 10) {
                res.status(400).json({
                    success: false,
                    message: "Count must be a number between 1 and 10",
                    data: null,
                });
                return;
            }

            // Create question generation request
            const questionRequest = {
                subject,
                topic,
                subtopic,
                difficulty,
                questionType,
                count,
                persona,
                previousQuestions: req.body.previousQuestions || [],
            };

            console.log(
                "🚀 Generating AI-enhanced questions...",
                questionRequest
            );

            // Validate user authentication
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: "Authentication required",
                    data: null,
                });
                return;
            }

            // Generate questions using AI-enhanced service
            const result = await this.aiQuestionsService.generateQuestions(
                questionRequest,
                req.user
            );

            console.log("✅ Questions generated successfully");

            res.status(200).json({
                success: true,
                message: `Successfully generated ${result.questions.length} AI-enhanced questions`,
                data: result,
            });
        } catch (error: any) {
            console.error("❌ Question generation error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during question generation",
                data: null,
                error:
                    process.env.NODE_ENV === "development"
                        ? error.message
                        : undefined,
            });
        }
    }

    /**
     * Get available subjects and topics for a grade level
     * GET /api/questions/subjects/:grade
     */
    async getSubjectsForGrade(req: Request, res: Response): Promise<void> {
        try {
            const grade = parseInt(req.params.grade);

            if (isNaN(grade) || grade < 3 || grade > 8) {
                res.status(400).json({
                    success: false,
                    message: "Grade must be between 3 and 8",
                    data: null,
                });
                return;
            }

            // Simplified subjects response
            const subjects = {
                mathematics: ["Numbers", "Algebra", "Geometry", "Statistics"],
                science: ["Physics", "Chemistry", "Biology", "Earth Science"],
                english: ["Reading", "Writing", "Grammar", "Literature"],
                social_studies: ["History", "Geography", "Civics", "Culture"],
            };

            res.status(200).json({
                success: true,
                message: `Available subjects for grade ${grade}`,
                data: subjects,
            });
        } catch (error: any) {
            console.error("❌ Error getting subjects:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                data: null,
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
}
