import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { OpenSearchService } from "../services/opensearch.service.js";
import { Client } from "@opensearch-project/opensearch";

// Create properly typed mock client
const mockClient = {
    indices: {
        exists: jest.fn(),
        create: jest.fn(),
    },
    index: jest.fn(),
    search: jest.fn(),
    cluster: {
        health: jest.fn(),
    },
};

jest.mock("@opensearch-project/opensearch", () => ({
    Client: jest.fn(() => mockClient),
}));

describe("OpenSearchService", () => {
    let service: OpenSearchService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new OpenSearchService(mockClient as unknown as Client);
    });

    describe("initializeIndex", () => {
        it("should create index if it does not exist", async () => {
            mockClient.indices.exists.mockResolvedValueOnce({ body: false });
            mockClient.indices.create.mockResolvedValueOnce({ body: {} });

            await service.initializeIndex();

            expect(mockClient.indices.exists).toHaveBeenCalledWith({
                index: expect.any(String),
            });
            expect(mockClient.indices.create).toHaveBeenCalled();
        });

        it("should not create index if it already exists", async () => {
            mockClient.indices.exists.mockResolvedValueOnce({ body: true });

            await service.initializeIndex();

            expect(mockClient.indices.exists).toHaveBeenCalled();
            expect(mockClient.indices.create).not.toHaveBeenCalled();
        });
    });

    describe("storeQuestionEmbedding", () => {
        it("should store question with embedding", async () => {
            const mockData = {
                questionId: "test-id",
                question: "test question",
                embedding: [1, 2, 3],
                difficulty: "medium",
                topic: "algebra",
            };
            mockClient.index.mockResolvedValueOnce({ body: {} });

            await service.storeQuestionEmbedding(mockData);

            expect(mockClient.index).toHaveBeenCalledWith({
                index: expect.any(String),
                body: mockData,
            });
        });
    });

    describe("searchSimilarQuestions", () => {
        it("should search for similar questions using vector similarity", async () => {
            const mockResponse = {
                body: {
                    hits: {
                        hits: [
                            {
                                _score: 0.8,
                                _source: {
                                    id: "123",
                                    question: "test question",
                                },
                            },
                        ],
                    },
                },
            };

            mockClient.search.mockResolvedValueOnce(mockResponse);

            const result = await service.searchSimilarQuestions(
                [0.1, 0.2, 0.3],
                5
            );

            expect(mockClient.search).toHaveBeenCalled();
            expect(result).toEqual([
                {
                    id: "123",
                    question: "test question",
                    score: 0.8,
                },
            ]);
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

            mockClient.cluster.health.mockResolvedValueOnce(mockHealth);

            const result = await service.getClusterHealth();

            expect(mockClient.cluster.health).toHaveBeenCalled();
            expect(result).toEqual(mockHealth.body);
        });
    });
});
