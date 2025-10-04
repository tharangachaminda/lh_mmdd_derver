/**
 * Vector Database Service
 *
 * High-level service for vector database operations including similarity search,
 * question retrieval, and content recommendation. Orchestrates OpenSearch and
 * Embedding services to provide unified vector database functionality.
 *
 * @fileoverview High-level vector database operations service
 * @version 1.0.0
 */

import {
    OpenSearchService,
    QuestionDocument,
    SearchFilters,
    SearchResult,
} from "../services/opensearch.service.js";
import { EmbeddingService } from "./embedding.service.js";

/**
 * Similarity search configuration
 */
interface SimilaritySearchConfig {
    k: number; // Number of results to return
    threshold?: number; // Minimum similarity score (0-1)
    filters?: SearchFilters; // Additional filters
    includeScore?: boolean; // Include similarity scores in results
    rerankByRelevance?: boolean; // Re-rank results by semantic relevance
}

/**
 * Content recommendation configuration
 */
interface RecommendationConfig {
    maxResults: number;
    diversityFactor?: number; // 0-1, higher = more diverse results
    difficultyProgression?: boolean; // Recommend increasing difficulty
    subjectFocus?: string; // Focus on specific subject
    excludeIds?: string[]; // Exclude specific question IDs
}

/**
 * Search result with similarity score
 */
interface VectorSearchResult {
    questions: QuestionDocument[];
    total: number;
    took: number;
    maxScore?: number;
    similarityScore: number;
    explanation?: string;
}

/**
 * Batch search request
 */
interface BatchSearchRequest {
    queries: Array<{
        id: string;
        text: string;
        config?: SimilaritySearchConfig;
    }>;
    globalConfig?: SimilaritySearchConfig;
}

/**
 * Batch search result
 */
interface BatchSearchResult {
    results: Array<{
        queryId: string;
        matches: VectorSearchResult[];
        processingTime: number;
    }>;
    totalProcessingTime: number;
    errors: Array<{
        queryId: string;
        error: string;
    }>;
}

/**
 * Question clustering result
 */
interface ClusteringResult {
    clusters: Array<{
        id: string;
        centroid: number[];
        questions: QuestionDocument[];
        keywords: string[];
        averageScore: number;
    }>;
    totalQuestions: number;
    processingTime: number;
}

/**
 * Vector Database Service class
 */
export class VectorDatabaseService {
    private openSearchService: OpenSearchService;
    private embeddingService: EmbeddingService;

    constructor(
        openSearchService: OpenSearchService,
        embeddingService: EmbeddingService
    ) {
        this.openSearchService = openSearchService;
        this.embeddingService = embeddingService;
        console.log("🔧 Vector Database Service initialized");
    }

    /**
     * Find similar questions using vector similarity search
     */
    async findSimilarQuestions(
        queryText: string,
        config: SimilaritySearchConfig = { k: 10 }
    ): Promise<VectorSearchResult[]> {
        try {
            console.log(
                `🔍 Finding similar questions for: "${queryText.substring(
                    0,
                    50
                )}..."`
            );

            // Generate embedding for query text
            const queryEmbedding =
                await this.embeddingService.generateEmbedding(queryText);

            // Perform vector similarity search
            const searchResult =
                await this.openSearchService.vectorSimilaritySearch(
                    queryEmbedding,
                    config.k,
                    config.filters
                );

            // Convert to vector search results with similarity scores
            const results: VectorSearchResult[] = searchResult.questions.map(
                (question) => ({
                    questions: [question],
                    total: 1,
                    took: searchResult.took,
                    maxScore: searchResult.maxScore,
                    similarityScore: this.calculateSimilarityScore(
                        queryEmbedding,
                        question.embedding || []
                    ),
                    explanation: this.generateExplanation(queryText, question),
                })
            );

            // Filter by threshold if specified
            let filteredResults = results;
            if (config.threshold) {
                filteredResults = results.filter(
                    (result) =>
                        (result.similarityScore || 0) >= config.threshold!
                );
            }

            // Re-rank by relevance if requested
            if (config.rerankByRelevance) {
                filteredResults = await this.rerankByRelevance(
                    queryText,
                    filteredResults
                );
            }

            console.log(`✅ Found ${filteredResults.length} similar questions`);
            return filteredResults;
        } catch (error) {
            console.error(`❌ Error finding similar questions: ${error}`);
            throw error;
        }
    }

    /**
     * Get content recommendations based on user's learning history
     */
    async getContentRecommendations(
        answeredQuestionIds: string[],
        config: RecommendationConfig
    ): Promise<VectorSearchResult[]> {
        try {
            console.log(
                `📚 Generating recommendations based on ${answeredQuestionIds.length} answered questions`
            );

            if (answeredQuestionIds.length === 0) {
                return this.getRandomQuestions(
                    config.maxResults,
                    config.subjectFocus
                );
            }

            // Get embeddings for answered questions
            const answeredQuestions =
                await this.openSearchService.getQuestionsByIds(
                    answeredQuestionIds
                );

            if (answeredQuestions.length === 0) {
                return this.getRandomQuestions(
                    config.maxResults,
                    config.subjectFocus
                );
            }

            // Calculate centroid embedding from answered questions
            const centroidEmbedding = this.calculateCentroid(
                answeredQuestions
                    .map((q) => q.embedding)
                    .filter((emb): emb is number[] => emb !== undefined)
            );

            if (centroidEmbedding.length === 0) {
                return this.getRandomQuestions(
                    config.maxResults,
                    config.subjectFocus
                );
            }

            // Find similar questions
            const searchFilters: SearchFilters = {
                subject: config.subjectFocus,
                excludeIds: [
                    ...answeredQuestionIds,
                    ...(config.excludeIds || []),
                ],
            };

            const similarQuestions =
                await this.openSearchService.vectorSimilaritySearch(
                    centroidEmbedding,
                    config.maxResults * 2, // Get more to allow for diversity filtering
                    searchFilters
                );

            // Apply diversity and difficulty progression
            let recommendations: VectorSearchResult[] =
                similarQuestions.questions.map((question) => ({
                    questions: [question],
                    total: 1,
                    took: similarQuestions.took,
                    maxScore: similarQuestions.maxScore,
                    similarityScore: this.calculateSimilarityScore(
                        centroidEmbedding,
                        question.embedding || []
                    ),
                }));

            if (config.diversityFactor && config.diversityFactor > 0) {
                recommendations = this.applyDiversityFilter(
                    recommendations,
                    config.diversityFactor
                );
            }

            if (config.difficultyProgression) {
                recommendations = this.applyDifficultyProgression(
                    recommendations,
                    answeredQuestions
                );
            }

            // Limit to requested number of results
            recommendations = recommendations.slice(0, config.maxResults);

            console.log(
                `✅ Generated ${recommendations.length} content recommendations`
            );
            return recommendations;
        } catch (error) {
            console.error(`❌ Error generating recommendations: ${error}`);
            throw error;
        }
    }

    /**
     * Perform batch similarity search for multiple queries
     */
    async batchSimilaritySearch(
        request: BatchSearchRequest
    ): Promise<BatchSearchResult> {
        const startTime = Date.now();
        const results: BatchSearchResult["results"] = [];
        const errors: BatchSearchResult["errors"] = [];

        console.log(
            `📦 Processing batch similarity search for ${request.queries.length} queries`
        );

        for (const query of request.queries) {
            const queryStartTime = Date.now();

            try {
                const config = {
                    k: 10,
                    ...request.globalConfig,
                    ...query.config,
                };
                const matches = await this.findSimilarQuestions(
                    query.text,
                    config
                );

                results.push({
                    queryId: query.id,
                    matches,
                    processingTime: Date.now() - queryStartTime,
                });
            } catch (error) {
                console.error(
                    `❌ Error processing query ${query.id}: ${error}`
                );
                errors.push({
                    queryId: query.id,
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }
        }

        const totalProcessingTime = Date.now() - startTime;

        console.log(
            `✅ Batch search completed: ${results.length} successful, ${errors.length} failed, ${totalProcessingTime}ms`
        );

        return {
            results,
            totalProcessingTime,
            errors,
        };
    }

    /**
     * Cluster questions by similarity
     */
    async clusterQuestions(
        questionIds?: string[],
        numberOfClusters: number = 5
    ): Promise<ClusteringResult> {
        const startTime = Date.now();

        try {
            console.log(
                `🎯 Clustering questions into ${numberOfClusters} clusters`
            );

            // Get questions to cluster
            const questions = questionIds
                ? await this.openSearchService.getQuestionsByIds(questionIds)
                : await this.openSearchService.getAllQuestions();

            // Filter questions with embeddings
            const questionsWithEmbeddings = questions.filter(
                (q) => q.embedding && q.embedding.length > 0
            );

            if (questionsWithEmbeddings.length === 0) {
                throw new Error(
                    "No questions with embeddings found for clustering"
                );
            }

            // Perform k-means clustering (simplified implementation)
            const clusters = await this.performKMeansClustering(
                questionsWithEmbeddings,
                numberOfClusters
            );

            const processingTime = Date.now() - startTime;

            console.log(
                `✅ Clustering completed: ${clusters.length} clusters, ${questionsWithEmbeddings.length} questions, ${processingTime}ms`
            );

            return {
                clusters,
                totalQuestions: questionsWithEmbeddings.length,
                processingTime,
            };
        } catch (error) {
            console.error(`❌ Error clustering questions: ${error}`);
            throw error;
        }
    }

    /**
     * Calculate similarity score between two embeddings
     */
    private calculateSimilarityScore(
        embedding1: number[],
        embedding2: number[]
    ): number {
        if (
            embedding1.length !== embedding2.length ||
            embedding1.length === 0
        ) {
            return 0;
        }

        // Cosine similarity
        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < embedding1.length; i++) {
            dotProduct += embedding1[i] * embedding2[i];
            norm1 += embedding1[i] * embedding1[i];
            norm2 += embedding2[i] * embedding2[i];
        }

        const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
        return magnitude === 0 ? 0 : dotProduct / magnitude;
    }

    /**
     * Generate explanation for why a question is similar
     */
    private generateExplanation(
        queryText: string,
        question: QuestionDocument
    ): string {
        const commonWords = this.findCommonWords(queryText, question.question);
        const topicMatch = question.topic ? ` (${question.topic})` : "";

        if (commonWords.length > 0) {
            return `Similar concepts: ${commonWords
                .slice(0, 3)
                .join(", ")}${topicMatch}`;
        }

        return `Related content${topicMatch}`;
    }

    /**
     * Find common words between two texts
     */
    private findCommonWords(text1: string, text2: string): string[] {
        const words1 = text1
            .toLowerCase()
            .split(/\W+/)
            .filter((word) => word.length > 3);
        const words2 = text2
            .toLowerCase()
            .split(/\W+/)
            .filter((word) => word.length > 3);

        return words1.filter((word) => words2.includes(word));
    }

    /**
     * Re-rank results by semantic relevance
     */
    private async rerankByRelevance(
        queryText: string,
        results: VectorSearchResult[]
    ): Promise<VectorSearchResult[]> {
        // For now, just return the original results
        // In the future, could implement more sophisticated re-ranking
        return results.sort(
            (a, b) => (b.similarityScore || 0) - (a.similarityScore || 0)
        );
    }

    /**
     * Calculate centroid embedding from multiple embeddings
     */
    private calculateCentroid(embeddings: number[][]): number[] {
        if (embeddings.length === 0) return [];

        const dimensions = embeddings[0].length;
        const centroid = new Array(dimensions).fill(0);

        for (const embedding of embeddings) {
            for (let i = 0; i < dimensions; i++) {
                centroid[i] += embedding[i];
            }
        }

        // Average the values
        for (let i = 0; i < dimensions; i++) {
            centroid[i] /= embeddings.length;
        }

        return centroid;
    }

    /**
     * Apply diversity filter to results
     */
    private applyDiversityFilter(
        results: VectorSearchResult[],
        diversityFactor: number
    ): VectorSearchResult[] {
        // Simple diversity implementation: spread results across different topics
        const topicGroups = new Map<string, VectorSearchResult[]>();

        for (const result of results) {
            const topic = result.questions[0]?.topic || "unknown";
            if (!topicGroups.has(topic)) {
                topicGroups.set(topic, []);
            }
            topicGroups.get(topic)!.push(result);
        }

        // Round-robin selection from topic groups
        const diverseResults: VectorSearchResult[] = [];
        const maxPerTopic = Math.ceil(results.length / topicGroups.size);

        let round = 0;
        while (diverseResults.length < results.length && round < maxPerTopic) {
            for (const [topic, topicResults] of topicGroups) {
                if (round < topicResults.length) {
                    diverseResults.push(topicResults[round]);
                }
                if (diverseResults.length >= results.length) break;
            }
            round++;
        }

        return diverseResults;
    }

    /**
     * Apply difficulty progression to recommendations
     */
    private applyDifficultyProgression(
        results: VectorSearchResult[],
        answeredQuestions: QuestionDocument[]
    ): VectorSearchResult[] {
        // Calculate average difficulty of answered questions
        const difficulties = answeredQuestions
            .map((q) => this.difficultyToNumber(q.difficulty))
            .filter((d) => d > 0);

        if (difficulties.length === 0) return results;

        const avgDifficulty =
            difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length;
        const targetDifficulty = Math.min(3, avgDifficulty + 0.2); // Slightly increase difficulty

        // Sort by how close to target difficulty, then by similarity
        return results.sort((a, b) => {
            const aDiff = Math.abs(
                this.difficultyToNumber(
                    a.questions[0]?.difficulty || "medium"
                ) - targetDifficulty
            );
            const bDiff = Math.abs(
                this.difficultyToNumber(
                    b.questions[0]?.difficulty || "medium"
                ) - targetDifficulty
            );

            if (Math.abs(aDiff - bDiff) < 0.1) {
                return (b.similarityScore || 0) - (a.similarityScore || 0);
            }

            return aDiff - bDiff;
        });
    }

    /**
     * Convert difficulty string to number
     */
    private difficultyToNumber(difficulty: string): number {
        switch (difficulty?.toLowerCase()) {
            case "easy":
                return 1;
            case "medium":
                return 2;
            case "hard":
                return 3;
            default:
                return 2; // Default to medium
        }
    }

    /**
     * Get random questions as fallback
     */
    private async getRandomQuestions(
        count: number,
        subject?: string
    ): Promise<VectorSearchResult[]> {
        const filters: SearchFilters = subject ? { subject } : {};
        const searchResult = await this.openSearchService.searchQuestions(
            "",
            filters,
            count
        );

        return searchResult.questions.map((question) => ({
            questions: [question],
            total: 1,
            took: searchResult.took,
            maxScore: searchResult.maxScore,
            similarityScore: 0.5, // Neutral score for random questions
        }));
    }

    /**
     * Perform simplified k-means clustering
     */
    private async performKMeansClustering(
        questions: QuestionDocument[],
        k: number
    ): Promise<ClusteringResult["clusters"]> {
        const embeddings = questions.map((q) => q.embedding!);

        // Initialize centroids randomly
        const centroids: number[][] = [];
        for (let i = 0; i < k; i++) {
            const randomIndex = Math.floor(Math.random() * embeddings.length);
            centroids.push([...embeddings[randomIndex]]);
        }

        // Simple k-means implementation
        let assignments = new Array(questions.length).fill(0);
        let maxIterations = 10;

        for (let iter = 0; iter < maxIterations; iter++) {
            let changed = false;

            // Assign each point to nearest centroid
            for (let i = 0; i < questions.length; i++) {
                let bestCluster = 0;
                let bestScore = this.calculateSimilarityScore(
                    embeddings[i],
                    centroids[0]
                );

                for (let j = 1; j < k; j++) {
                    const score = this.calculateSimilarityScore(
                        embeddings[i],
                        centroids[j]
                    );
                    if (score > bestScore) {
                        bestScore = score;
                        bestCluster = j;
                    }
                }

                if (assignments[i] !== bestCluster) {
                    assignments[i] = bestCluster;
                    changed = true;
                }
            }

            if (!changed) break;

            // Update centroids
            for (let j = 0; j < k; j++) {
                const clusterPoints = embeddings.filter(
                    (_, i) => assignments[i] === j
                );
                if (clusterPoints.length > 0) {
                    centroids[j] = this.calculateCentroid(clusterPoints);
                }
            }
        }

        // Create cluster results
        const clusters: ClusteringResult["clusters"] = [];
        for (let i = 0; i < k; i++) {
            const clusterQuestions = questions.filter(
                (_, index) => assignments[index] === i
            );

            if (clusterQuestions.length > 0) {
                clusters.push({
                    id: `cluster_${i}`,
                    centroid: centroids[i],
                    questions: clusterQuestions,
                    keywords: this.extractClusterKeywords(clusterQuestions),
                    averageScore:
                        clusterQuestions.reduce(
                            (sum, q) =>
                                sum + this.difficultyToNumber(q.difficulty),
                            0
                        ) / clusterQuestions.length,
                });
            }
        }

        return clusters;
    }

    /**
     * Extract keywords for a cluster
     */
    private extractClusterKeywords(questions: QuestionDocument[]): string[] {
        const wordCounts = new Map<string, number>();

        for (const question of questions) {
            const words = [
                ...question.question.split(/\W+/),
                ...(question.keywords || []),
                question.topic || "",
            ]
                .filter((word) => word.length > 3)
                .map((word) => word.toLowerCase());

            for (const word of words) {
                wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
            }
        }

        return Array.from(wordCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word]) => word);
    }
}
