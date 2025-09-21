import { OpenSearchService } from "../services/opensearch.service.js";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { Client } from "@opensearch-project/opensearch";

// Mock the OpenSearch module
jest.mock("@opensearch-project/opensearch");

describe("OpenSearch Connection Tests", () => {
    let service: OpenSearchService;
    let mockHealth: jest.Mock;
    let mockExists: jest.Mock;
    let mockCreate: jest.Mock;
    let mockIndex: jest.Mock;
    let mockSearch: jest.Mock;
    let mockDeleteByQuery: jest.Mock;

    beforeEach(() => {
        // Create fresh mocks for each test
        mockHealth = jest.fn();
        mockExists = jest.fn();
        mockCreate = jest.fn();
        mockIndex = jest.fn();
        mockSearch = jest.fn();
        mockDeleteByQuery = jest.fn();

        // Reset all mocks
        jest.clearAllMocks();

        // Create a minimal mock client
        const mockClient = {
            cluster: {
                health: mockHealth,
            },
            indices: {
                exists: mockExists,
                create: mockCreate,
            },
            index: mockIndex,
            search: mockSearch,
            deleteByQuery: mockDeleteByQuery,
        };

        // Initialize service with mock client
        service = new OpenSearchService(mockClient as unknown as Client);
    });

    it("should connect to OpenSearch and get cluster health", async () => {
        // Setup mock response
        mockHealth.mockImplementation(() =>
            Promise.resolve({
                body: {
                    status: "green",
                    cluster_name: "test-cluster",
                },
            })
        );

        // Execute the method
        const health = await service.getClusterHealth();

        // Verify the results
        expect(mockHealth).toHaveBeenCalled();
        expect(health).toEqual({
            status: "green",
            cluster_name: "test-cluster",
        });
    });

    it("should initialize index successfully", async () => {
        // Setup mock responses
        mockExists.mockImplementation(() => Promise.resolve({ body: false }));
        mockCreate.mockImplementation(() => Promise.resolve({ body: {} }));

        // Execute the method
        await service.initializeIndex();

        // Verify the results
        expect(mockExists).toHaveBeenCalledWith({
            index: "math-questions",
        });

        expect(mockCreate).toHaveBeenCalledWith({
            index: "math-questions",
            body: {
                settings: {
                    index: { knn: true },
                },
                mappings: {
                    properties: {
                        questionId: { type: "keyword" },
                        question: { type: "text" },
                        embedding: {
                            type: "knn_vector",
                            dimension: 1536,
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
    });

    it("should not initialize index if it already exists", async () => {
        // Setup mock response
        mockExists.mockImplementation(() => Promise.resolve({ body: true }));

        // Execute the method
        await service.initializeIndex();

        // Verify the results
        expect(mockExists).toHaveBeenCalledWith({
            index: "math-questions",
        });
        expect(mockCreate).not.toHaveBeenCalled();
    });

    it("should store a question with embedding", async () => {
        const mockData = {
            questionId: "test-123",
            question: "What is 2 + 2?",
            embedding: [0.1, 0.2, 0.3],
            difficulty: "easy",
            topic: "arithmetic",
        };

        mockIndex.mockImplementation(() =>
            Promise.resolve({ body: { result: "created" } })
        );

        await service.storeQuestionEmbedding(mockData);

        expect(mockIndex).toHaveBeenCalledWith({
            index: "math-questions",
            body: expect.objectContaining({
                ...mockData,
                createdAt: expect.any(String),
            }),
        });
    });

    it("should search for similar questions", async () => {
        const mockSearchResponse = {
            body: {
                hits: {
                    hits: [
                        {
                            _score: 0.9,
                            _source: {
                                questionId: "q1",
                                question: "What is 1 + 1?",
                                difficulty: "easy",
                                topic: "arithmetic",
                            },
                        },
                    ],
                },
            },
        };

        mockSearch.mockImplementation(() =>
            Promise.resolve(mockSearchResponse)
        );

        const embedding = Array(1536).fill(0.1);
        const results = await service.searchSimilarQuestions(embedding, 1);

        expect(mockSearch).toHaveBeenCalledWith({
            index: "math-questions",
            body: {
                size: 1,
                query: {
                    bool: {
                        must: [
                            {
                                knn: {
                                    embedding: {
                                        vector: embedding,
                                        k: 1,
                                    },
                                },
                            },
                        ],
                    },
                },
            },
        });

        expect(results).toEqual([
            {
                score: 0.9,
                questionId: "q1",
                question: "What is 1 + 1?",
                difficulty: "easy",
                topic: "arithmetic",
            },
        ]);
    });

    it("should delete a question by ID", async () => {
        mockDeleteByQuery.mockImplementation(() =>
            Promise.resolve({ body: { deleted: 1 } })
        );

        const questionId = "test-123";
        await service.deleteQuestion(questionId);

        expect(mockDeleteByQuery).toHaveBeenCalledWith({
            index: "math-questions",
            body: {
                query: {
                    term: { questionId },
                },
            },
        });
    });

    it("should test connection successfully", async () => {
        const mockResponses = {
            health: { body: { status: "green" } },
            index: { body: { result: "created" } },
            search: {
                body: {
                    hits: {
                        hits: [
                            { _score: 0.9, _source: { questionId: "test-id" } },
                        ],
                    },
                },
            },
            deleteByQuery: { body: { deleted: 1 } },
        };

        mockHealth.mockImplementation(() =>
            Promise.resolve(mockResponses.health)
        );
        mockExists.mockImplementation(() => Promise.resolve({ body: true }));
        mockIndex.mockImplementation(() =>
            Promise.resolve(mockResponses.index)
        );
        mockSearch.mockImplementation(() =>
            Promise.resolve(mockResponses.search)
        );
        mockDeleteByQuery.mockImplementation(() =>
            Promise.resolve(mockResponses.deleteByQuery)
        );

        const result = await service.testConnection();

        expect(result.status).toBe(true);
        expect(result.message).toBe(
            "Successfully connected to OpenSearch and tested all operations"
        );
        expect(result.details).toEqual({
            clusterHealth: mockResponses.health.body,
            searchResults: [{ score: 0.9, questionId: "test-id" }],
        });
    });

    it("should handle connection test failure", async () => {
        const errorMessage = "Connection failed";
        mockHealth.mockImplementation(() =>
            Promise.reject(new Error(errorMessage))
        );

        const result = await service.testConnection();

        expect(result.status).toBe(false);
        expect(result.message).toBe(`Connection test failed: ${errorMessage}`);
        expect(result.details).toBeInstanceOf(Error);
    });
});
