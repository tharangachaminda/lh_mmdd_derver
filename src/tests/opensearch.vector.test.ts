import { OpenSearchService } from "../services/opensearch.service.js";
import {
    jest,
    describe,
    it,
    expect,
    beforeEach,
    beforeAll,
    test,
} from "@jest/globals";
import { Client } from "@opensearch-project/opensearch";

// Mock client setup with type-safe implementations
const mockClient = {
    indices: {
        exists: jest
            .fn()
            .mockImplementation(() => Promise.resolve({ body: false })),
        create: jest
            .fn()
            .mockImplementation(() => Promise.resolve({ body: {} })),
    },
    index: jest
        .fn()
        .mockImplementation(() =>
            Promise.resolve({ body: { result: "created" } })
        ),
    search: jest.fn().mockImplementation(() =>
        Promise.resolve({
            body: {
                hits: {
                    hits: [
                        {
                            _source: {
                                questionId: "test-1",
                                question: "What is 2 + 2?",
                                embedding: Array(1536).fill(0.1),
                                difficulty: "easy",
                                topic: "arithmetic",
                                createdAt: new Date().toISOString(),
                            },
                        },
                    ],
                },
            },
        })
    ),
    deleteByQuery: jest
        .fn()
        .mockImplementation(() => Promise.resolve({ body: { deleted: 1 } })),
    cluster: {
        health: jest
            .fn()
            .mockImplementation(() =>
                Promise.resolve({ body: { status: "green" } })
            ),
    },
} as any;

describe("OpenSearch Vector Operations", () => {
    let service: OpenSearchService;

    beforeAll(() => {
        jest.spyOn(console, "log").mockImplementation(() => {});
        jest.spyOn(console, "error").mockImplementation(() => {});
    });

    beforeEach(() => {
        jest.clearAllMocks();
        service = new OpenSearchService(mockClient);
    });

    describe("initializeIndex", () => {
        it("should create index if it does not exist", async () => {
            await service.initializeIndex();

            expect(mockClient.indices.exists).toHaveBeenCalledWith({
                index: "math-questions",
            });

            expect(mockClient.indices.create).toHaveBeenCalledWith({
                index: "math-questions",
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

        it("should not create index if it already exists", async () => {
            mockClient.indices.exists.mockResolvedValueOnce({ body: true });
            await service.initializeIndex();
            expect(mockClient.indices.exists).toHaveBeenCalledWith({
                index: "math-questions",
            });
            expect(mockClient.indices.create).not.toHaveBeenCalled();
        });
    });

    describe("searchSimilarQuestions", () => {
        it("should search for similar questions using vector", async () => {
            const queryEmbedding = Array(1536).fill(0.1);
            const result = await service.searchSimilarQuestions(queryEmbedding);

            expect(mockClient.search).toHaveBeenCalledWith({
                index: "math-questions",
                body: {
                    query: {
                        bool: {
                            must: [
                                {
                                    knn: {
                                        embedding: {
                                            vector: queryEmbedding,
                                            k: 5,
                                        },
                                    },
                                },
                            ],
                        },
                    },
                    size: 5,
                },
            });

            expect(result).toEqual([
                expect.objectContaining({
                    questionId: "test-1",
                    question: "What is 2 + 2?",
                }),
            ]);
        });

        it("should return empty array when no similar questions found", async () => {
            mockClient.search.mockResolvedValueOnce({
                body: { hits: { hits: [] } },
            });
            const queryEmbedding = [0.1, 0.2, 0.3];
            const result = await service.searchSimilarQuestions(queryEmbedding);
            expect(result).toEqual([]);
        });
    });

    describe("deleteQuestion", () => {
        it("should delete question by ID", async () => {
            const questionId = "test-id";
            await service.deleteQuestion(questionId);
            expect(mockClient.deleteByQuery).toHaveBeenCalledWith({
                index: "math-questions",
                body: {
                    query: {
                        term: {
                            questionId: questionId,
                        },
                    },
                },
            });
        });
    });

    test("test connection - success path", async () => {
        const result = await service.testConnection();

        expect(result.status).toBe(true);
        expect(result.message).toBe(
            "Successfully connected to OpenSearch and tested all operations"
        );
        expect(result.details).toEqual(
            expect.objectContaining({
                clusterHealth: { status: "green" },
                searchResults: expect.any(Array),
            })
        );

        expect(mockClient.cluster.health).toHaveBeenCalled();
        expect(mockClient.indices.exists).toHaveBeenCalled();
        expect(mockClient.index).toHaveBeenCalled();
        expect(mockClient.search).toHaveBeenCalled();
        expect(mockClient.deleteByQuery).toHaveBeenCalled();
    });

    test("test connection - failure path", async () => {
        (mockClient.cluster.health as jest.Mock<any>).mockRejectedValueOnce(
            new Error("Connection failed")
        );

        const result = await service.testConnection();

        expect(result.status).toBe(false);
        expect(result.message).toBe(
            "Connection test failed: Connection failed"
        );
    });
});
