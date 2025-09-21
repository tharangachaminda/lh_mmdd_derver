import { OpenSearchService } from "../services/opensearch.service";
import { Client } from "@opensearch-project/opensearch";

// Mock the OpenSearch Client
jest.mock("@opensearch-project/opensearch");

describe("OpenSearchService", () => {
    let service: OpenSearchService;
    let mockClient: jest.Mocked<Client>;

    beforeEach(() => {
        // Clear mock calls between tests
        jest.clearAllMocks();

        // Initialize mock client with required methods
        mockClient = {
            indices: {
                exists: jest.fn(),
                create: jest.fn(),
            },
            cluster: {
                health: jest.fn(),
            },
            index: jest.fn(),
            search: jest.fn(),
        } as unknown as jest.Mocked<Client>;

        // Mock the Client constructor to return our mockClient
        (Client as jest.Mock).mockImplementation(() => mockClient);

        service = new OpenSearchService();
    });

    describe("initializeIndex", () => {
        it("should create index if it does not exist", async () => {
            // Mock index exists check to return false
            mockClient.indices.exists = jest
                .fn()
                .mockResolvedValue({ body: false });
            mockClient.indices.create = jest.fn().mockResolvedValue({});

            await service.initializeIndex();

            expect(mockClient.indices.exists).toHaveBeenCalledWith({
                index: expect.any(String),
            });
            expect(mockClient.indices.create).toHaveBeenCalled();
        });

        it("should not create index if it already exists", async () => {
            // Mock index exists check to return true
            mockClient.indices.exists = jest
                .fn()
                .mockResolvedValue({ body: true });
            mockClient.indices.create = jest.fn();

            await service.initializeIndex();

            expect(mockClient.indices.exists).toHaveBeenCalled();
            expect(mockClient.indices.create).not.toHaveBeenCalled();
        });
    });

    describe("storeQuestionEmbedding", () => {
        it("should store question with embedding", async () => {
            const mockData = {
                questionId: "123",
                question: "test question",
                embedding: [0.1, 0.2, 0.3],
                difficulty: "medium",
                topic: "algebra",
            };

            mockClient.index = jest.fn().mockResolvedValue({});

            await service.storeQuestionEmbedding(mockData);

            expect(mockClient.index).toHaveBeenCalledWith({
                index: expect.any(String),
                body: expect.objectContaining({
                    ...mockData,
                    createdAt: expect.any(String),
                }),
            });
        });
    });

    describe("searchSimilarQuestions", () => {
        it("should search for similar questions using vector similarity", async () => {
            const mockEmbedding = [0.1, 0.2, 0.3];
            const mockResponse = {
                body: {
                    hits: {
                        hits: [
                            {
                                _score: 0.8,
                                _source: {
                                    questionId: "123",
                                    question: "test question",
                                },
                            },
                        ],
                    },
                },
            };

            mockClient.search = jest.fn().mockResolvedValue(mockResponse);

            const result = await service.searchSimilarQuestions(mockEmbedding);

            expect(mockClient.search).toHaveBeenCalled();
            expect(result).toHaveLength(1);
            expect(result[0]).toHaveProperty("score");
            expect(result[0]).toHaveProperty("questionId");
        });
    });

    describe("getClusterHealth", () => {
        it("should return cluster health status", async () => {
            const mockHealth = {
                body: {
                    status: "green",
                    cluster_name: "test-cluster",
                },
            };

            mockClient.cluster.health = jest.fn().mockResolvedValue(mockHealth);

            const result = await service.getClusterHealth();

            expect(mockClient.cluster.health).toHaveBeenCalled();
            expect(result).toEqual(mockHealth.body);
        });
    });
});
