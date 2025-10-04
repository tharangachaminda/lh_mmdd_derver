/**
 * OpenSearch Service
 *
 * Centralized service for all OpenSearch operations including vector database
 * management, question indexing, and curriculum data storage.
 *
 * @fileoverview OpenSearch integration service
 * @version 1.0.0
 */

import { Client } from "@opensearch-project/opensearch";
import { config } from "dotenv";

// Load environment variables
config();

/**
 * OpenSearch configuration interface
 */
export interface OpenSearchConfig {
    node: string;
    username?: string;
    password?: string;
    ssl?: {
        rejectUnauthorized: boolean;
    };
    vectorIndex: string;
    curriculumIndex: string;
    questionIndex: string;
    embeddingDimension: number;
}

/**
 * Question document structure for OpenSearch
 */
export interface QuestionDocument {
    id: string;
    subject: string;
    grade: number;
    topic: string;
    subtopic?: string;
    question: string;
    answer: string;
    explanation?: string;
    difficulty: string;
    format: string;
    keywords: string[];
    curriculumObjectives?: string[];
    embedding?: number[];
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        source: string;
        validated: boolean;
        qualityScore?: number;
    };
}

/**
 * Curriculum document structure for OpenSearch
 */
export interface CurriculumDocument {
    id: string;
    subject: string;
    grade: number;
    framework: string;
    strand: string;
    objective: string;
    description: string;
    keywords: string[];
    prerequisites: string[];
    outcomes: string[];
    embedding?: number[];
    metadata: {
        version: string;
        lastUpdated: Date;
        validated: boolean;
    };
}

/**
 * Search filters for question queries
 */
export interface SearchFilters {
    subject?: string;
    grade?: number;
    topic?: string;
    subtopic?: string;
    difficulty?: string;
    format?: string;
    keywords?: string[];
    excludeIds?: string[];
}

/**
 * Search result structure
 */
export interface SearchResult {
    questions: QuestionDocument[];
    total: number;
    took: number;
    maxScore?: number;
}

/**
 * Bulk indexing result
 */
interface BulkIndexResult {
    success: number;
    failed: number;
    errors: any[];
}

/**
 * OpenSearch Service class for comprehensive vector database operations
 */
export class OpenSearchService {
    public client: Client;
    public config: OpenSearchConfig;

    constructor(config?: Partial<OpenSearchConfig>) {
        this.config = {
            node: process.env.OPENSEARCH_NODE || "http://localhost:9200",
            username: process.env.OPENSEARCH_USERNAME,
            password: process.env.OPENSEARCH_PASSWORD,
            ssl: {
                rejectUnauthorized: false,
            },
            vectorIndex: process.env.VECTOR_INDEX_NAME || "enhanced_questions",
            curriculumIndex: "curriculum_data",
            questionIndex: "question_bank",
            embeddingDimension: parseInt(process.env.VECTOR_DIMENSION || "768"),
            ...config,
        };

        this.client = new Client({
            node: this.config.node,
            auth: this.config.username
                ? {
                      username: this.config.username,
                      password: this.config.password || "",
                  }
                : undefined,
            ssl: this.config.ssl,
        });

        console.log("🔍 OpenSearch service initialized");
        console.log(`   📍 Node: ${this.config.node}`);
        console.log(`   📊 Vector Index: ${this.config.vectorIndex}`);
        console.log(`   📚 Curriculum Index: ${this.config.curriculumIndex}`);
    }

    /**
     * Initialize all required indices with proper mappings
     */
    async initializeIndices(): Promise<void> {
        console.log("🏗️  Initializing OpenSearch indices...");

        // Create vector index for questions
        await this.createVectorIndex();

        // Create curriculum index
        await this.createCurriculumIndex();

        // Create question bank index
        await this.createQuestionIndex();

        console.log("✅ All OpenSearch indices initialized successfully");
    }

    /**
     * Create vector index with KNN mappings for question embeddings
     */
    private async createVectorIndex(): Promise<void> {
        const indexName = this.config.vectorIndex;

        try {
            const exists = await this.client.indices.exists({
                index: indexName,
            });

            if (!exists.body) {
                await this.client.indices.create({
                    index: indexName,
                    body: {
                        settings: {
                            index: {
                                knn: true,
                                "knn.algo_param.ef_search": 100,
                            },
                        },
                        mappings: {
                            properties: {
                                id: { type: "keyword" },
                                subject: { type: "keyword" },
                                grade: { type: "integer" },
                                topic: { type: "keyword" },
                                subtopic: { type: "keyword" },
                                question: {
                                    type: "text",
                                    analyzer: "standard",
                                },
                                answer: { type: "text" },
                                explanation: { type: "text" },
                                difficulty: { type: "keyword" },
                                format: { type: "keyword" },
                                keywords: { type: "keyword" },
                                curriculumObjectives: { type: "keyword" },
                                embedding: {
                                    type: "knn_vector",
                                    dimension: this.config.embeddingDimension,
                                    method: {
                                        name: "hnsw",
                                        engine: "lucene",
                                        parameters: {
                                            ef_construction: 128,
                                            m: 24,
                                        },
                                    },
                                },
                                metadata: {
                                    type: "object",
                                    properties: {
                                        createdAt: { type: "date" },
                                        updatedAt: { type: "date" },
                                        source: { type: "keyword" },
                                        validated: { type: "boolean" },
                                        qualityScore: { type: "float" },
                                    },
                                },
                            },
                        },
                    },
                });
                console.log(`✅ Created vector index: ${indexName}`);
            } else {
                console.log(`📋 Vector index already exists: ${indexName}`);
            }
        } catch (error) {
            console.error(`❌ Error creating vector index: ${error}`);
            throw error;
        }
    }

    /**
     * Create curriculum index for learning objectives and standards
     */
    private async createCurriculumIndex(): Promise<void> {
        const indexName = this.config.curriculumIndex;

        try {
            const exists = await this.client.indices.exists({
                index: indexName,
            });

            if (!exists.body) {
                await this.client.indices.create({
                    index: indexName,
                    body: {
                        mappings: {
                            properties: {
                                id: { type: "keyword" },
                                subject: { type: "keyword" },
                                grade: { type: "integer" },
                                framework: { type: "keyword" },
                                strand: { type: "keyword" },
                                objective: {
                                    type: "text",
                                    analyzer: "standard",
                                },
                                description: { type: "text" },
                                keywords: { type: "keyword" },
                                prerequisites: { type: "keyword" },
                                outcomes: { type: "keyword" },
                                embedding: {
                                    type: "knn_vector",
                                    dimension: this.config.embeddingDimension,
                                },
                                metadata: {
                                    type: "object",
                                    properties: {
                                        version: { type: "keyword" },
                                        lastUpdated: { type: "date" },
                                        validated: { type: "boolean" },
                                    },
                                },
                            },
                        },
                    },
                });
                console.log(`✅ Created curriculum index: ${indexName}`);
            } else {
                console.log(`📋 Curriculum index already exists: ${indexName}`);
            }
        } catch (error) {
            console.error(`❌ Error creating curriculum index: ${error}`);
            throw error;
        }
    }

    /**
     * Create question bank index for non-vector operations
     */
    private async createQuestionIndex(): Promise<void> {
        const indexName = this.config.questionIndex;

        try {
            const exists = await this.client.indices.exists({
                index: indexName,
            });

            if (!exists.body) {
                await this.client.indices.create({
                    index: indexName,
                    body: {
                        mappings: {
                            properties: {
                                id: { type: "keyword" },
                                subject: { type: "keyword" },
                                grade: { type: "integer" },
                                topic: { type: "keyword" },
                                subtopic: { type: "keyword" },
                                question: {
                                    type: "text",
                                    analyzer: "standard",
                                },
                                answer: { type: "text" },
                                explanation: { type: "text" },
                                difficulty: { type: "keyword" },
                                format: { type: "keyword" },
                                keywords: { type: "keyword" },
                                curriculumObjectives: { type: "keyword" },
                                metadata: {
                                    type: "object",
                                    properties: {
                                        createdAt: { type: "date" },
                                        updatedAt: { type: "date" },
                                        source: { type: "keyword" },
                                        validated: { type: "boolean" },
                                        qualityScore: { type: "float" },
                                    },
                                },
                            },
                        },
                    },
                });
                console.log(`✅ Created question index: ${indexName}`);
            } else {
                console.log(`📋 Question index already exists: ${indexName}`);
            }
        } catch (error) {
            console.error(`❌ Error creating question index: ${error}`);
            throw error;
        }
    }

    /**
     * Index a single question document
     */
    async indexQuestion(question: QuestionDocument): Promise<string> {
        try {
            const response = await this.client.index({
                index: this.config.vectorIndex,
                id: question.id,
                body: question,
            });

            console.log(`✅ Indexed question: ${question.id}`);
            return response.body._id;
        } catch (error) {
            console.error(
                `❌ Error indexing question ${question.id}: ${error}`
            );
            throw error;
        }
    }

    /**
     * Bulk index multiple questions
     */
    async bulkIndexQuestions(questions: QuestionDocument[]): Promise<{
        success: number;
        failed: number;
        errors: any[];
    }> {
        console.log(`📦 Bulk indexing ${questions.length} questions...`);

        const body: any[] = [];
        questions.forEach((question) => {
            body.push({
                index: {
                    _index: this.config.vectorIndex,
                    _id: question.id,
                },
            });
            body.push(question);
        });

        try {
            const response = await this.client.bulk({ body });

            const result = {
                success: 0,
                failed: 0,
                errors: [] as any[],
            };

            response.body.items.forEach((item: any) => {
                if (item.index.error) {
                    result.failed++;
                    result.errors.push(item.index.error);
                } else {
                    result.success++;
                }
            });

            console.log(
                `✅ Bulk indexing complete: ${result.success} success, ${result.failed} failed`
            );
            return result;
        } catch (error) {
            console.error(`❌ Bulk indexing error: ${error}`);
            throw error;
        }
    }

    /**
     * Search questions using vector similarity
     */
    async vectorSearch(
        queryEmbedding: number[],
        options: {
            k?: number;
            subject?: string;
            grade?: number;
            difficulty?: string;
            minScore?: number;
        } = {}
    ): Promise<QuestionDocument[]> {
        const { k = 10, subject, grade, difficulty, minScore = 0.7 } = options;

        const filter: any[] = [];
        if (subject) filter.push({ term: { subject } });
        if (grade) filter.push({ term: { grade } });
        if (difficulty) filter.push({ term: { difficulty } });

        try {
            const response = await this.client.search({
                index: this.config.vectorIndex,
                body: {
                    size: k,
                    min_score: minScore,
                    query: {
                        bool: {
                            must: [
                                {
                                    knn: {
                                        embedding: {
                                            vector: queryEmbedding,
                                            k: k,
                                        },
                                    },
                                },
                            ],
                            filter: filter.length > 0 ? filter : undefined,
                        },
                    },
                    _source: {
                        excludes: ["embedding"], // Don't return embedding in results
                    },
                },
            });

            return response.body.hits.hits.map((hit: any) => ({
                ...hit._source,
                _score: hit._score,
            }));
        } catch (error) {
            console.error(`❌ Vector search error: ${error}`);
            throw error;
        }
    }

    /**
     * Vector similarity search for questions
     */
    async vectorSimilaritySearch(
        queryEmbedding: number[],
        k: number = 10,
        filters?: SearchFilters
    ): Promise<SearchResult> {
        try {
            // Build the query
            const must: any[] = [
                {
                    knn: {
                        embedding: {
                            vector: queryEmbedding,
                            k: k,
                        },
                    },
                },
            ];

            // Add filters if provided
            if (filters) {
                if (filters.subject) {
                    must.push({ term: { subject: filters.subject } });
                }
                if (filters.grade) {
                    must.push({ term: { grade: filters.grade } });
                }
                if (filters.topic) {
                    must.push({ term: { topic: filters.topic } });
                }
                if (filters.subtopic) {
                    must.push({ term: { subtopic: filters.subtopic } });
                }
                if (filters.difficulty) {
                    must.push({ term: { difficulty: filters.difficulty } });
                }
                if (filters.format) {
                    must.push({ term: { format: filters.format } });
                }
                if (filters.keywords && filters.keywords.length > 0) {
                    must.push({
                        terms: { keywords: filters.keywords },
                    });
                }
                if (filters.excludeIds && filters.excludeIds.length > 0) {
                    must.push({
                        bool: {
                            must_not: {
                                terms: { id: filters.excludeIds },
                            },
                        },
                    });
                }
            }

            const response = await this.client.search({
                index: this.config.vectorIndex,
                body: {
                    size: k,
                    query: {
                        bool: { must },
                    },
                    _source: {
                        excludes: ["embedding"], // Don't return embedding in results
                    },
                },
            });

            const questions = response.body.hits.hits.map((hit: any) => ({
                ...hit._source,
                _score: hit._score,
            }));

            return {
                questions,
                total:
                    typeof response.body.hits.total === "object"
                        ? response.body.hits.total.value
                        : response.body.hits.total || 0,
                took: response.body.took,
                maxScore:
                    typeof response.body.hits.max_score === "number"
                        ? response.body.hits.max_score
                        : undefined,
            };
        } catch (error) {
            console.error(`❌ Vector similarity search error: ${error}`);
            throw error;
        }
    }

    /**
     * Get questions by their IDs
     */
    async getQuestionsByIds(ids: string[]): Promise<QuestionDocument[]> {
        try {
            const response = await this.client.search({
                index: this.config.vectorIndex,
                body: {
                    query: {
                        terms: { id: ids },
                    },
                    size: ids.length,
                    _source: {
                        excludes: ["embedding"], // Don't return embedding in results
                    },
                },
            });

            return response.body.hits.hits.map((hit: any) => hit._source);
        } catch (error) {
            console.error(`❌ Error getting questions by IDs: ${error}`);
            throw error;
        }
    }

    /**
     * Get all questions (with pagination)
     */
    async getAllQuestions(
        from: number = 0,
        size: number = 1000
    ): Promise<QuestionDocument[]> {
        try {
            const response = await this.client.search({
                index: this.config.vectorIndex,
                body: {
                    query: { match_all: {} },
                    from,
                    size,
                    _source: {
                        excludes: ["embedding"], // Don't return embedding in results
                    },
                },
            });

            return response.body.hits.hits.map((hit: any) => hit._source);
        } catch (error) {
            console.error(`❌ Error getting all questions: ${error}`);
            throw error;
        }
    }

    /**
     * Search questions with text and filters
     */
    async searchQuestions(
        query: string,
        filters?: SearchFilters,
        size: number = 20,
        from: number = 0
    ): Promise<SearchResult> {
        try {
            const must: any[] = [];

            // Add text search if query provided
            if (query && query.trim()) {
                must.push({
                    multi_match: {
                        query: query,
                        fields: [
                            "question^2",
                            "answer",
                            "explanation",
                            "keywords",
                            "topic",
                        ],
                    },
                });
            } else {
                must.push({ match_all: {} });
            }

            // Add filters if provided
            if (filters) {
                if (filters.subject) {
                    must.push({ term: { subject: filters.subject } });
                }
                if (filters.grade) {
                    must.push({ term: { grade: filters.grade } });
                }
                if (filters.topic) {
                    must.push({ term: { topic: filters.topic } });
                }
                if (filters.subtopic) {
                    must.push({ term: { subtopic: filters.subtopic } });
                }
                if (filters.difficulty) {
                    must.push({ term: { difficulty: filters.difficulty } });
                }
                if (filters.format) {
                    must.push({ term: { format: filters.format } });
                }
                if (filters.keywords && filters.keywords.length > 0) {
                    must.push({
                        terms: { keywords: filters.keywords },
                    });
                }
                if (filters.excludeIds && filters.excludeIds.length > 0) {
                    must.push({
                        bool: {
                            must_not: {
                                terms: { id: filters.excludeIds },
                            },
                        },
                    });
                }
            }

            const response = await this.client.search({
                index: this.config.vectorIndex,
                body: {
                    query: {
                        bool: { must },
                    },
                    from,
                    size,
                    _source: {
                        excludes: ["embedding"], // Don't return embedding in results
                    },
                },
            });

            const questions = response.body.hits.hits.map(
                (hit: any) => hit._source
            );

            return {
                questions,
                total:
                    typeof response.body.hits.total === "object"
                        ? response.body.hits.total.value
                        : response.body.hits.total || 0,
                took: response.body.took,
                maxScore:
                    typeof response.body.hits.max_score === "number"
                        ? response.body.hits.max_score
                        : undefined,
            };
        } catch (error) {
            console.error(`❌ Error searching questions: ${error}`);
            throw error;
        }
    }

    /**
     * Search curriculum documents
     */
    async searchCurriculumDocuments(
        query: any,
        size: number = 20,
        from: number = 0
    ): Promise<any> {
        try {
            const response = await this.client.search({
                index: this.config.curriculumIndex,
                body: query,
                from,
                size,
            });

            return response.body;
        } catch (error) {
            console.error(`❌ Error searching curriculum documents: ${error}`);
            throw error;
        }
    }

    /**
     * Index curriculum documents
     */
    async indexCurriculumDocuments(
        documents: CurriculumDocument[]
    ): Promise<BulkIndexResult> {
        try {
            const body: any[] = [];

            // Prepare bulk operations
            documents.forEach((doc) => {
                body.push({
                    index: {
                        _index: this.config.curriculumIndex,
                        _id: doc.id,
                    },
                });
                body.push(doc);
            });

            const response = await this.client.bulk({ body });

            // Process response
            let success = 0;
            let failed = 0;
            const errors: any[] = [];

            response.body.items.forEach((item: any, index: number) => {
                if (item.index && item.index.error) {
                    failed++;
                    errors.push({
                        id: documents[index].id,
                        error: item.index.error,
                    });
                } else {
                    success++;
                }
            });

            console.log(
                `📊 Curriculum indexing completed: ${success} success, ${failed} failed`
            );

            return { success, failed, errors };
        } catch (error) {
            console.error(`❌ Bulk curriculum indexing error: ${error}`);
            throw error;
        }
    }

    /**
     * Get OpenSearch cluster status and health
     */
    async getClusterHealth(): Promise<any> {
        try {
            const health = await this.client.cluster.health();
            const stats = await this.client.indices.stats({
                index: [
                    this.config.vectorIndex,
                    this.config.curriculumIndex,
                    this.config.questionIndex,
                ],
            });

            return {
                cluster: health.body,
                indices: stats.body.indices,
            };
        } catch (error) {
            console.error(`❌ Error getting cluster health: ${error}`);
            throw error;
        }
    }

    /**
     * Close the OpenSearch client connection
     */
    async close(): Promise<void> {
        await this.client.close();
        console.log("🔐 OpenSearch connection closed");
    }
}
