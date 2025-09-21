import { OpenSearchService } from "../services/opensearch.service";
import { Client } from "@opensearch-project/opensearch";

jest.mock("@opensearch-project/opensearch");

describe("OpenSearch Vector Operations", () => {
    let service: OpenSearchService;
    let mockClient: jest.Mocked<Client>;

    beforeEach(() => {
        jest.clearAllMocks();

        // Initialize mock client with required methods
        mockClient = {
            indices: {
                exists: jest.fn().mockResolvedValue({ body: false }),
                create: jest.fn().mockResolvedValue({}),
            },
            cluster: {
                health: jest
                    .fn()
                    .mockImplementation(() =>
                        Promise.resolve({ body: { status: "green" } })
                    ),
            },
            index: jest.fn().mockResolvedValue({ body: { result: "created" } }),
            search: jest.fn().mockResolvedValue({
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
                                    createdAt: "2025-09-21T02:38:06.080Z",
                                },
                            },
                        ],
                    },
                },
            }),
            deleteByQuery: jest
                .fn()
                .mockResolvedValue({ body: { deleted: 1 } }),
        } as unknown as jest.Mocked<Client>;

        // Mock the Client constructor to return our mockClient
        (Client as jest.Mock).mockImplementation(() => mockClient);

        service = new OpenSearchService();
    });

    test("initialize index and store vectors", async () => {
        await service.initializeIndex();

        expect(mockClient.indices.exists).toHaveBeenCalled();
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
                        questionId: {
                            type: "keyword",
                        },
                        question: {
                            type: "text",
                        },
                        embedding: {
                            type: "knn_vector",
                            dimension: 1536,
                            method: {
                                name: "hnsw",
                                space_type: "cosinesimil",
                                engine: "lucene",
                            },
                        },
                        difficulty: {
                            type: "keyword",
                        },
                        topic: {
                            type: "keyword",
                        },
                        createdAt: {
                            type: "date",
                        },
                    },
                },
            },
        });
    });

    test("store question with embedding", async () => {
        const questionData = {
            questionId: "test-1",
            question: "What is 2 + 2?",
            embedding: Array(1536).fill(0.1),
            difficulty: "easy",
            topic: "arithmetic",
        };

        await service.storeQuestionEmbedding(questionData);

        expect(mockClient.index).toHaveBeenCalledWith({
            index: "math-questions",
            body: expect.objectContaining({
                questionId: questionData.questionId,
                question: questionData.question,
                embedding: questionData.embedding,
                difficulty: questionData.difficulty,
                topic: questionData.topic,
                createdAt: expect.any(String),
            }),
        });
    });

    test("search for similar questions", async () => {
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

    test("delete question by ID", async () => {
        const questionId = "test-1";
        await service.deleteQuestion(questionId);

        expect(mockClient.deleteByQuery).toHaveBeenCalledWith({
            index: "math-questions",
            body: {
                query: {
                    term: { questionId },
                },
            },
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

        // Verify all operations were called in sequence
        expect(mockClient.cluster.health).toHaveBeenCalled();
        expect(mockClient.indices.exists).toHaveBeenCalled();
        expect(mockClient.index).toHaveBeenCalled();
        expect(mockClient.search).toHaveBeenCalled();
        expect(mockClient.deleteByQuery).toHaveBeenCalled();
    });

    test("test connection - failure path", async () => {
        // Simulate a failure in cluster health check
        (mockClient.cluster.health as jest.Mock).mockImplementationOnce(() =>
            Promise.reject(new Error("Connection failed"))
        );

        const result = await service.testConnection();

        expect(result.status).toBe(false);
        expect(result.message).toBe(
            "Connection test failed: Connection failed"
        );
    });
});
