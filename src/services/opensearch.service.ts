import { Client } from "@opensearch-project/opensearch";

// Type for all OpenSearch responses
export interface OSResponse<T> {
    body: T;
    statusCode?: number;
}

// Types for request parameters
export interface IndexParams {
    index: string;
    body: Record<string, any>;
}

export interface SearchParams extends IndexParams {
    body: {
        size?: number;
        query: Record<string, any>;
    };
}

export interface DeleteByQueryParams extends IndexParams {
    body: {
        query: Record<string, any>;
    };
}

// Basic client interfaces
export interface MinimalClient {
    indices: {
        exists: (params: { index: string }) => Promise<OSResponse<boolean>>;
        create: (
            params: IndexParams
        ) => Promise<OSResponse<{ acknowledged: boolean }>>;
    };
    index: (
        params: IndexParams
    ) => Promise<OSResponse<{ result: string; _id: string }>>;
    search: (
        params: SearchParams
    ) => Promise<OSResponse<{ hits: { hits: any[] } }>>;
    deleteByQuery: (
        params: DeleteByQueryParams
    ) => Promise<OSResponse<{ deleted: number }>>;
    cluster: {
        health: () => Promise<
            OSResponse<{ status: string; cluster_name: string }>
        >;
    };
}

// Enhanced question interface for vector storage
export interface EnhancedQuestion {
    id: string;
    question: string;
    answer: number | string;
    explanation: string;
    type: string;
    difficulty: string;
    keywords: string[];
    grade: number;
    subject: string;
    conceptName: string;
    prerequisites: string[];
    learningObjectives: string[];
    gradeLevelStandards: {
        strand: string;
        standard: string;
        description: string;
    };
    fullText: string;
    searchKeywords: string;
    contentForEmbedding: string;
    embedding?: number[];
}

class OpenSearchService {
    private readonly client: Client | MinimalClient;
    private readonly indexName = "math-questions";
    private readonly enhancedIndexName =
        process.env.VECTOR_INDEX_NAME || "enhanced_questions";

    constructor(client?: Client | MinimalClient) {
        this.client =
            client ??
            new Client({
                node: process.env.OPENSEARCH_NODE || "https://localhost:9200",
                auth: {
                    username: process.env.OPENSEARCH_USERNAME || "admin",
                    password: process.env.OPENSEARCH_PASSWORD || "h7F!q9rT#4vL",
                },
                // Add additional configuration options
                ssl: {
                    rejectUnauthorized: false, // For development only, since we're using self-signed certificates
                },
                maxRetries: 3,
                requestTimeout: 30000, // Increased timeout
                sniffOnStart: false, // Disabled sniffing since we're using SSL
            });
    }

    /**
     * Initialize the index if it doesn't exist
     */
    public async initializeIndex(): Promise<void> {
        const indexExists = await this.client.indices.exists({
            index: this.indexName,
        });

        if (!indexExists.body) {
            await this.client.indices.create({
                index: this.indexName,
                body: {
                    settings: {
                        index: {
                            knn: true,
                        },
                    },
                    mappings: {
                        properties: {
                            questionId: { type: "keyword" },
                            question: { type: "text" },
                            embedding: {
                                type: "knn_vector",
                                dimension: 1536, // Using OpenAI's embedding dimension
                                method: {
                                    name: "hnsw",
                                    space_type: "cosinesimil",
                                    engine: "lucene",
                                },
                            },
                            difficulty: { type: "keyword" },
                            topic: { type: "keyword" },
                            createdAt: { type: "date" },
                        },
                    },
                },
            });
        }
    }

    /**
     * Store a question with its embedding in OpenSearch
     */
    public async storeQuestionEmbedding(data: {
        questionId: string;
        question: string;
        embedding: number[];
        difficulty: string;
        topic: string;
    }): Promise<void> {
        await this.client.index({
            index: this.indexName,
            body: {
                ...data,
                createdAt: new Date().toISOString(),
            },
        });
    }

    /**
     * Search for similar questions using vector similarity
     */
    public async searchSimilarQuestions(
        embedding: number[],
        size: number = 5
    ): Promise<
        Array<{
            score: number;
            questionId: string;
            question: string;
            topic: string;
            difficulty: string;
        }>
    > {
        const response = await this.client.search({
            index: this.indexName,
            body: {
                size,
                query: {
                    bool: {
                        must: [
                            {
                                knn: {
                                    embedding: {
                                        vector: embedding,
                                        k: size,
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        });

        // Sort results by score and map to the desired format
        return [...response.body.hits.hits]
            .sort((a, b) => (b._score || 0) - (a._score || 0))
            .map((hit) => ({
                score: hit._score || 0,
                questionId: hit._source.questionId,
                question: hit._source.question,
                topic: hit._source.topic,
                difficulty: hit._source.difficulty,
            }));
    }

    /**
     * Delete a question by ID
     */
    public async deleteQuestion(questionId: string): Promise<void> {
        await this.client.deleteByQuery({
            index: this.indexName,
            body: {
                query: {
                    term: { questionId },
                },
            },
        });
    }

    /**
     * Get the health status of the OpenSearch cluster
     */
    public async getClusterHealth(): Promise<{
        status: string;
        cluster_name: string;
    }> {
        const response = await this.client.cluster.health();
        return response.body;
    }

    /**
     * Initialize the enhanced index with complete metadata schema
     */
    public async initializeEnhancedIndex(): Promise<void> {
        const indexExists = await this.client.indices.exists({
            index: this.enhancedIndexName,
        });

        if (!indexExists.body) {
            await this.client.indices.create({
                index: this.enhancedIndexName,
                body: {
                    settings: {
                        index: {
                            knn: true,
                        },
                    },
                    mappings: {
                        properties: {
                            // Enhanced question fields
                            id: { type: "keyword" },
                            question: { type: "text" },
                            answer: { type: "text" },
                            explanation: { type: "text" },
                            type: { type: "keyword" },
                            difficulty: { type: "keyword" },
                            keywords: { type: "keyword" },

                            // Enhanced curriculum metadata
                            grade: { type: "integer" },
                            subject: { type: "keyword" },
                            conceptName: { type: "text" },
                            prerequisites: { type: "text" },
                            learningObjectives: { type: "text" },
                            gradeLevelStandards: {
                                type: "object",
                                properties: {
                                    strand: { type: "keyword" },
                                    standard: { type: "text" },
                                    description: { type: "text" },
                                },
                            },

                            // Enhanced search fields
                            fullText: { type: "text" },
                            searchKeywords: { type: "text" },
                            contentForEmbedding: { type: "text" },

                            // Vector embedding
                            embedding: {
                                type: "knn_vector",
                                dimension: 1536,
                                method: {
                                    name: "hnsw",
                                    space_type: "cosinesimil",
                                    engine: "lucene",
                                },
                            },

                            // Metadata
                            createdAt: { type: "date" },
                            updatedAt: { type: "date" },
                        },
                    },
                },
            });
        }
    }

    /**
     * Store enhanced question with complete metadata
     */
    public async storeEnhancedQuestion(
        question: EnhancedQuestion
    ): Promise<void> {
        const now = new Date().toISOString();
        await this.client.index({
            index: this.enhancedIndexName,
            body: {
                ...question,
                createdAt: now,
                updatedAt: now,
            },
        });
    }

    /**
     * Search enhanced questions with filtering and vector similarity
     */
    public async searchEnhancedQuestions(params: {
        embedding: number[];
        filters?: {
            grade?: number;
            difficulty?: string;
            subject?: string;
            type?: string;
        };
        size?: number;
    }): Promise<
        Array<{
            id: string;
            score: number;
            question: string;
            difficulty: string;
            grade: number;
            type: string;
            subject: string;
        }>
    > {
        const { embedding, filters = {}, size = 5 } = params;

        // Build filter clauses
        const filterClauses = [];
        if (filters.grade)
            filterClauses.push({ term: { grade: filters.grade } });
        if (filters.difficulty)
            filterClauses.push({ term: { difficulty: filters.difficulty } });
        if (filters.subject)
            filterClauses.push({ term: { subject: filters.subject } });
        if (filters.type) filterClauses.push({ term: { type: filters.type } });

        const response = await this.client.search({
            index: this.enhancedIndexName,
            body: {
                size,
                query: {
                    bool: {
                        must: [
                            {
                                knn: {
                                    embedding: {
                                        vector: embedding,
                                        k: size,
                                    },
                                },
                            },
                        ],
                        filter: filterClauses,
                    },
                },
            },
        });

        return response.body.hits.hits.map((hit: any) => ({
            id: hit._source.id,
            score: hit._score || 0,
            question: hit._source.question,
            difficulty: hit._source.difficulty,
            grade: hit._source.grade,
            type: hit._source.type,
            subject: hit._source.subject,
        }));
    }

    /**
     * Get all questions with optional filtering and pagination
     */
    public async getAllQuestions(params?: {
        difficulty?: string;
        type?: string;
        grade?: number;
        subject?: string;
        size?: number;
        from?: number;
        sortBy?: string;
        sortOrder?: "asc" | "desc";
    }): Promise<{
        questions: EnhancedQuestion[];
        total: number;
        page: number;
        pageSize: number;
    }> {
        const {
            difficulty,
            type,
            grade,
            subject,
            size = 10,
            from = 0,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = params || {};

        // Build filter clauses
        const filterClauses = [];
        if (difficulty) filterClauses.push({ term: { difficulty } });
        if (type) filterClauses.push({ term: { type } });
        if (grade) filterClauses.push({ term: { grade } });
        if (subject) filterClauses.push({ term: { subject } });

        const response = await this.client.search({
            index: this.enhancedIndexName,
            body: {
                size,
                from,
                query:
                    filterClauses.length > 0
                        ? {
                              bool: { filter: filterClauses },
                          }
                        : { match_all: {} },
                sort: [{ [sortBy]: { order: sortOrder } }],
            },
        });

        const hits = response.body.hits.hits;
        const total =
            response.body.hits.total.value || response.body.hits.total;

        return {
            questions: hits.map((hit: any) => hit._source),
            total,
            page: Math.floor(from / size) + 1,
            pageSize: size,
        };
    }

    /**
     * Get question statistics and distribution
     */
    public async getQuestionStats(): Promise<{
        totalQuestions: number;
        difficultyDistribution: Record<string, number>;
        typeDistribution: Record<string, number>;
        gradeDistribution: Record<string, number>;
        lastUpdated?: string;
    }> {
        const response = await this.client.search({
            index: this.enhancedIndexName,
            body: {
                size: 0, // Don't return documents, just aggregations
                aggs: {
                    difficulty_stats: {
                        terms: { field: "difficulty" },
                    },
                    type_stats: {
                        terms: { field: "type", size: 100 },
                    },
                    grade_stats: {
                        terms: { field: "grade" },
                    },
                    latest_update: {
                        max: { field: "updatedAt" },
                    },
                },
            },
        });

        const aggs = response.body.aggregations;
        const total =
            response.body.hits.total.value || response.body.hits.total;

        // Convert aggregation buckets to objects
        const difficultyDistribution: Record<string, number> = {};
        aggs.difficulty_stats.buckets.forEach((bucket: any) => {
            difficultyDistribution[bucket.key] = bucket.doc_count;
        });

        const typeDistribution: Record<string, number> = {};
        aggs.type_stats.buckets.forEach((bucket: any) => {
            typeDistribution[bucket.key] = bucket.doc_count;
        });

        const gradeDistribution: Record<string, number> = {};
        aggs.grade_stats.buckets.forEach((bucket: any) => {
            gradeDistribution[bucket.key] = bucket.doc_count;
        });

        return {
            totalQuestions: total,
            difficultyDistribution,
            typeDistribution,
            gradeDistribution,
            lastUpdated: aggs.latest_update.value_as_string,
        };
    }

    /**
     * Search questions by text query
     */
    public async searchQuestionsByText(params: {
        query: string;
        difficulty?: string;
        type?: string;
        grade?: number;
        size?: number;
    }): Promise<
        Array<{
            question: EnhancedQuestion;
            score: number;
            highlights?: Record<string, string[]>;
        }>
    > {
        const { query, difficulty, type, grade, size = 10 } = params;

        // Build filter clauses
        const filterClauses = [];
        if (difficulty) filterClauses.push({ term: { difficulty } });
        if (type) filterClauses.push({ term: { type } });
        if (grade) filterClauses.push({ term: { grade } });

        const response = await this.client.search({
            index: this.enhancedIndexName,
            body: {
                size,
                query: {
                    bool: {
                        must: [
                            {
                                multi_match: {
                                    query,
                                    fields: [
                                        "question^3", // Boost question field
                                        "explanation^2", // Boost explanation
                                        "fullText",
                                        "searchKeywords^1.5",
                                    ],
                                    type: "best_fields",
                                    fuzziness: "AUTO",
                                },
                            },
                        ],
                        filter: filterClauses,
                    },
                },
                highlight: {
                    fields: {
                        question: {},
                        explanation: {},
                        fullText: {},
                    },
                },
            },
        });

        return response.body.hits.hits.map((hit: any) => ({
            question: hit._source,
            score: hit._score || 0,
            highlights: hit.highlight,
        }));
    }

    /**
     * Get a specific question by ID
     */
    public async getQuestionById(
        questionId: string
    ): Promise<EnhancedQuestion | null> {
        try {
            const response = await this.client.search({
                index: this.enhancedIndexName,
                body: {
                    query: {
                        term: { id: questionId },
                    },
                    size: 1,
                },
            });

            const hits = response.body.hits.hits;
            return hits.length > 0 ? hits[0]._source : null;
        } catch (error) {
            console.error(`Error getting question by ID: ${error}`);
            return null;
        }
    }

    /**
     * Delete a question by ID from enhanced index
     */
    public async deleteEnhancedQuestion(questionId: string): Promise<boolean> {
        try {
            const response = await this.client.deleteByQuery({
                index: this.enhancedIndexName,
                body: {
                    query: {
                        term: { id: questionId },
                    },
                },
            });

            return response.body.deleted > 0;
        } catch (error) {
            console.error(`Error deleting question: ${error}`);
            return false;
        }
    }

    /**
     * Get index information and health
     */
    public async getIndexInfo(): Promise<{
        exists: boolean;
        documentCount?: number;
        indexSize?: string;
        mapping?: any;
        health?: string;
    }> {
        try {
            // Check if index exists
            const existsResponse = await this.client.indices.exists({
                index: this.enhancedIndexName,
            });

            if (!existsResponse.body) {
                return { exists: false };
            }

            // Get index stats
            const statsResponse = await this.client.indices.stats({
                index: this.enhancedIndexName,
            });

            const stats = statsResponse.body.indices[this.enhancedIndexName];

            // Get mapping
            const mappingResponse = await this.client.indices.getMapping({
                index: this.enhancedIndexName,
            });

            return {
                exists: true,
                documentCount: stats.total.docs.count,
                indexSize: this.formatBytes(stats.total.store.size_in_bytes),
                mapping: mappingResponse.body[this.enhancedIndexName]?.mappings,
                health: "green", // Simplified for now
            };
        } catch (error) {
            console.error(`Error getting index info: ${error}`);
            return { exists: false };
        }
    }

    /**
     * Format bytes to human readable format
     */
    private formatBytes(bytes: number): string {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    /**
     * Test connection and basic operations
     */
    public async testConnection(): Promise<{
        status: boolean;
        message: string;
        details?: any;
    }> {
        try {
            // Test cluster health
            const health = await this.getClusterHealth();

            // Try to initialize the index
            await this.initializeIndex();

            // Test storing a sample embedding
            const testData = {
                questionId: "test-" + Date.now(),
                question: "What is 2 + 2?",
                embedding: Array(1536).fill(0.1), // Create a sample embedding
                difficulty: "easy",
                topic: "arithmetic",
            };
            await this.storeQuestionEmbedding(testData);

            // Try to search for the stored question
            const searchResults = await this.searchSimilarQuestions(
                testData.embedding,
                1
            );

            // Clean up test data
            await this.deleteQuestion(testData.questionId);

            return {
                status: true,
                message:
                    "Successfully connected to OpenSearch and tested all operations",
                details: {
                    clusterHealth: health,
                    searchResults,
                },
            };
        } catch (error: any) {
            return {
                status: false,
                message: `Connection test failed: ${error.message}`,
                details: error,
            };
        }
    }
}

// Create and export the singleton instance
const opensearchService = new OpenSearchService();
export default opensearchService;
export { OpenSearchService };
