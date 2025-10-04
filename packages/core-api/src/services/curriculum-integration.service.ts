import { Request, Response } from "express";
import {
    OpenSearchService,
    VectorDatabaseService,
    EmbeddingService,
    BulkQuestionIngester,
    CurriculumDataService,
    initializeCurriculumData,
    QuestionDocument,
    SearchFilters,
} from "@learning-hub/curriculum-data";

// Define additional types not exported from curriculum-data
interface CurriculumAlignmentResult {
    objectiveId: string;
    alignmentScore: number;
    alignmentReason: string | string[];
    confidence: "low" | "medium" | "high";
}

interface IngestionConfig {
    sourceDirectory?: string;
    filePatterns?: string[];
    batchSize?: number;
    validateOnly?: boolean;
}

interface IngestionResult {
    success: boolean;
    stats: {
        filesProcessed: number;
        questionsProcessed: number;
    };
    errors?: string[];
}

/**
 * Service for integrating curriculum data operations with the core API.
 * Orchestrates the curriculum-data package services to provide a unified interface
 * for question search, similarity search, recommendations, and curriculum alignment.
 */
export class CurriculumIntegrationService {
    private initialized: boolean = false;
    private initializationPromise: Promise<void> | null = null;

    // Core services from curriculum-data package
    private openSearchService: OpenSearchService;
    private vectorDatabaseService: VectorDatabaseService;
    private embeddingService: EmbeddingService;
    private bulkIngester: BulkQuestionIngester;
    private curriculumDataService: CurriculumDataService;

    constructor() {
        // Initialize services from curriculum-data package
        this.openSearchService = new OpenSearchService();
        this.embeddingService = new EmbeddingService({
            provider:
                (process.env.EMBEDDING_PROVIDER as
                    | "ollama"
                    | "openai"
                    | "huggingface") || "ollama",
            apiKey: process.env.OPENAI_API_KEY,
            model: process.env.EMBEDDING_MODEL || "nomic-embed-text",
        });
        this.vectorDatabaseService = new VectorDatabaseService(
            this.openSearchService,
            this.embeddingService
        );
        this.bulkIngester = new BulkQuestionIngester(
            this.openSearchService,
            this.embeddingService
        );
        this.curriculumDataService = new CurriculumDataService(
            this.openSearchService,
            this.embeddingService
        );
    }

    /**
     * Initialize the curriculum integration service.
     * Sets up OpenSearch indices and prepares services for use.
     *
     * @returns Promise<void>
     * @throws Error if initialization fails
     */
    async initialize(): Promise<void> {
        if (this.initialized) {
            return;
        }

        if (this.initializationPromise) {
            return this.initializationPromise;
        }

        this.initializationPromise = this.performInitialization();
        await this.initializationPromise;
    }

    private async performInitialization(): Promise<void> {
        try {
            // Initialize curriculum data infrastructure
            const initResult = await initializeCurriculumData();

            if (!initResult.success) {
                throw new Error(
                    `Curriculum data initialization failed: ${initResult.message}`
                );
            }

            this.initialized = true;
            console.log(
                "✅ Curriculum Integration Service initialized successfully"
            );
        } catch (error) {
            console.error(
                "❌ Failed to initialize Curriculum Integration Service:",
                error
            );
            throw error;
        }
    }

    /**
     * Search for questions based on query, subject, grade, and other filters.
     *
     * @param request - Search request parameters
     * @returns Promise<SearchResult> Question search results
     */
    async searchQuestions(request: {
        query?: string;
        subject?: string;
        grade?: string;
        difficulty?: string;
        questionTypes?: string[];
        limit?: number;
        offset?: number;
    }): Promise<{
        questions: QuestionDocument[];
        total: number;
        offset: number;
        limit: number;
        processingTime: number;
    }> {
        await this.initialize();

        const startTime = Date.now();

        // Build search filters
        const filters: SearchFilters = {
            subject: request.subject,
            grade: request.grade ? parseInt(request.grade) : undefined,
            difficulty: request.difficulty,
        };

        // Use OpenSearch directly for question search
        const searchResponse = await this.openSearchService.client.search({
            index: this.openSearchService.config.vectorIndex,
            body: {
                query: {
                    bool: {
                        must: request.query
                            ? [
                                  {
                                      multi_match: {
                                          query: request.query,
                                          fields: [
                                              "question",
                                              "content",
                                              "explanation",
                                          ],
                                      },
                                  },
                              ]
                            : [{ match_all: {} }],
                        filter: Object.entries(filters)
                            .filter(([_, value]) => value !== undefined)
                            .map(([key, value]) => ({
                                term: { [key]: value },
                            })),
                    },
                },
                from: request.offset || 0,
                size: request.limit || 10,
            },
        });

        const questions = searchResponse.body.hits.hits.map((hit: any) => ({
            id: hit._id,
            ...hit._source,
        }));

        const processingTime = Date.now() - startTime;

        return {
            questions,
            total:
                typeof searchResponse.body.hits.total === "object"
                    ? searchResponse.body.hits.total.value
                    : searchResponse.body.hits.total || 0,
            offset: request.offset || 0,
            limit: request.limit || 10,
            processingTime,
        };
    }

    /**
     * Find questions similar to a given question text using vector similarity.
     *
     * @param request - Similarity search request
     * @returns Promise<SimilarityResult> Similar questions with scores
     */
    async findSimilarQuestions(request: {
        questionText: string;
        subject?: string;
        grade?: string;
        limit?: number;
        minSimilarity?: number;
    }): Promise<{
        originalQuestion: string;
        similarQuestions: QuestionDocument[];
        similarityScores: number[];
        processingTime: number;
    }> {
        await this.initialize();

        const startTime = Date.now();

        // Find similar questions using vector similarity
        const results = await this.vectorDatabaseService.findSimilarQuestions(
            request.questionText,
            {
                k: request.limit || 5,
                threshold: request.minSimilarity || 0.7,
                filters: {
                    subject: request.subject,
                    grade: request.grade ? parseInt(request.grade) : undefined,
                },
            }
        );

        const processingTime = Date.now() - startTime;

        return {
            originalQuestion: request.questionText,
            similarQuestions: results.map((r: any) => r.question),
            similarityScores: results.map((r: any) => r.similarityScore),
            processingTime,
        };
    }

    /**
     * Get personalized content recommendations based on answered questions.
     *
     * @param request - Recommendation request
     * @returns Promise<RecommendationResult> Recommended questions and explanations
     */
    async getContentRecommendations(request: {
        answeredQuestionIds: string[];
        subject?: string;
        grade?: string;
        difficulty?: string;
        limit?: number;
    }): Promise<{
        recommendations: QuestionDocument[];
        explanations: string[];
        confidence: number[];
        processingTime: number;
    }> {
        await this.initialize();

        const startTime = Date.now();

        // Get content recommendations using vector database service
        const results =
            await this.vectorDatabaseService.getContentRecommendations(
                request.answeredQuestionIds,
                {
                    maxResults: request.limit || 5,
                    subjectFocus: request.subject,
                    difficultyProgression: request.difficulty === "progressive",
                }
            );

        const processingTime = Date.now() - startTime;

        return {
            recommendations: results.map((r: any) => r.question),
            explanations: results.map(
                (r: any) =>
                    r.explanation ||
                    "Similar content based on your learning history"
            ),
            confidence: results.map((r: any) => r.confidence || 0.5),
            processingTime,
        };
    }

    /**
     * Align question content with curriculum objectives.
     *
     * @param request - Alignment request
     * @returns Promise<AlignmentResult> Curriculum alignment analysis
     */
    async getCurriculumAlignment(request: {
        questionText: string;
        subject?: string;
        grade?: string;
        maxAlignments?: number;
    }): Promise<{
        alignments: Array<{
            objectiveId: string;
            alignmentScore: number;
            alignmentReason: string;
            confidence: "low" | "medium" | "high";
        }>;
        processingTime: number;
    }> {
        await this.initialize();

        const startTime = Date.now();

        // Get curriculum alignment using the correct method name
        const alignments =
            await this.curriculumDataService.alignQuestionToCurriculum(
                request.questionText,
                {
                    subject: request.subject,
                    grade: request.grade ? parseInt(request.grade) : undefined,
                }
            );

        const processingTime = Date.now() - startTime;

        return {
            alignments: alignments.map((alignment: any) => ({
                objectiveId: alignment.objectiveId,
                alignmentScore:
                    alignment.alignmentScore || alignment.score || 0.5,
                alignmentReason: Array.isArray(alignment.alignmentReason)
                    ? alignment.alignmentReason.join(", ")
                    : alignment.alignmentReason ||
                      alignment.reason ||
                      "Similar content",
                confidence: alignment.confidence || "medium",
            })),
            processingTime,
        };
    }

    /**
     * Perform bulk ingestion of questions from various source files.
     *
     * @param request - Bulk ingestion request
     * @returns Promise<IngestionResult> Ingestion status and statistics
     */
    async performBulkIngestion(request: {
        sourceDirectory?: string;
        filePatterns?: string[];
        batchSize?: number;
        validateOnly?: boolean;
    }): Promise<{
        success: boolean;
        filesProcessed: number;
        questionsIngested: number;
        errors: string[];
        processingTime: number;
    }> {
        await this.initialize();

        const startTime = Date.now();

        try {
            // Perform bulk ingestion using the correct method name
            const result = await this.bulkIngester.ingestExistingQuestions({
                sourceDirectory: request.sourceDirectory || process.cwd(),
                filePatterns: request.filePatterns || [
                    "grade*-questions*.json",
                    "curriculum-*.json",
                    "*-questions-vector-ready.json",
                ],
                batchSize: request.batchSize || 100,
                validateOnly: request.validateOnly || false,
            } as IngestionConfig);

            const processingTime = Date.now() - startTime;

            return {
                success: result.failedQuestions === 0,
                filesProcessed: result.totalFiles,
                questionsIngested: result.processedQuestions,
                errors: result.errors.map((e) => `${e.file}: ${e.error}`),
                processingTime,
            };
        } catch (error) {
            const processingTime = Date.now() - startTime;

            return {
                success: false,
                filesProcessed: 0,
                questionsIngested: 0,
                errors: [
                    error instanceof Error ? error.message : String(error),
                ],
                processingTime,
            };
        }
    }

    /**
     * Get health status of curriculum services.
     *
     * @returns Promise<HealthStatus> Service health information
     */
    async getHealthStatus(): Promise<{
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
    }> {
        const health: {
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
        } = {
            status: "healthy",
            services: {
                openSearch: false,
                embedding: false,
                vectorDatabase: false,
            },
            details: {},
        };

        try {
            // Check OpenSearch health using cluster health API
            const osHealth =
                await this.openSearchService.client.cluster.health();
            health.services.openSearch =
                osHealth.body.status === "green" ||
                osHealth.body.status === "yellow";
            health.details.indexHealth = osHealth.body;
        } catch (error) {
            console.warn(
                "OpenSearch health check failed:",
                error instanceof Error ? error.message : String(error)
            );
        }

        try {
            // Check embedding service
            await this.embeddingService.generateEmbedding("test");
            health.services.embedding = true;
            health.details.embeddingProvider = "ollama"; // Default provider
        } catch (error) {
            console.warn(
                "Embedding service check failed:",
                error instanceof Error ? error.message : String(error)
            );
        }

        // Vector database depends on both OpenSearch and embedding
        health.services.vectorDatabase =
            health.services.openSearch && health.services.embedding;

        // Determine overall status
        const healthyServices = Object.values(health.services).filter(
            Boolean
        ).length;
        if (healthyServices === 3) {
            health.status = "healthy";
        } else if (healthyServices >= 1) {
            health.status = "degraded";
        } else {
            health.status = "unhealthy";
        }

        return health;
    }

    /**
     * Get comprehensive statistics about the curriculum data.
     *
     * @returns Promise<CurriculumStats> Statistical information
     */
    async getStatistics(): Promise<{
        questions: {
            total: number;
            bySubject: Record<string, number>;
            byGrade: Record<string, number>;
            byDifficulty: Record<string, number>;
        };
        curriculum: {
            totalObjectives: number;
            bySubject: Record<string, number>;
            byGrade: Record<string, number>;
        };
        vectorDatabase: {
            indexSize: number;
            dimensionality: number;
            lastUpdated: string;
        };
    }> {
        await this.initialize();

        // Initialize stats structure
        const stats = {
            questions: {
                total: 0,
                bySubject: {},
                byGrade: {},
                byDifficulty: {},
            },
            curriculum: {
                totalObjectives: 0,
                bySubject: {},
                byGrade: {},
            },
            vectorDatabase: {
                indexSize: 0,
                dimensionality: 768,
                lastUpdated: new Date().toISOString(),
            },
        };

        try {
            // Get question statistics
            const questionStats =
                await this.openSearchService.client.indices.stats({
                    index: this.openSearchService.config.vectorIndex,
                });

            if (questionStats.body?.indices) {
                stats.questions.total =
                    questionStats.body?.indices?.[
                        this.openSearchService.config.vectorIndex
                    ]?.total?.docs?.count || 0;
                stats.vectorDatabase.indexSize = stats.questions.total;
            }
        } catch (error) {
            console.warn(
                "Could not get question count:",
                error instanceof Error ? error.message : String(error)
            );
        }

        try {
            // Get curriculum statistics
            const curriculumStats =
                await this.openSearchService.client.indices.stats({
                    index: this.openSearchService.config.curriculumIndex,
                });

            if (curriculumStats.body?.indices) {
                stats.curriculum.totalObjectives =
                    curriculumStats.body?.indices?.[
                        this.openSearchService.config.curriculumIndex
                    ]?.total?.docs?.count || 0;
            }
        } catch (error) {
            console.warn(
                "Could not get curriculum count:",
                error instanceof Error ? error.message : String(error)
            );
        }

        return stats;
    }

    /**
     * Check if the service is properly initialized.
     *
     * @returns boolean True if service is ready for use
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Get the underlying curriculum data services for advanced operations.
     *
     * @returns Object containing all curriculum data services
     */
    getServices() {
        return {
            openSearch: this.openSearchService,
            vectorDatabase: this.vectorDatabaseService,
            embedding: this.embeddingService,
            bulkIngester: this.bulkIngester,
            curriculumData: this.curriculumDataService,
        };
    }
}

// Export singleton instance
export const curriculumIntegrationService = new CurriculumIntegrationService();
