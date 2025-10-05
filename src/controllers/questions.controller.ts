/**
 * Questions Controller
 *
 * API endpoints for AI question generation with persona-based personalization
 */

import { Request, Response } from "express";
import {
    QuestionsService,
    QuestionGenerationRequest,
} from "../services/questions.service.js";

export class QuestionsController {
    private questionsService = new QuestionsService();

    /**
     * Generate AI questions based on subject, topic, and student persona
     *
     * @param req Request with question generation parameters
     * @param res Response with generated questions
     * @returns Generated questions with session ID
     * @throws 400 if validation fails
     * @throws 500 if generation fails
     * @example
     * POST /api/questions/generate
     * {
     *   "subject": "mathematics",
     *   "topic": "algebra",
     *   "difficulty": "medium",
     *   "questionType": "multiple_choice",
     *   "count": 5,
     *   "persona": {
     *     "learningStyle": "visual",
     *     "interests": ["sports", "technology"],
     *     "culturalContext": "Western",
     *     "motivationalFactors": ["achievement", "curiosity"]
     *   }
     * }
     */
    generateQuestions = async (req: Request, res: Response) => {
        try {
            const {
                subject,
                topic,
                subtopic,
                difficulty,
                questionType,
                count,
                persona,
                previousQuestions,
            } = req.body;

            // Validation
            if (
                !subject ||
                !topic ||
                !difficulty ||
                !questionType ||
                !count ||
                !persona
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Missing required fields: subject, topic, difficulty, questionType, count, persona",
                });
            }

            if (count < 1 || count > 20) {
                return res.status(400).json({
                    success: false,
                    message: "Question count must be between 1 and 20",
                });
            }

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            // Prepare request
            const generationRequest: QuestionGenerationRequest = {
                subject,
                topic,
                subtopic,
                difficulty,
                questionType,
                count: parseInt(count),
                persona,
                previousQuestions: previousQuestions || [],
            };

            // Generate questions
            const result = await this.questionsService.generateQuestions(
                generationRequest,
                req.user
            );

            res.status(200).json({
                success: true,
                message: "Questions generated successfully",
                data: result,
            });
        } catch (error: any) {
            console.error("Question generation error:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to generate questions",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.stack
                        : undefined,
            });
        }
    };

    /**
     * Get student persona for current user
     *
     * @param req Authenticated request
     * @param res Response with persona data
     * @returns Student persona or null if not found
     * @throws 401 if not authenticated
     * @throws 500 if database error
     * @example
     * GET /api/questions/persona
     * Response:
     * {
     *   "success": true,
     *   "data": {
     *     "userId": "user123",
     *     "learningStyle": "visual",
     *     "interests": ["sports", "technology"]
     *   }
     * }
     */
    getPersona = async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            const persona = await this.questionsService.getStudentPersona(
                req.user!.userId
            );

            res.status(200).json({
                success: true,
                message: persona ? "Persona found" : "No persona found",
                data: persona,
            });
        } catch (error: any) {
            console.error("Error fetching persona:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch persona",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.stack
                        : undefined,
            });
        }
    };

    /**
     * Update student persona for current user
     *
     * @param req Request with persona data
     * @param res Response with updated persona
     * @returns Updated student persona
     * @throws 400 if validation fails
     * @throws 401 if not authenticated
     * @throws 500 if update fails
     * @example
     * PUT /api/questions/persona
     * {
     *   "grade": 5,
     *   "learningStyle": "auditory",
     *   "interests": ["music", "history"],
     *   "culturalContext": "Eastern",
     *   "motivationalFactors": ["collaboration", "curiosity"]
     * }
     */
    updatePersona = async (req: Request, res: Response) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Authentication required",
                });
            }

            const {
                grade,
                learningStyle,
                interests,
                culturalContext,
                motivationalFactors,
                performanceLevel,
                preferredDifficulty,
            } = req.body;

            // Basic validation
            if (grade && (typeof grade !== 'number' || grade < 1 || grade > 12 || !Number.isInteger(grade))) {
                return res.status(400).json({
                    success: false,
                    message: "Grade must be an integer between 1 and 12",
                });
            }

            if (
                learningStyle &&
                ![
                    "visual",
                    "auditory",
                    "kinesthetic",
                    "reading_writing",
                ].includes(learningStyle)
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid learning style. Must be one of: visual, auditory, kinesthetic, reading_writing",
                });
            }

            if (
                interests &&
                (!Array.isArray(interests) || interests.length === 0)
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Interests must be a non-empty array",
                });
            }

            // Prepare persona data
            const personaData: any = {};
            if (grade !== undefined) personaData.grade = grade;
            if (learningStyle) personaData.learningStyle = learningStyle;
            if (interests) personaData.interests = interests;
            if (culturalContext) personaData.culturalContext = culturalContext;
            if (motivationalFactors)
                personaData.motivationalFactors = motivationalFactors;
            if (performanceLevel)
                personaData.performanceLevel = performanceLevel;
            if (preferredDifficulty)
                personaData.preferredDifficulty = preferredDifficulty;

            // Update timestamp
            personaData.updatedAt = new Date();

            const updatedPersona =
                await this.questionsService.updateStudentPersona(
                    req.user!.userId,
                    personaData
                );

            res.status(200).json({
                success: true,
                message: "Persona updated successfully",
                data: updatedPersona,
            });
        } catch (error: any) {
            console.error("Error updating persona:", error);
            res.status(500).json({
                success: false,
                message: error.message || "Failed to update persona",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.stack
                        : undefined,
            });
        }
    };

    /**
     * Get available subjects and topics for question generation
     *
     * @param req Request
     * @param res Response with subjects and topics
     * @returns Available subjects with their topics
     * @example
     * GET /api/questions/subjects
     * Response:
     * {
     *   "success": true,
     *   "data": {
     *     "mathematics": ["algebra", "geometry", "statistics"],
     *     "science": ["physics", "chemistry", "biology"]
     *   }
     * }
     */
    getSubjects = async (req: Request, res: Response) => {
        try {
            // Static configuration for now - could be made dynamic later
            const subjects = {
                mathematics: {
                    topics: [
                        "algebra",
                        "geometry",
                        "statistics",
                        "calculus",
                        "trigonometry",
                        "number_theory",
                    ],
                    grades: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                },
                science: {
                    topics: [
                        "physics",
                        "chemistry",
                        "biology",
                        "earth_science",
                        "astronomy",
                    ],
                    grades: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                },
                english: {
                    topics: [
                        "grammar",
                        "literature",
                        "writing",
                        "reading_comprehension",
                        "vocabulary",
                    ],
                    grades: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                },
                social_studies: {
                    topics: [
                        "history",
                        "geography",
                        "civics",
                        "economics",
                        "culture",
                    ],
                    grades: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
                },
            };

            const questionTypes = [
                "multiple_choice",
                "true_false",
                "short_answer",
                "problem_solving",
                "creative_writing",
                "fill_in_blank",
            ];

            const difficulties = ["easy", "medium", "hard"];

            res.status(200).json({
                success: true,
                message: "Subjects fetched successfully",
                data: {
                    subjects,
                    questionTypes,
                    difficulties,
                },
            });
        } catch (error: any) {
            console.error("Error fetching subjects:", error);
            res.status(500).json({
                success: false,
                message: "Failed to fetch subjects",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.stack
                        : undefined,
            });
        }
    };

    /**
     * Health check for questions service
     *
     * @param req Request
     * @param res Response with service status
     * @returns Service health status
     * @example
     * GET /api/questions/health
     * Response:
     * {
     *   "success": true,
     *   "message": "Questions service is healthy",
     *   "data": {
     *     "timestamp": "2024-01-01T12:00:00.000Z",
     *     "coreApiConnection": "healthy"
     *   }
     * }
     */
    healthCheck = async (req: Request, res: Response) => {
        try {
            // Basic health check
            const health = {
                timestamp: new Date(),
                coreApiConnection: "unknown", // Could ping core-api here
                database: "connected",
            };

            res.status(200).json({
                success: true,
                message: "Questions service is healthy",
                data: health,
            });
        } catch (error: any) {
            console.error("Health check error:", error);
            res.status(500).json({
                success: false,
                message: "Service health check failed",
                error:
                    process.env.NODE_ENV === "development"
                        ? error.stack
                        : undefined,
            });
        }
    };
}
