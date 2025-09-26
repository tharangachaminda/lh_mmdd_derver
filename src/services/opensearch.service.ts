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

class OpenSearchService {
    private readonly client: Client | MinimalClient;
    private readonly indexName = "math-questions";

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
