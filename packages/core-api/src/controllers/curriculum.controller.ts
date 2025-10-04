import { Request, Response } from 'express';
import { 
    curriculumIntegrationService,
    CurriculumIntegrationService 
 } from '../services/curriculum-integration.service.js';// Define request/response types locally since they're not exported from the service
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
    status: 'healthy' | 'degraded' | 'unhealthy';
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
     */
    async searchQuestions(req: Request, res: Response): Promise<void> {
        try {
            const searchRequest: QuestionSearchRequest = {
                query: req.query.q as string,
                subject: req.query.subject as string,
                grade: req.query.grade as string,
                difficulty: req.query.difficulty as string,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                offset: req.query.offset ? parseInt(req.query.offset as string) : undefined
            };

            console.log('🔍 Processing question search request:', searchRequest);

            const result = await this.curriculumService.searchQuestions(searchRequest);

            const response: ApiResponse<any> = {
                success: true,
                data: {
                    questions: result.questions,
                    total: result.total,
                    pagination: {
                        offset: result.offset,
                        limit: result.limit,
                        total: result.total
                    },
                    metadata: {
                        took: result.processingTime,
                        totalResults: result.total
                    }
                },
                message: `Found ${result.questions.length} questions`,
                timestamp: new Date().toISOString()
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Error in searchQuestions:', error);
            
            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message: error instanceof Error ? error.message : 'Question search failed',
                timestamp: new Date().toISOString()
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Find questions similar to provided question text
     * POST /curriculum/similar
     */
    async findSimilarQuestions(req: Request, res: Response): Promise<void> {
        try {
            const similarRequest: SimilarQuestionsRequest = {
                questionText: req.body.questionText,
                subject: req.body.subject,
                grade: req.body.grade,
                limit: req.body.limit || 10,
                minSimilarity: req.body.minSimilarity || 0.7
            };

            console.log('🔗 Processing similarity search request:', similarRequest);

            const result = await this.curriculumService.findSimilarQuestions(similarRequest);

            const response: ApiResponse<any> = {
                success: true,
                data: {
                    originalQuestion: result.originalQuestion,
                    similarQuestions: result.similarQuestions.map((question: any, index: number) => ({
                        ...question,
                        similarityScore: result.similarityScores[index]
                    })),
                    metadata: {
                        averageSimilarity: result.similarityScores.reduce((a: number, b: number) => a + b, 0) / result.similarityScores.length,
                        totalResults: result.similarQuestions.length,
                        took: result.processingTime
                    }
                },
                message: `Found ${result.similarQuestions.length} similar questions`,
                timestamp: new Date().toISOString()
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Error in findSimilarQuestions:', error);
            
            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message: error instanceof Error ? error.message : 'Similarity search failed',
                timestamp: new Date().toISOString()
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Get personalized content recommendations
     * POST /curriculum/recommendations
     */
    async getContentRecommendations(req: Request, res: Response): Promise<void> {
        try {
            const recommendationRequest: ContentRecommendationsRequest = {
                answeredQuestionIds: req.body.answeredQuestionIds,
                subject: req.body.subject,
                grade: req.body.grade,
                difficulty: req.body.difficulty,
                limit: req.body.limit || 10
            };

            console.log('💡 Processing content recommendations request:', recommendationRequest);

            const result = await this.curriculumService.getContentRecommendations(recommendationRequest);

            const response: ApiResponse<any> = {
                success: true,
                data: {
                    recommendations: result.recommendations.map((question: any, index: number) => ({
                        ...question,
                        explanation: result.explanations[index],
                        confidence: result.confidence[index]
                    })),
                    metadata: {
                        totalRecommendations: result.recommendations.length,
                        averageConfidence: result.confidence.reduce((a: number, b: number) => a + b, 0) / result.confidence.length,
                        processingTime: result.processingTime
                    }
                },
                message: `Generated ${result.recommendations.length} personalized recommendations`,
                timestamp: new Date().toISOString()
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Error in getContentRecommendations:', error);
            
            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message: error instanceof Error ? error.message : 'Content recommendations failed',
                timestamp: new Date().toISOString()
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Align question content with curriculum objectives
     * POST /curriculum/align
     */
    async getCurriculumAlignment(req: Request, res: Response): Promise<void> {
        try {
            const alignmentRequest: CurriculumAlignmentRequest = {
                questionText: req.body.questionText,
                subject: req.body.subject,
                grade: req.body.grade,
                maxAlignments: req.body.maxAlignments || 5
            };

            console.log('🎯 Processing curriculum alignment request:', alignmentRequest);

            const result = await this.curriculumService.getCurriculumAlignment(alignmentRequest);

            const response: ApiResponse<any> = {
                success: true,
                data: {
                    alignments: result.alignments,
                    metadata: {
                        totalAlignments: result.alignments.length,
                        averageScore: result.alignments.reduce((a: number, b: any) => a + b.alignmentScore, 0) / result.alignments.length,
                        processingTime: result.processingTime
                    }
                },
                message: `Found ${result.alignments.length} curriculum alignments`,
                timestamp: new Date().toISOString()
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Error in getCurriculumAlignment:', error);
            
            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message: error instanceof Error ? error.message : 'Curriculum alignment failed',
                timestamp: new Date().toISOString()
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Perform bulk ingestion of questions
     * POST /curriculum/admin/ingest
     */
    async performBulkIngestion(req: Request, res: Response): Promise<void> {
        try {
            const ingestionRequest: BulkIngestionRequest = {
                sourceDirectory: req.body.sourceDirectory,
                filePatterns: req.body.filePatterns,
                batchSize: req.body.batchSize || 100,
                validateOnly: req.body.validateOnly || false
            };

            console.log('📥 Processing bulk ingestion request:', ingestionRequest);

            const result = await this.curriculumService.performBulkIngestion(ingestionRequest);

            const response: ApiResponse<IngestionStatus> = {
                success: result.success,
                data: result,
                message: result.success 
                    ? `Successfully ingested ${result.questionsIngested} questions from ${result.filesProcessed} files`
                    : `Ingestion failed with ${result.errors.length} errors`,
                timestamp: new Date().toISOString()
            };

            res.status(result.success ? 200 : 500).json(response);
        } catch (error) {
            console.error('Error in performBulkIngestion:', error);
            
            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message: error instanceof Error ? error.message : 'Bulk ingestion failed',
                timestamp: new Date().toISOString()
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Get system health status
     * GET /curriculum/admin/health
     */
    async getHealthStatus(req: Request, res: Response): Promise<void> {
        try {
            console.log('🏥 Processing health status request');

            const health = await this.curriculumService.getHealthStatus();

            const response: ApiResponse<SystemHealthStatus> = {
                success: true,
                data: health,
                message: `System status: ${health.status}`,
                timestamp: new Date().toISOString()
            };

            const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 206 : 503;
            res.status(statusCode).json(response);
        } catch (error) {
            console.error('Error in getHealthStatus:', error);
            
            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message: error instanceof Error ? error.message : 'Health check failed',
                timestamp: new Date().toISOString()
            };

            res.status(500).json(errorResponse);
        }
    }

    /**
     * Get comprehensive system statistics
     * GET /curriculum/admin/stats
     */
    async getStatistics(req: Request, res: Response): Promise<void> {
        try {
            console.log('📊 Processing statistics request');

            const stats = await this.curriculumService.getStatistics();

            const response: ApiResponse<typeof stats> = {
                success: true,
                data: stats,
                message: 'Statistics retrieved successfully',
                timestamp: new Date().toISOString()
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Error in getStatistics:', error);
            
            const errorResponse: ApiResponse<null> = {
                success: false,
                data: null,
                message: error instanceof Error ? error.message : 'Statistics retrieval failed',
                timestamp: new Date().toISOString()
            };

            res.status(500).json(errorResponse);
        }
    }
}

// Export singleton instance
export const curriculumController = new CurriculumController();