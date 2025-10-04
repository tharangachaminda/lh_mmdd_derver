/**
 * Subject-Agnostic Educational Content Controller
 *
 * Handles HTTP requests for generating and managing educational content
 * across all subjects (Mathematics, Science, English, Social Studies).
 *
 * @fileoverview Core API controller for educational content management
 * @version 2.1.0 - Refactored with optimized service bridge and utilities
 */

import { Request, Response } from "express";
import {
    Subject,
    DifficultyLevel,
    EducationalQuestion,
    QuestionFormat,
    MathematicsQuestionType,
} from "../types/service-interfaces.js";

// Import optimized service interfaces and utilities
import {
    MathematicsServiceBridge,
    MathematicsQuestionResult,
    MathematicsGenerationParams,
    VectorContext,
    VectorRetrievalMetrics,
    BatchGenerationRequest,
    BatchGenerationResponse,
} from "../types/service-interfaces.js";
import { MathematicsServiceBridgeImpl } from "../services/mathematics-service-bridge.js";
import {
    MetadataCalculator,
    FormulaExtractor,
} from "../utils/metadata-calculators.js";

/**
 * Educational content generation request interface
 */
interface ContentGenerationRequest {
    subject: Subject;
    grade: number;
    topic: string;
    subtopic?: string;
    difficulty: DifficultyLevel;
    format: QuestionFormat;
    count?: number;
    context?: string;
    curriculum?: string;
}

/**
 * Educational content generation response interface
 */
interface ContentGenerationResponse {
    success: boolean;
    data?: EducationalQuestion | EducationalQuestion[];
    metadata?: {
        generationTime: number;
        qualityScore: number;
        curriculumAlignment: boolean;
        relevanceScore?: number;
        vectorContext?: VectorContext;
        serviceIntegration?: {
            serviceUsed?: string;
            servicesUsed?: string[];
            totalQuestions?: number;
            averageGenerationTime?: number;
            averageRelevanceScore?: number;
            originalMetadata?: any;
        };
        fallbackUsed?: boolean;
        originalError?: string;
    };
    error?: string;
}

export class EducationalContentController {
    // Mathematics service bridge (will connect to existing services)
    private mathematicsServiceBridge: MathematicsServiceBridge;

    constructor() {
        // Initialize optimized service bridge for mathematics integration
        this.mathematicsServiceBridge = new MathematicsServiceBridgeImpl();

        console.log(
            "✅ EducationalContentController: Optimized service integrations ready"
        );
        console.log(
            "   - Mathematics: Enhanced multi-agent + vector analytics + circuit breaker"
        );
        console.log("   - Future: Science, English, Social Studies");
    }

    /**
     * Create mathematics service bridge that interfaces with existing services
     * This approach maintains all existing functionality while enabling new API
     */
    /**
     * Generate educational content (questions, exercises, etc.)
     * Subject-agnostic endpoint that delegates to appropriate subject handlers

    /**
     * Call existing agentic question service (simulated for now)
     * TODO: Replace with actual service integration when monorepo is configured
     */
    private async callAgenticService(
        params: MathematicsGenerationParams
    ): Promise<MathematicsQuestionResult | null> {
        // Simulate advanced question generation with rich metadata
        // This will be replaced with actual AgenticQuestionService integration

        if (Math.random() > 0.1) {
            // 90% success rate simulation
            // Simulate vector database retrieval with relevance scoring
            const vectorRetrievalResults = this.simulateVectorRetrieval(params);

            return {
                id: `agentic_${Date.now()}`,
                question: `Advanced ${params.topic} question for grade ${params.grade}: What is the ${params.topic} solution?`,
                answer: this.generateContextualAnswer(params),
                explanation: `This question was generated using advanced multi-agent workflow with vector database context for ${params.topic}.`,
                metadata: {
                    generationTime: 0, // Will be set by caller
                    serviceUsed: "AgenticQuestionService",
                    qualityScore: 0.92,
                    relevanceScore:
                        vectorRetrievalResults.averageRelevanceScore, // NEW: Overall relevance
                    vectorContext: {
                        used: true,
                        similarQuestionsFound:
                            vectorRetrievalResults.totalRetrieved,
                        curriculumAlignment: true,
                        averageRelevanceScore:
                            vectorRetrievalResults.averageRelevanceScore,
                        topRelevanceScore:
                            vectorRetrievalResults.topRelevanceScore,
                        retrievalMetrics: {
                            totalRetrieved:
                                vectorRetrievalResults.totalRetrieved,
                            aboveThreshold:
                                vectorRetrievalResults.aboveThreshold,
                            relevanceThreshold: 0.7, // Standard threshold
                            retrievalTime: vectorRetrievalResults.retrievalTime,
                            contextSources:
                                vectorRetrievalResults.contextSources,
                        },
                    },
                    workflowData: {
                        agentsUsed: [
                            "QuestionGenerator",
                            "QualityChecker",
                            "ContextEnhancer",
                        ],
                        totalWorkflowTime: 150,
                        confidenceScore: 0.89,
                        vectorContextUsed: true,
                        relevanceBasedGeneration: true,
                    },
                },
            };
        }

        return null; // Simulate service failure
    }

    /**
     * Call existing deterministic question generation service (simulated for now)
     * TODO: Replace with actual service integration when monorepo is configured
     */
    private async callDeterministicService(
        params: MathematicsGenerationParams
    ): Promise<MathematicsQuestionResult> {
        // Simulate deterministic question generation
        // This will be replaced with actual QuestionGenerationService integration

        return {
            id: `deterministic_${Date.now()}`,
            question: `Grade ${params.grade} ${params.topic}: Calculate the result`,
            answer: this.generateContextualAnswer(params),
            explanation: `This question was generated using deterministic algorithms optimized for ${params.difficulty} difficulty.`,
            metadata: {
                generationTime: 0, // Will be set by caller
                serviceUsed: "QuestionGenerationService",
                qualityScore: 0.78,
                vectorContext: {
                    used: false,
                    similarQuestionsFound: 0,
                    curriculumAlignment: true,
                },
            },
        };
    }

    /**
     * Generate basic mathematics question as last resort
     */
    private generateBasicMathQuestion(
        params: MathematicsGenerationParams,
        startTime: number
    ): MathematicsQuestionResult {
        const operations = {
            addition: "+",
            subtraction: "-",
            multiplication: "×",
            division: "÷",
        };

        const op = operations[params.topic as keyof typeof operations] || "+";
        const a = Math.floor(Math.random() * (params.grade * 10)) + 1;
        const b = Math.floor(Math.random() * (params.grade * 5)) + 1;

        let answer: number;
        switch (params.topic) {
            case "addition":
                answer = a + b;
                break;
            case "subtraction":
                answer = Math.max(a, b) - Math.min(a, b);
                break;
            case "multiplication":
                answer = a * b;
                break;
            case "division":
                answer = Math.floor(a / b);
                break;
            default:
                answer = a + b;
        }

        return {
            id: `basic_${Date.now()}`,
            question: `What is ${a} ${op} ${b}?`,
            answer: answer.toString(),
            explanation: `Basic ${params.topic} question generated as service fallback.`,
            metadata: {
                generationTime: Date.now() - startTime,
                serviceUsed: "BasicMathGenerator (emergency fallback)",
                qualityScore: 0.6,
                vectorContext: {
                    used: false,
                    similarQuestionsFound: 0,
                    curriculumAlignment: false,
                },
            },
        };
    }

    /**
     * Simulate vector database retrieval with relevance scoring
     * TODO: Replace with actual vector database integration
     */
    private simulateVectorRetrieval(params: MathematicsGenerationParams): {
        totalRetrieved: number;
        aboveThreshold: number;
        averageRelevanceScore: number;
        topRelevanceScore: number;
        retrievalTime: number;
        contextSources: string[];
    } {
        // Simulate realistic relevance scores based on topic and difficulty
        const baseRelevance = this.calculateBaseRelevance(params);
        const retrievalCount = Math.floor(Math.random() * 8) + 3; // 3-10 results

        // Generate realistic relevance scores (higher for specific topics)
        const relevanceScores: number[] = [];
        for (let i = 0; i < retrievalCount; i++) {
            // First few results should have higher relevance
            const positionPenalty = i * 0.05;
            const noise = (Math.random() - 0.5) * 0.2; // ±0.1 noise
            const score = Math.max(
                0.1,
                Math.min(1.0, baseRelevance - positionPenalty + noise)
            );
            relevanceScores.push(Number(score.toFixed(3)));
        }

        // Sort by relevance (descending)
        relevanceScores.sort((a, b) => b - a);

        const threshold = 0.7;
        const aboveThreshold = relevanceScores.filter(
            (score) => score >= threshold
        ).length;
        const averageScore =
            relevanceScores.reduce((sum, score) => sum + score, 0) /
            relevanceScores.length;

        return {
            totalRetrieved: retrievalCount,
            aboveThreshold,
            averageRelevanceScore: Number(averageScore.toFixed(3)),
            topRelevanceScore: relevanceScores[0],
            retrievalTime: Math.floor(Math.random() * 50) + 10, // 10-60ms
            contextSources: this.generateContextSources(params, retrievalCount),
        };
    }

    /**
     * Calculate base relevance score based on parameters
     */
    private calculateBaseRelevance(
        params: MathematicsGenerationParams
    ): number {
        let baseScore = 0.8; // Default good relevance

        // Topic-specific adjustments
        const commonTopics = [
            "addition",
            "subtraction",
            "multiplication",
            "division",
        ];
        if (commonTopics.includes(params.topic.toLowerCase())) {
            baseScore += 0.1; // More content available for basic topics
        }

        // Grade-specific adjustments
        if (params.grade >= 3 && params.grade <= 6) {
            baseScore += 0.05; // More content for middle grades
        }

        // Difficulty adjustments
        if (params.difficulty === "easy") {
            baseScore += 0.05; // More basic content available
        } else if (params.difficulty === "hard") {
            baseScore -= 0.1; // Less advanced content
        }

        return Math.max(0.3, Math.min(0.95, baseScore));
    }

    /**
     * Generate realistic context source names
     */
    private generateContextSources(
        params: MathematicsGenerationParams,
        count: number
    ): string[] {
        const sources = [
            `nz-curriculum-${params.topic}-grade${params.grade}`,
            `math-textbook-${params.grade}-${params.difficulty}`,
            `practice-questions-${params.topic}`,
            `curriculum-standards-math-${params.grade}`,
            `assessment-bank-${params.topic}`,
            `learning-objectives-${params.grade}`,
            `pedagogical-patterns-${params.topic}`,
            `real-world-examples-${params.topic}`,
        ];

        // Return subset based on retrieval count
        return sources.slice(0, Math.min(count, sources.length));
    }

    /**
     * Generate contextual answer based on parameters and relevance scoring
     */
    private generateContextualAnswer(
        params: MathematicsGenerationParams
    ): string {
        // Simulate intelligent answer generation with relevance consideration
        const baseAnswer = Math.floor(Math.random() * 100) + 1;

        if (params.context === "real-world") {
            return `${baseAnswer} (real-world application)`;
        } else if (params.difficulty === "hard") {
            return `${baseAnswer} with detailed steps`;
        } else {
            return baseAnswer.toString();
        }
    }

    /**
     * Generate educational content (questions, exercises, etc.)
     * Subject-agnostic endpoint that delegates to appropriate subject handlers
     *
     * @swagger
     * /api/v1/content/generate:
     *   post:
     *     tags: [Content Generation]
     *     summary: Generate educational content
     *     description: |
     *       Generate educational content (questions, exercises, assessments) for any supported subject.
     *       This endpoint uses advanced AI services including vector database enhancement for improved relevance.
     *
     *       **Key Features:**
     *       - Subject-agnostic content generation
     *       - Vector database enhancement with relevance scoring
     *       - Multi-agent workflows for quality assurance
     *       - Circuit breaker patterns for reliability
     *       - Comprehensive metadata tracking
     *
     *       **Supported Subjects:**
     *       - **Mathematics**: Advanced multi-agent generation with vector enhancement
     *       - **Science**: Coming soon (Physics, Chemistry, Biology)
     *       - **English**: Coming soon (Literature, Grammar, Writing)
     *       - **Social Studies**: Coming soon (History, Geography, Civics)
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/ContentGenerationRequest'
     *           examples:
     *             mathematics_single:
     *               summary: Single Mathematics Question
     *               value:
     *                 subject: "MATHEMATICS"
     *                 grade: 5
     *                 topic: "addition"
     *                 subtopic: "two-digit addition"
     *                 difficulty: "MEDIUM"
     *                 format: "CALCULATION"
     *                 count: 1
     *                 context: "real-world applications"
     *                 enhanceWithVectorDB: true
     *             mathematics_multiple:
     *               summary: Multiple Mathematics Questions
     *               value:
     *                 subject: "MATHEMATICS"
     *                 grade: 8
     *                 topic: "algebra"
     *                 difficulty: "HARD"
     *                 format: "SHORT_ANSWER"
     *                 count: 5
     *                 context: "problem-solving scenarios"
     *                 enhanceWithVectorDB: true
     *             science_placeholder:
     *               summary: Science Content (Coming Soon)
     *               value:
     *                 subject: "SCIENCE"
     *                 grade: 7
     *                 topic: "physics"
     *                 subtopic: "motion"
     *                 difficulty: "MEDIUM"
     *                 format: "MULTIPLE_CHOICE"
     *                 count: 3
     *     responses:
     *       200:
     *         description: Content generated successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ContentGenerationResponse'
     *             examples:
     *               single_question:
     *                 summary: Single Question Response
     *                 value:
     *                   success: true
     *                   data:
     *                     id: "agentic_1728053425123"
     *                     subject: "MATHEMATICS"
     *                     grade: 5
     *                     title: "Addition Question"
     *                     question: "Sarah has 47 stickers and buys 28 more. How many stickers does she have now?"
     *                     answer: "75"
     *                     explanation: "To find the total, add the original amount to the new amount: 47 + 28 = 75"
     *                     difficulty: "MEDIUM"
     *                     format: "CALCULATION"
     *                     topic: "addition"
     *                     subtopic: "two-digit addition"
     *                   metadata:
     *                     generationTime: 342
     *                     qualityScore: 0.92
     *                     relevanceScore: 0.87
     *                     curriculumAlignment: true
     *                     vectorContext:
     *                       used: true
     *                       similarQuestionsFound: 12
     *                       averageRelevanceScore: 0.84
     *                       topRelevanceScore: 0.95
     *                       retrievalMetrics:
     *                         totalRetrieved: 8
     *                         aboveThreshold: 6
     *                         relevanceThreshold: 0.7
     *                         retrievalTime: 45
     *                         contextSources: ["nz-curriculum-addition-grade5.json", "math-textbook-5-medium.json"]
     *               multiple_questions:
     *                 summary: Multiple Questions Response
     *                 value:
     *                   success: true
     *                   data:
     *                     - id: "agentic_1728053425124"
     *                       subject: "MATHEMATICS"
     *                       grade: 8
     *                       title: "Algebra Question 1"
     *                       question: "Solve for x: 3x + 7 = 22"
     *                       answer: "x = 5"
     *                       difficulty: "HARD"
     *                       format: "SHORT_ANSWER"
     *                       topic: "algebra"
     *                     - id: "agentic_1728053425125"
     *                       subject: "MATHEMATICS"
     *                       grade: 8
     *                       title: "Algebra Question 2"
     *                       question: "If y = 2x - 3 and x = 4, what is y?"
     *                       answer: "y = 5"
     *                       difficulty: "HARD"
     *                       format: "SHORT_ANSWER"
     *                       topic: "algebra"
     *                   metadata:
     *                     generationTime: 523
     *                     qualityScore: 0.89
     *                     relevanceScore: 0.91
     *                     curriculumAlignment: true
     *                     serviceIntegration:
     *                       servicesUsed: ["AgenticQuestionService", "VectorEnhancementService"]
     *                       totalQuestions: 2
     *                       averageGenerationTime: 261
     *                       averageRelevanceScore: 0.91
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     *       501:
     *         $ref: '#/components/responses/NotImplemented'
     */
    public generateContent = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const validationResult = this.validateContentRequest(req.body);

            if (!validationResult.isValid) {
                res.status(400).json({
                    success: false,
                    error: validationResult.error,
                });
                return;
            }

            const request = validationResult.data!;

            // Delegate to subject-specific generation logic
            const result = await this.delegateContentGeneration(request);

            res.status(200).json(result);
        } catch (error) {
            console.error("Content generation error:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error during content generation",
            });
        }
    };

    /**
     * Get educational content by ID
     * Subject-agnostic content retrieval
     *
     * @swagger
     * /api/v1/content/{id}:
     *   get:
     *     tags: [Content Management]
     *     summary: Retrieve educational content by ID
     *     description: |
     *       Retrieve specific educational content using its unique identifier.
     *       Supports filtering by subject for optimized retrieval.
     *
     *       **Note**: Currently in development. This endpoint will support:
     *       - Content versioning and history
     *       - Cross-subject content relationships
     *       - Performance analytics integration
     *       - Caching for frequently accessed content
     *     parameters:
     *       - $ref: '#/components/parameters/ContentIdParam'
     *       - name: subject
     *         in: query
     *         schema:
     *           $ref: '#/components/schemas/Subject'
     *         description: Filter by subject for optimized retrieval
     *         example: "MATHEMATICS"
     *     responses:
     *       200:
     *         description: Content retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   $ref: '#/components/schemas/EducationalQuestion'
     *                 message:
     *                   type: string
     *                   example: "Content retrieved successfully"
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       404:
     *         description: Content not found
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/ErrorResponse'
     *             example:
     *               success: false
     *               error: "Content with ID 'abc123' not found"
     *               code: "CONTENT_NOT_FOUND"
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    public getContent = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { subject } = req.query;

            if (!id) {
                res.status(400).json({
                    success: false,
                    error: "Content ID is required",
                });
                return;
            }

            // Future: Implement content retrieval
            // const content = await this.contentService.getById(id, subject as Subject);

            res.status(200).json({
                success: true,
                data: null, // Placeholder
                message: "Content retrieval endpoint - implementation pending",
            });
        } catch (error) {
            console.error("Content retrieval error:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error during content retrieval",
            });
        }
    };

    /**
     * Search educational content
     * Subject-agnostic content search with filtering
     *
     * @swagger
     * /api/v1/content/search:
     *   get:
     *     tags: [Content Management]
     *     summary: Search educational content
     *     description: |
     *       Perform intelligent search across educational content using vector-based similarity search.
     *       Supports filtering by subject, grade, difficulty, and other criteria.
     *
     *       **Search Features:**
     *       - Vector-based semantic search
     *       - Multi-subject content discovery
     *       - Relevance scoring and ranking
     *       - Curriculum alignment filtering
     *       - Performance-optimized pagination
     *
     *       **Note**: Currently in development. Will include:
     *       - Advanced query syntax support
     *       - Faceted search results
     *       - Search analytics and recommendations
     *       - Cross-curricular content suggestions
     *     parameters:
     *       - name: query
     *         in: query
     *         required: true
     *         schema:
     *           type: string
     *         description: Search query string
     *         example: "fractions word problems"
     *       - name: subject
     *         in: query
     *         schema:
     *           $ref: '#/components/schemas/Subject'
     *         description: Filter by subject
     *         example: "MATHEMATICS"
     *       - name: grade
     *         in: query
     *         schema:
     *           $ref: '#/components/schemas/GradeLevel'
     *         description: Filter by grade level
     *         example: 5
     *       - name: difficulty
     *         in: query
     *         schema:
     *           $ref: '#/components/schemas/DifficultyLevel'
     *         description: Filter by difficulty level
     *         example: "MEDIUM"
     *       - name: limit
     *         in: query
     *         schema:
     *           type: integer
     *           minimum: 1
     *           maximum: 50
     *           default: 10
     *         description: Maximum number of results
     *         example: 10
     *       - name: offset
     *         in: query
     *         schema:
     *           type: integer
     *           minimum: 0
     *           default: 0
     *         description: Number of results to skip (pagination)
     *         example: 0
     *     responses:
     *       200:
     *         description: Search completed successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: array
     *                   items:
     *                     $ref: '#/components/schemas/EducationalQuestion'
     *                 metadata:
     *                   type: object
     *                   properties:
     *                     totalResults:
     *                       type: integer
     *                       example: 0
     *                     query:
     *                       type: string
     *                       example: "fractions word problems"
     *                     filters:
     *                       type: object
     *                       example: { "subject": "MATHEMATICS", "grade": 5 }
     *                 message:
     *                   type: string
     *                   example: "Content search endpoint - implementation pending"
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    public searchContent = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const {
                query,
                subject,
                grade,
                difficulty,
                limit = 10,
                offset = 0,
            } = req.query;

            if (!query) {
                res.status(400).json({
                    success: false,
                    error: "Search query is required",
                });
                return;
            }

            // Future: Implement vector search across subjects
            // const results = await this.searchService.search({
            //     query: query as string,
            //     subject: subject as Subject,
            //     grade: grade ? Number(grade) : undefined,
            //     difficulty: difficulty as DifficultyLevel,
            //     limit: Number(limit),
            //     offset: Number(offset)
            // });

            res.status(200).json({
                success: true,
                data: [], // Placeholder
                metadata: {
                    totalResults: 0,
                    query: query,
                    filters: { subject, grade, difficulty },
                },
                message: "Content search endpoint - implementation pending",
            });
        } catch (error) {
            console.error("Content search error:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error during content search",
            });
        }
    };

    /**
     * Get curriculum information for a subject and grade
     *
     * @swagger
     * /api/v1/curriculum/{subject}/{grade}:
     *   get:
     *     tags: [Curriculum]
     *     summary: Get curriculum information
     *     description: |
     *       Retrieve detailed curriculum information for a specific subject and grade level.
     *       Provides learning standards, objectives, and framework alignment data.
     *
     *       **Curriculum Features:**
     *       - New Zealand curriculum framework alignment
     *       - Learning objectives and standards
     *       - Cross-curricular connections
     *       - Assessment criteria and rubrics
     *       - Progression tracking across grades
     *
     *       **Note**: Currently in development. Will include:
     *       - Detailed strand breakdowns
     *       - Learning progression maps
     *       - Assessment standards alignment
     *       - Resource recommendations
     *     parameters:
     *       - $ref: '#/components/parameters/SubjectParam'
     *       - $ref: '#/components/parameters/GradeParam'
     *     responses:
     *       200:
     *         description: Curriculum information retrieved successfully
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 success:
     *                   type: boolean
     *                   example: true
     *                 data:
     *                   type: object
     *                   properties:
     *                     subject:
     *                       $ref: '#/components/schemas/Subject'
     *                     grade:
     *                       $ref: '#/components/schemas/GradeLevel'
     *                     framework:
     *                       type: string
     *                       example: "new_zealand"
     *                     strands:
     *                       type: array
     *                       items:
     *                         type: object
     *                       example: []
     *                     standards:
     *                       type: array
     *                       items:
     *                         type: object
     *                       example: []
     *                 message:
     *                   type: string
     *                   example: "Curriculum info endpoint - implementation pending"
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    public getCurriculumInfo = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            const { subject, grade } = req.params;

            if (!subject || !grade) {
                res.status(400).json({
                    success: false,
                    error: "Subject and grade are required",
                });
                return;
            }

            if (!Object.values(Subject).includes(subject as Subject)) {
                res.status(400).json({
                    success: false,
                    error: `Invalid subject. Supported subjects: ${Object.values(
                        Subject
                    ).join(", ")}`,
                });
                return;
            }

            // Future: Implement curriculum information retrieval
            // const curriculumInfo = await this.curriculumService.getInfo(
            //     subject as Subject,
            //     Number(grade)
            // );

            res.status(200).json({
                success: true,
                data: {
                    subject,
                    grade: Number(grade),
                    framework: "new_zealand", // Default
                    strands: [], // Placeholder
                    standards: [], // Placeholder
                },
                message: "Curriculum info endpoint - implementation pending",
            });
        } catch (error) {
            console.error("Curriculum info error:", error);
            res.status(500).json({
                success: false,
                error: "Internal server error during curriculum info retrieval",
            });
        }
    };

    // === LEGACY MATHEMATICS SUPPORT (Backward Compatibility) ===

    /**
     * Legacy mathematics question generation endpoint
     * Maintains backward compatibility with existing mathematics-focused API
     *
     * @swagger
     * /api/v1/mathematics/generate:
     *   post:
     *     tags: [Legacy Support, Mathematics]
     *     summary: Generate mathematics questions (Legacy)
     *     description: |
     *       **LEGACY ENDPOINT** - Maintained for backward compatibility
     *
     *       Use `/api/v1/content/generate` with `subject: "MATHEMATICS"` for new integrations.
     *
     *       This endpoint converts legacy mathematics requests to the new subject-agnostic format
     *       and provides backward-compatible responses while leveraging all new features:
     *       - Vector database enhancement
     *       - Advanced quality scoring
     *       - Circuit breaker reliability
     *       - Comprehensive metadata tracking
     *
     *       **Migration Notice**: This endpoint will be deprecated in v3.0.0
     *     deprecated: true
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required: [grade, type, difficulty]
     *             properties:
     *               grade:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 13
     *                 description: Grade level (1-13)
     *                 example: 5
     *               type:
     *                 type: string
     *                 description: Mathematics topic/operation type
     *                 example: "addition"
     *               difficulty:
     *                 type: string
     *                 enum: [easy, medium, hard]
     *                 description: Question difficulty level
     *                 example: "medium"
     *               count:
     *                 type: integer
     *                 minimum: 1
     *                 maximum: 10
     *                 default: 1
     *                 description: Number of questions to generate
     *                 example: 1
     *               context:
     *                 type: string
     *                 description: Additional context for question generation
     *                 example: "real-world"
     *           examples:
     *             basic_addition:
     *               summary: Basic Addition Question
     *               value:
     *                 grade: 3
     *                 type: "addition"
     *                 difficulty: "easy"
     *                 count: 1
     *             word_problems:
     *               summary: Word Problem with Context
     *               value:
     *                 grade: 6
     *                 type: "multiplication"
     *                 difficulty: "medium"
     *                 count: 1
     *                 context: "real-world"
     *             multiple_questions:
     *               summary: Multiple Questions
     *               value:
     *                 grade: 8
     *                 type: "algebra"
     *                 difficulty: "hard"
     *                 count: 3
     *     responses:
     *       200:
     *         description: Mathematics question(s) generated successfully
     *         content:
     *           application/json:
     *             schema:
     *               oneOf:
     *                 - $ref: '#/components/schemas/EducationalQuestion'
     *                 - type: array
     *                   items:
     *                     $ref: '#/components/schemas/EducationalQuestion'
     *             examples:
     *               single_question:
     *                 summary: Single Question Response
     *                 value:
     *                   id: "agentic_1728053425123"
     *                   subject: "MATHEMATICS"
     *                   grade: 5
     *                   title: "Addition Question"
     *                   question: "What is 47 + 28?"
     *                   answer: "75"
     *                   explanation: "47 + 28 = 75"
     *                   difficulty: "MEDIUM"
     *                   format: "CALCULATION"
     *                   topic: "addition"
     *               multiple_questions:
     *                 summary: Multiple Questions Response
     *                 value:
     *                   - id: "agentic_1728053425124"
     *                     question: "Solve: 3x + 7 = 22"
     *                     answer: "x = 5"
     *                     topic: "algebra"
     *                   - id: "agentic_1728053425125"
     *                     question: "If y = 2x - 3 and x = 4, what is y?"
     *                     answer: "y = 5"
     *                     topic: "algebra"
     *       400:
     *         $ref: '#/components/responses/BadRequest'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     *
     * @deprecated Use generateContent with subject=mathematics instead
     */
    public generateMathQuestion = async (
        req: Request,
        res: Response
    ): Promise<void> => {
        try {
            // Convert legacy math request to new subject-agnostic format
            const legacyRequest = req.body;
            const modernRequest: ContentGenerationRequest = {
                subject: Subject.MATHEMATICS,
                grade: Number(legacyRequest.grade),
                topic: legacyRequest.type || "addition",
                difficulty: legacyRequest.difficulty || DifficultyLevel.EASY,
                format: QuestionFormat.CALCULATION,
                count: legacyRequest.count || 1,
                context: legacyRequest.context,
            };

            // Use the modern content generation logic
            const result = await this.delegateContentGeneration(modernRequest);

            // Return in legacy format for backward compatibility
            if (result.success && result.data) {
                res.status(200).json(result.data);
            } else {
                res.status(500).json({ error: result.error });
            }
        } catch (error) {
            console.error("Legacy math question generation error:", error);
            res.status(500).json({
                error: "Internal server error during question generation",
            });
        }
    };

    // === PRIVATE HELPER METHODS ===

    /**
     * Validate content generation request
     */
    private validateContentRequest(body: any): {
        isValid: boolean;
        data?: ContentGenerationRequest;
        error?: string;
    } {
        if (!body.subject) {
            return { isValid: false, error: "Subject is required" };
        }

        if (!Object.values(Subject).includes(body.subject)) {
            return {
                isValid: false,
                error: `Invalid subject. Supported: ${Object.values(
                    Subject
                ).join(", ")}`,
            };
        }

        if (!body.grade || isNaN(Number(body.grade))) {
            return { isValid: false, error: "Valid grade is required" };
        }

        if (!body.topic) {
            return { isValid: false, error: "Topic is required" };
        }

        const count = body.count ? Number(body.count) : 1;
        if (count < 1 || count > 10) {
            return { isValid: false, error: "Count must be between 1 and 10" };
        }

        return {
            isValid: true,
            data: {
                subject: body.subject as Subject,
                grade: Number(body.grade),
                topic: body.topic,
                subtopic: body.subtopic,
                difficulty: body.difficulty || DifficultyLevel.EASY,
                format: body.format || QuestionFormat.MULTIPLE_CHOICE,
                count,
                context: body.context,
                curriculum: body.curriculum,
            },
        };
    }

    /**
     * Delegate content generation to appropriate subject handler
     */
    private async delegateContentGeneration(
        request: ContentGenerationRequest
    ): Promise<ContentGenerationResponse> {
        // Subject-specific delegation logic
        switch (request.subject) {
            case Subject.MATHEMATICS:
                return this.generateMathematicsContent(request);
            case Subject.SCIENCE:
                return this.generateScienceContent(request);
            case Subject.ENGLISH:
                return this.generateEnglishContent(request);
            case Subject.SOCIAL_STUDIES:
                return this.generateSocialStudiesContent(request);
            default:
                return {
                    success: false,
                    error: `Content generation not yet implemented for subject: ${request.subject}`,
                };
        }
    }

    /**
     * Generate mathematics content using integrated services
     * Connects to existing AgenticQuestionService and QuestionGenerationService
     */
    private async generateMathematicsContent(
        request: ContentGenerationRequest
    ): Promise<ContentGenerationResponse> {
        const startTime = Date.now();

        try {
            // Map new API parameters to legacy service parameters
            const serviceParams: MathematicsGenerationParams = {
                questionType: this.mapTopicToQuestionType(request.topic),
                difficulty: this.mapDifficultyLevel(request.difficulty),
                grade: request.grade,
                context: request.context,
                topic: request.topic,
            };

            // Generate question(s) using the service bridge
            if (request.count && request.count > 1) {
                // Multiple questions
                const questions =
                    await this.mathematicsServiceBridge.generateMultipleQuestions(
                        {
                            ...serviceParams,
                            count: request.count,
                        }
                    );

                const educationalQuestions = questions.map((q) =>
                    this.mapToEducationalQuestion(q, request)
                );

                return {
                    success: true,
                    data: educationalQuestions,
                    metadata: {
                        generationTime: Date.now() - startTime,
                        qualityScore:
                            MetadataCalculator.calculateAverageQualityScore(
                                questions
                            ),
                        relevanceScore:
                            MetadataCalculator.calculateAverageRelevanceScore(
                                questions
                            ),
                        curriculumAlignment: true,
                        vectorContext:
                            MetadataCalculator.extractEnhancedVectorContext(
                                questions
                            ),
                        serviceIntegration: {
                            servicesUsed:
                                MetadataCalculator.getUniqueServicesUsed(
                                    questions
                                ),
                            totalQuestions: questions.length,
                            averageGenerationTime:
                                MetadataCalculator.calculateAverageGenerationTime(
                                    questions
                                ),
                            averageRelevanceScore:
                                MetadataCalculator.calculateAverageRelevanceScore(
                                    questions
                                ),
                        },
                    },
                };
            } else {
                // Single question
                const question =
                    await this.mathematicsServiceBridge.generateQuestion(
                        serviceParams
                    );
                const educationalQuestion = this.mapToEducationalQuestion(
                    question,
                    request
                );

                return {
                    success: true,
                    data: educationalQuestion,
                    metadata: {
                        generationTime: Date.now() - startTime,
                        qualityScore: question.metadata.qualityScore,
                        relevanceScore: question.metadata.relevanceScore, // NEW
                        curriculumAlignment: true,
                        vectorContext: question.metadata.vectorContext, // Already enhanced
                        serviceIntegration: {
                            serviceUsed: question.metadata.serviceUsed,
                            originalMetadata: question.metadata,
                        },
                    },
                };
            }
        } catch (error) {
            console.error("Mathematics content generation error:", error);

            // Emergency fallback - always maintain service availability
            const fallbackQuestion =
                this.generateEmergencyFallbackQuestion(request);

            return {
                success: true, // Still succeed to maintain API reliability
                data: fallbackQuestion,
                metadata: {
                    generationTime: Date.now() - startTime,
                    qualityScore: 0.5,
                    curriculumAlignment: false,
                    fallbackUsed: true,
                    originalError:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                },
            };
        }
    }

    /**
     * Map topic to legacy question type format
     */
    private mapTopicToQuestionType(topic: string): string {
        const topicMap: Record<string, string> = {
            addition: "ADDITION",
            subtraction: "SUBTRACTION",
            multiplication: "MULTIPLICATION",
            division: "DIVISION",
            fractions: "FRACTIONS",
            decimals: "DECIMALS",
            geometry: "GEOMETRY",
            algebra: "ALGEBRA",
            measurement: "MEASUREMENT",
            data: "DATA_ANALYSIS",
        };

        return topicMap[topic.toLowerCase()] || "ADDITION";
    }

    /**
     * Map new difficulty levels to legacy format
     */
    private mapDifficultyLevel(difficulty: DifficultyLevel): string {
        const difficultyMap: Record<DifficultyLevel, string> = {
            [DifficultyLevel.EASY]: "easy",
            [DifficultyLevel.MEDIUM]: "medium",
            [DifficultyLevel.HARD]: "hard",
        };

        return difficultyMap[difficulty] || "easy";
    }

    /**
     * Map service result to EducationalQuestion format
     */
    private mapToEducationalQuestion(
        serviceResult: MathematicsQuestionResult,
        request: ContentGenerationRequest
    ): EducationalQuestion {
        return {
            id: serviceResult.id,
            subject: Subject.MATHEMATICS,
            grade: request.grade,
            title: `${
                request.topic.charAt(0).toUpperCase() + request.topic.slice(1)
            } Question`,
            question: serviceResult.question,
            answer: serviceResult.answer.toString(),
            explanation:
                serviceResult.explanation ||
                `Solution for ${request.topic} question`,
            difficulty: request.difficulty,
            format: request.format,
            topic: request.topic,
            subtopic: request.subtopic,
            framework: "new_zealand" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                version: "2.0.0",
                author: "Learning Hub AI",
                tags: [request.topic, request.difficulty, "integrated-service"],
                keywords: [
                    request.topic,
                    "mathematics",
                    serviceResult.metadata.serviceUsed,
                ],
                learningObjectives: [
                    `Understand ${request.topic}`,
                    `Apply ${request.topic} skills`,
                ],
                serviceMetadata: serviceResult.metadata,
            },
            subjectSpecific: {
                mathematicsData: {
                    mathType: request.topic as any,
                    formula: FormulaExtractor.extractFromQuestion(
                        serviceResult.question
                    ),
                    realWorldContext: request.context,
                    serviceUsed: serviceResult.metadata.serviceUsed,
                    qualityScore: serviceResult.metadata.qualityScore,
                },
            },
        } as EducationalQuestion;
    }

    /**
     * Generate emergency fallback question to maintain service availability
     */
    private generateEmergencyFallbackQuestion(
        request: ContentGenerationRequest
    ): EducationalQuestion {
        return {
            id: `emergency_${Date.now()}`,
            subject: Subject.MATHEMATICS,
            grade: request.grade,
            title: `${request.topic} Practice Question`,
            question: `Practice your ${request.topic} skills with this Grade ${request.grade} question.`,
            answer: "Please contact system administrator",
            explanation:
                "Emergency fallback question generated due to service unavailability",
            difficulty: request.difficulty,
            format: request.format,
            topic: request.topic,
            subtopic: request.subtopic,
            framework: "new_zealand" as any,
            createdAt: new Date(),
            updatedAt: new Date(),
            metadata: {
                version: "2.0.0",
                author: "Learning Hub Emergency System",
                tags: [request.topic, request.difficulty, "emergency-fallback"],
                keywords: [request.topic, "mathematics", "fallback"],
                learningObjectives: [
                    `Maintain service availability for ${request.topic}`,
                ],
            },
            subjectSpecific: {
                mathematicsData: {
                    mathType: request.topic as any,
                    formula: "N/A",
                    realWorldContext: request.context,
                    serviceUsed: "EmergencyFallbackGenerator",
                    qualityScore: 0.1,
                },
            },
        } as EducationalQuestion;
    }

    // REFACTORED: Optimized metadata calculation using utility classes
    // Moved to utils/metadata-calculators.ts for better performance and caching

    /**
     * Generate science content (placeholder for future implementation)
     */
    private async generateScienceContent(
        request: ContentGenerationRequest
    ): Promise<ContentGenerationResponse> {
        return {
            success: false,
            error: "Science content generation not yet implemented",
        };
    }

    /**
     * Generate English content (placeholder for future implementation)
     */
    private async generateEnglishContent(
        request: ContentGenerationRequest
    ): Promise<ContentGenerationResponse> {
        return {
            success: false,
            error: "English content generation not yet implemented",
        };
    }

    /**
     * Generate Social Studies content (placeholder for future implementation)
     */
    private async generateSocialStudiesContent(
        request: ContentGenerationRequest
    ): Promise<ContentGenerationResponse> {
        return {
            success: false,
            error: "Social Studies content generation not yet implemented",
        };
    }
}
