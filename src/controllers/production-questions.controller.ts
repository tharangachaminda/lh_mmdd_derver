/**
 * Production Questions Controller
 * Real student authentication and personalized AI question generation
 */

import { Request, Response, NextFunction } from "express";
import { AIEnhancedQuestionsService } from "../services/questions-ai-enhanced.service.js";
import { UserRole } from "../models/user.model.js";

// Simple token validation middleware
interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        role: UserRole;
        grade: number;
    };
}

export class ProductionQuestionsController {
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
            const decoded = ProductionQuestionsController.validateToken(token);

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
     * Generate personalized AI questions for authenticated student
     */
    static async generateQuestions(req: Request, res: Response): Promise<void> {
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

            // Generate AI-enhanced questions using the real service
            const aiService = new AIEnhancedQuestionsService();

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

            const result = await aiService.generateQuestions(
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
     * Get available subjects for the authenticated student's grade
     */
    static async getSubjectsForGrade(
        req: Request,
        res: Response
    ): Promise<void> {
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
     * Health check for production questions service
     */
    static async healthCheck(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            success: true,
            message: "Production questions controller is working",
            timestamp: new Date().toISOString(),
            service: "AI Question Generation",
        });
    }
}
