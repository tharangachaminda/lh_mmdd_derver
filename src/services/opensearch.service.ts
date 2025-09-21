import { Client } from "@opensearch-project/opensearch";

export class OpenSearchService {
    private client: Client;
    private readonly indexName: string = "math-questions";

    constructor() {
        this.client = new Client({
            node: "https://localhost:9200",
            auth: {
                username: "admin",
                password: "h7F!q9rT#4vL",
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
    ): Promise<any[]> {
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
            } as any,
        });

        return response.body.hits.hits.map((hit: any) => ({
            score: hit._score,
            ...hit._source,
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
    public async getClusterHealth(): Promise<any> {
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
export const opensearchService = new OpenSearchService();
