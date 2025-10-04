import { Request, Response } from "express";
import {
    curriculumIntegrationService,
    CurriculumIntegrationService,
} from "../services/curriculum-integration.service.js"; // Define request/response types locally since they're not exported from the service
interface QuestionSearchRequest {
    query?: string;
    subject?: string;
    grade?: string;
    difficulty?: string;
    limit?: number;
    offset?: number;
}

interface SimilarQuestionsRequest {
    questionText: string;
    subject?: string;
    grade?: string;
    limit?: number;
    minSimilarity?: number;
}

interface ContentRecommendationsRequest {
    answeredQuestionIds: string[];
    subject?: string;
    grade?: string;
    difficulty?: string;
    limit?: number;
}

interface CurriculumAlignmentRequest {
    questionText: string;
    subject?: string;
    grade?: string;
    maxAlignments?: number;
}

interface BulkIngestionRequest {
    sourceDirectory?: string;
    filePatterns?: string[];
    batchSize?: number;
    validateOnly?: boolean;
}

interface IngestionStatus {
    success: boolean;
    filesProcessed: number;
    questionsIngested: number;
    errors: string[];
    processingTime: number;
}

interface SystemHealthStatus {
    status: "healthy" | "degraded" | "unhealthy";
    services: {
        openSearch: boolean;
        embedding: boolean;
        vectorDatabase: boolean;
    };
    details: {
        openSearchVersion?: string;
        embeddingProvider?: string;
        indexHealth?: Record<string, any>;
    };
}

/**
 * Standard API response wrapper
 */
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message: string;
    timestamp: string;
}

/**
 * CurriculumController
 *
 * HTTP controller for curriculum data operations including question search,
 * similarity search, content recommendations, curriculum alignment, and
 * administrative functions like bulk ingestion and health monitoring.
 */
export class CurriculumController {
    private curriculumService: CurriculumIntegrationService;

    constructor() {
        this.curriculumService = curriculumIntegrationService;
    }

    /**
     * Search for questions based on query parameters
     * GET /curriculum/search
     *
     * @swagger
     * /api/v1/curriculum/search:
     *   get:
     *     tags: [Curriculum]
     *     summary: Search educational questions
     *     description: |
     *       Search for educational questions with advanced filtering capabilities.
     *       Uses OpenSearch for full-text search with vector database enhancement.
     *
     *       **Features:**
     *       - Full-text search across question content
     *       - Filter by subject, grade, and difficulty
     *       - Pagination support
     *       - Vector database relevance scoring
     *     parameters:
     *       - in: query
     *         name: q
     *         schema:
     *           type: string
     *         description: Search query text
     *         example: "algebra equations"
     *       - in: query
     *         name: subject
     *         schema:
     *           type: string
     *         description: Subject filter
     *         example: "mathematics"
     *       - in: query
     *         name: grade
     *         schema:
     *           type: string
     *         description: Grade level filter
     *         example: "8"
     *       - in: query
     *         name: difficulty
     *         schema:
     *           type: string
     *           enum: [easy, medium, hard]
     *         description: Difficulty level filter
     *         example: "medium"
     *       - in: query
     *         name: limit
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 50
     *           default: 10
     *         description: Maximum number of results
     *       - in: query
     *         name: offset
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of results to skip
     *     responses:
     *       200:
     *         description: Search results
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     questions:
     *                       type: array
     *                       items:
     *                         $ref: '#/components/schemas/QuestionDocument'
     *                     total:
     *                       type: integer
     *                     pagination:
     *                       type: object
     *                       properties:
     *                         offset:
     *                           type: integer
     *                         limit:
     *                           type: integer
     *                         total:
     *                           type: integer
     *                 message:
     *                   type: string
     *                 timestamp:
     *                   type: string
     *       500:
     *         description: Server error
     */
    async searchQuestions(req: Request, res: Response): Promise<void> {
        try {
            const searchRequest: QuestionSearchRequest = {
                query: req.query.q as string,
                subject: req.query.subject as string,
                grade: req.query.grade as string,
                difficulty: req.query.difficulty as string,
                limit: req.query.limit
                    ? parseInt(req.query.limit as string)
                    : undefined,
                offset: req.query.offset
                    ? parseInt(req.query.offset as string)
                    : undefined,
            };

            console.log(
                "🔍 Processing question search request:",
                searchRequest
            );

            const result = await this.curriculumService.searchQuestions(
                searchRequest
            );

            const response: ApiResponse<any> = {
                success: true,
                data: {
                    questions: result.questions,
                    total: result.total,
                    pagination: {
                        offset: result.offset,
                        limit: result.limit,
                        total: result.total,
                    },
                    metadata: {
                        took: result.processingTime,
                        totalResults: result.total,
                    },
                },
                message: `Found ${result.questions.length} questions`,
                timestamp: new Date().toISOString(),
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in searchQuestions:", error);

            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message:
                    error instanceof Error
                        ? error.message
                        : "Question search failed",
                timestamp: new Date().toISOString(),
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Find questions similar to provided question text
     * POST /curriculum/similar
     *
     * @swagger
     * /api/v1/curriculum/similar:
     *   post:
     *     tags: [Curriculum]
     *     summary: Find similar questions using vector similarity
     *     description: |
     *       Find questions similar to a provided question using vector similarity search.
     *       Uses advanced embedding models to identify semantically similar content.
     *
     *       **Features:**
     *       - Vector-based semantic similarity search
     *       - Configurable similarity threshold
     *       - Subject and grade filtering
     *       - Similarity score ranking
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - questionText
     *             properties:
     *               questionText:
     *                 type: string
     *                 description: The question text to find similar questions for
     *                 example: "What is the slope of a line with equation y = 2x + 3?"
     *               subject:
     *                 type: string
     *                 description: Filter by subject
     *                 example: "mathematics"
     *               grade:
     *                 type: string
     *                 description: Filter by grade level
     *                 example: "8"
     *               limit:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 20
     *                 default: 10
     *                 description: Maximum number of similar questions to return
     *               minSimilarity:
     *                 type: number
     *                 minimum: 0
     *                 maximum: 1
     *                 default: 0.7
     *                 description: Minimum similarity score (0-1)
     *     responses:
     *       200:
     *         description: Similar questions found
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     originalQuestion:
     *                       type: string
     *                     similarQuestions:
     *                       type: array
     *                       items:
     *                         allOf:
     *                           - $ref: '#/components/schemas/QuestionDocument'
     *                           - type: object
     *                             properties:
     *                               similarityScore:
     *                                 type: number
     *                                 minimum: 0
     *                                 maximum: 1
     *                     metadata:
     *                       type: object
     *                       properties:
     *                         averageSimilarity:
     *                           type: number
     *                         totalResults:
     *                           type: integer
     *                         took:
     *                           type: integer
     *       500:
     *         description: Server error
     */
    async findSimilarQuestions(req: Request, res: Response): Promise<void> {
        try {
            const similarRequest: SimilarQuestionsRequest = {
                questionText: req.body.questionText,
                subject: req.body.subject,
                grade: req.body.grade,
                limit: req.body.limit || 10,
                minSimilarity: req.body.minSimilarity || 0.7,
            };

            console.log(
                "🔗 Processing similarity search request:",
                similarRequest
            );

            const result = await this.curriculumService.findSimilarQuestions(
                similarRequest
            );

            const response: ApiResponse<any> = {
                success: true,
                data: {
                    originalQuestion: result.originalQuestion,
                    similarQuestions: result.similarQuestions.map(
                        (question: any, index: number) => ({
                            ...question,
                            similarityScore: result.similarityScores[index],
                        })
                    ),
                    metadata: {
                        averageSimilarity:
                            result.similarityScores.reduce(
                                (a: number, b: number) => a + b,
                                0
                            ) / result.similarityScores.length,
                        totalResults: result.similarQuestions.length,
                        took: result.processingTime,
                    },
                },
                message: `Found ${result.similarQuestions.length} similar questions`,
                timestamp: new Date().toISOString(),
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in findSimilarQuestions:", error);

            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message:
                    error instanceof Error
                        ? error.message
                        : "Similarity search failed",
                timestamp: new Date().toISOString(),
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Get personalized content recommendations
     * POST /curriculum/recommendations
     *
     * @swagger
     * /api/v1/curriculum/recommendations:
     *   post:
     *     tags: [Curriculum]
     *     summary: Get personalized content recommendations
     *     description: |
     *       Generate personalized content recommendations based on previously answered questions.
     *       Uses AI to analyze learning patterns and suggest appropriate next questions.
     *
     *       **Features:**
     *       - AI-powered personalized recommendations
     *       - Learning progression analysis
     *       - Adaptive difficulty adjustment
     *       - Confidence scoring for recommendations
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - answeredQuestionIds
     *             properties:
     *               answeredQuestionIds:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: Array of question IDs that have been answered
     *                 example: ["q1", "q2", "q3"]
     *               subject:
     *                 type: string
     *                 description: Focus recommendations on specific subject
     *                 example: "mathematics"
     *               grade:
     *                 type: string
     *                 description: Target grade level for recommendations
     *                 example: "8"
     *               difficulty:
     *                 type: string
     *                 enum: [easy, medium, hard, progressive]
     *                 description: Difficulty preference
     *                 example: "progressive"
     *               limit:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 20
     *                 default: 10
     *                 description: Maximum number of recommendations
     *     responses:
     *       200:
     *         description: Personalized recommendations
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     recommendations:
     *                       type: array
     *                       items:
     *                         allOf:
     *                           - $ref: '#/components/schemas/QuestionDocument'
     *                           - type: object
     *                             properties:
     *                               explanation:
     *                                 type: string
     *                                 description: Why this question was recommended
     *                               confidence:
     *                                 type: number
     *                                 minimum: 0
     *                                 maximum: 1
     *                                 description: Recommendation confidence score
     *                     metadata:
     *                       type: object
     *                       properties:
     *                         totalRecommendations:
     *                           type: integer
     *                         averageConfidence:
     *                           type: number
     *                         processingTime:
     *                           type: integer
     *       500:
     *         description: Server error
     */
    async getContentRecommendations(
        req: Request,
        res: Response
    ): Promise<void> {
        try {
            const recommendationRequest: ContentRecommendationsRequest = {
                answeredQuestionIds: req.body.answeredQuestionIds,
                subject: req.body.subject,
                grade: req.body.grade,
                difficulty: req.body.difficulty,
                limit: req.body.limit || 10,
            };

            console.log(
                "💡 Processing content recommendations request:",
                recommendationRequest
            );

            const result =
                await this.curriculumService.getContentRecommendations(
                    recommendationRequest
                );

            const response: ApiResponse<any> = {
                success: true,
                data: {
                    recommendations: result.recommendations.map(
                        (question: any, index: number) => ({
                            ...question,
                            explanation: result.explanations[index],
                            confidence: result.confidence[index],
                        })
                    ),
                    metadata: {
                        totalRecommendations: result.recommendations.length,
                        averageConfidence:
                            result.confidence.reduce(
                                (a: number, b: number) => a + b,
                                0
                            ) / result.confidence.length,
                        processingTime: result.processingTime,
                    },
                },
                message: `Generated ${result.recommendations.length} personalized recommendations`,
                timestamp: new Date().toISOString(),
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in getContentRecommendations:", error);

            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message:
                    error instanceof Error
                        ? error.message
                        : "Content recommendations failed",
                timestamp: new Date().toISOString(),
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Align question content with curriculum objectives
     * POST /curriculum/align
     *
     * @swagger
     * /api/v1/curriculum/align:
     *   post:
     *     tags: [Curriculum]
     *     summary: Align question content with curriculum objectives
     *     description: |
     *       Analyze how well a question aligns with specific curriculum objectives.
     *       Uses AI to assess curriculum framework compliance and learning outcomes.
     *
     *       **Features:**
     *       - AI-powered curriculum alignment analysis
     *       - New Zealand curriculum framework support
     *       - Objective-specific alignment scoring
     *       - Detailed alignment reasoning
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - questionText
     *             properties:
     *               questionText:
     *                 type: string
     *                 description: The question text to analyze for curriculum alignment
     *                 example: "Calculate the area of a rectangle with length 5cm and width 3cm"
     *               subject:
     *                 type: string
     *                 description: Subject context for alignment analysis
     *                 example: "mathematics"
     *               grade:
     *                 type: string
     *                 description: Grade level for curriculum alignment
     *                 example: "5"
     *               maxAlignments:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 10
     *                 default: 5
     *                 description: Maximum number of alignment results to return
     *     responses:
     *       200:
     *         description: Curriculum alignment analysis
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     alignments:
     *                       type: array
     *                       items:
     *                         type: object
     *                         properties:
     *                           objectiveId:
     *                             type: string
     *                             description: Curriculum objective identifier
     *                           alignmentScore:
     *                             type: number
     *                             minimum: 0
     *                             maximum: 1
     *                             description: How well the question aligns (0-1)
     *                           alignmentReason:
     *                             type: string
     *                             description: Explanation of the alignment
     *                           confidence:
     *                             type: string
     *                             enum: [low, medium, high]
     *                             description: Confidence level of the alignment
     *                     metadata:
     *                       type: object
     *                       properties:
     *                         totalAlignments:
     *                           type: integer
     *                         averageScore:
     *                           type: number
     *                         processingTime:
     *                           type: integer
     *       500:
     *         description: Server error
     */
    async getCurriculumAlignment(req: Request, res: Response): Promise<void> {
        try {
            const alignmentRequest: CurriculumAlignmentRequest = {
                questionText: req.body.questionText,
                subject: req.body.subject,
                grade: req.body.grade,
                maxAlignments: req.body.maxAlignments || 5,
            };

            console.log(
                "🎯 Processing curriculum alignment request:",
                alignmentRequest
            );

            const result = await this.curriculumService.getCurriculumAlignment(
                alignmentRequest
            );

            const response: ApiResponse<any> = {
                success: true,
                data: {
                    alignments: result.alignments,
                    metadata: {
                        totalAlignments: result.alignments.length,
                        averageScore:
                            result.alignments.reduce(
                                (a: number, b: any) => a + b.alignmentScore,
                                0
                            ) / result.alignments.length,
                        processingTime: result.processingTime,
                    },
                },
                message: `Found ${result.alignments.length} curriculum alignments`,
                timestamp: new Date().toISOString(),
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in getCurriculumAlignment:", error);

            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message:
                    error instanceof Error
                        ? error.message
                        : "Curriculum alignment failed",
                timestamp: new Date().toISOString(),
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Perform bulk ingestion of questions
     * POST /curriculum/admin/ingest
     *
     * @swagger
     * /api/v1/curriculum/admin/ingest:
     *   post:
     *     tags: [Curriculum]
     *     summary: Bulk ingest curriculum data
     *     description: |
     *       Perform bulk ingestion of questions and curriculum data from various source files.
     *       Processes scattered curriculum files and imports them into the vector database.
     *
     *       **Features:**
     *       - Batch processing of multiple file formats
     *       - Vector embedding generation
     *       - Data validation and quality checks
     *       - Progress tracking and error reporting
     *
     *       **Administrative Endpoint**: Requires admin privileges
     *     requestBody:
     *       required: false
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               sourceDirectory:
     *                 type: string
     *                 description: Directory to scan for curriculum files
     *                 example: "/path/to/curriculum/files"
     *               filePatterns:
     *                 type: array
     *                 items:
     *                   type: string
     *                 description: File patterns to match
     *                 example: ["grade*-questions*.json", "curriculum-*.json"]
     *               batchSize:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 500
     *                 default: 100
     *                 description: Number of questions to process per batch
     *               validateOnly:
     *                 type: boolean
     *                 default: false
     *                 description: Only validate files without importing
     *     responses:
     *       200:
     *         description: Ingestion completed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     success:
     *                       type: boolean
     *                     filesProcessed:
     *                       type: integer
     *                     questionsIngested:
     *                       type: integer
     *                     errors:
     *                       type: array
     *                       items:
     *                         type: string
     *                     processingTime:
     *                       type: integer
     *       500:
     *         description: Ingestion failed
     */
    async performBulkIngestion(req: Request, res: Response): Promise<void> {
        try {
            const ingestionRequest: BulkIngestionRequest = {
                sourceDirectory: req.body.sourceDirectory,
                filePatterns: req.body.filePatterns,
                batchSize: req.body.batchSize || 100,
                validateOnly: req.body.validateOnly || false,
            };

            console.log(
                "📥 Processing bulk ingestion request:",
                ingestionRequest
            );

            const result = await this.curriculumService.performBulkIngestion(
                ingestionRequest
            );

            const response: ApiResponse<IngestionStatus> = {
                success: result.success,
                data: result,
                message: result.success
                    ? `Successfully ingested ${result.questionsIngested} questions from ${result.filesProcessed} files`
                    : `Ingestion failed with ${result.errors.length} errors`,
                timestamp: new Date().toISOString(),
            };

            res.status(result.success ? 200 : 500).json(response);
        } catch (error) {
            console.error("Error in performBulkIngestion:", error);

            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message:
                    error instanceof Error
                        ? error.message
                        : "Bulk ingestion failed",
                timestamp: new Date().toISOString(),
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Get system health status
     * GET /curriculum/admin/health
     *
     * @swagger
     * /api/v1/curriculum/admin/health:
     *   get:
     *     tags: [Curriculum]
     *     summary: Check system health status
     *     description: |
     *       Get comprehensive health status of all curriculum system components.
     *       Monitors OpenSearch, embedding services, and vector database connectivity.
     *
     *       **Administrative Endpoint**: Provides system monitoring information
     *     responses:
     *       200:
     *         description: System is healthy
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     status:
     *                       type: string
     *                       enum: [healthy, degraded, unhealthy]
     *                       description: Overall system status
     *                     services:
     *                       type: object
     *                       properties:
     *                         openSearch:
     *                           type: boolean
     *                           description: OpenSearch cluster status
     *                         embedding:
     *                           type: boolean
     *                           description: Embedding service status
     *                         vectorDatabase:
     *                           type: boolean
     *                           description: Vector database status
     *                     details:
     *                       type: object
     *                       properties:
     *                         openSearchVersion:
     *                           type: string
     *                         embeddingProvider:
     *                           type: string
     *                         indexHealth:
     *                           type: object
     *       206:
     *         description: System is degraded (some services down)
     *       503:
     *         description: System is unhealthy (critical services down)
     */
    async getHealthStatus(req: Request, res: Response): Promise<void> {
        try {
            console.log("🏥 Processing health status request");

            const health = await this.curriculumService.getHealthStatus();

            const response: ApiResponse<SystemHealthStatus> = {
                success: true,
                data: health,
                message: `System status: ${health.status}`,
                timestamp: new Date().toISOString(),
            };

            const statusCode =
                health.status === "healthy"
                    ? 200
                    : health.status === "degraded"
                    ? 206
                    : 503;
            res.status(statusCode).json(response);
        } catch (error) {
            console.error("Error in getHealthStatus:", error);

            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message:
                    error instanceof Error
                        ? error.message
                        : "Health check failed",
                timestamp: new Date().toISOString(),
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Get comprehensive system statistics
     * GET /curriculum/admin/stats
     *
     * @swagger
     * /api/v1/curriculum/admin/stats:
     *   get:
     *     tags: [Curriculum]
     *     summary: Get system statistics
     *     description: |
     *       Get comprehensive statistics about the curriculum database including
     *       question counts, curriculum objectives, and vector database metrics.
     *
     *       **Administrative Endpoint**: Provides detailed system analytics
     *     responses:
     *       200:
     *         description: Statistics retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                 data:
     *                   type: object
     *                   properties:
     *                     questions:
     *                       type: object
     *                       properties:
     *                         total:
     *                           type: integer
     *                           description: Total number of questions in database
     *                         bySubject:
     *                           type: object
     *                           additionalProperties:
     *                             type: integer
     *                           description: Question count by subject
     *                         byGrade:
     *                           type: object
     *                           additionalProperties:
     *                             type: integer
     *                           description: Question count by grade level
     *                         byDifficulty:
     *                           type: object
     *                           additionalProperties:
     *                             type: integer
     *                           description: Question count by difficulty
     *                     curriculum:
     *                       type: object
     *                       properties:
     *                         totalObjectives:
     *                           type: integer
     *                           description: Total curriculum objectives
     *                         bySubject:
     *                           type: object
     *                           additionalProperties:
     *                             type: integer
     *                         byGrade:
     *                           type: object
     *                           additionalProperties:
     *                             type: integer
     *                     vectorDatabase:
     *                       type: object
     *                       properties:
     *                         indexSize:
     *                           type: integer
     *                           description: Number of vectors in database
     *                         dimensionality:
     *                           type: integer
     *                           description: Vector dimensions (e.g., 768)
     *                         lastUpdated:
     *                           type: string
     *                           format: date-time
     *                           description: Last update timestamp
     *       500:
     *         description: Failed to retrieve statistics
     */
    async getStatistics(req: Request, res: Response): Promise<void> {
        try {
            console.log("📊 Processing statistics request");

            const stats = await this.curriculumService.getStatistics();

            const response: ApiResponse<typeof stats> = {
                success: true,
                data: stats,
                message: "Statistics retrieved successfully",
                timestamp: new Date().toISOString(),
            };

            res.status(200).json(response);
        } catch (error) {
            console.error("Error in getStatistics:", error);

            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message:
                    error instanceof Error
                        ? error.message
                        : "Statistics retrieval failed",
                timestamp: new Date().toISOString(),
            };

            res.status(500).json(errorResponse);
        }
    }
}

// Export singleton instance
export const curriculumController = new CurriculumController();
