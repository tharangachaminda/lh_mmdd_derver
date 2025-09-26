import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { OpenSearchService } from "../services/opensearch.service.js";
import { Client } from "@opensearch-project/opensearch";

// Import types from opensearch service
import type {
    MinimalClient,
    IndexParams,
    SearchParams,
} from "../services/opensearch.service.js";

// Define response types for better readability
type ExistsResponse =
    import("../services/opensearch.service.js").OSResponse<boolean>;
type CreateResponse = { body: { acknowledged: boolean } };
type IndexResponse = { body: { result: string; _id: string } };
type SearchResponse = { body: { hits: { hits: any[] } } };
type DeleteResponse = import("../services/opensearch.service.js").OSResponse<{
    deleted: number;
}>;
type HealthResponse = import("../services/opensearch.service.js").OSResponse<{
    status: string;
    cluster_name: string;
}>;

// Create properly typed mock client
const mockClient: MinimalClient = {
    indices: {
        exists: jest
            .fn<(params: { index: string }) => Promise<ExistsResponse>>()
            .mockImplementation(({ index }) => Promise.resolve({ body: true })),
        create: jest
            .fn<(params: IndexParams) => Promise<CreateResponse>>()
            .mockImplementation(() =>
                Promise.resolve({ body: { acknowledged: true } })
            ),
    },
    index: jest
        .fn<(params: IndexParams) => Promise<IndexResponse>>()
        .mockImplementation(() =>
            Promise.resolve({ body: { result: "created", _id: "test-id" } })
        ),
    search: jest
        .fn<(params: SearchParams) => Promise<SearchResponse>>()
        .mockImplementation(() =>
            Promise.resolve({ body: { hits: { hits: [] } } })
        ),
    deleteByQuery: jest
        .fn<
            (
                params: import("../services/opensearch.service.js").DeleteByQueryParams
            ) => Promise<DeleteResponse>
        >()
        .mockImplementation(() => Promise.resolve({ body: { deleted: 1 } })),
    cluster: {
        health: jest
            .fn<() => Promise<HealthResponse>>()
            .mockImplementation(() =>
                Promise.resolve({
                    body: { status: "green", cluster_name: "test-cluster" },
                })
            ),
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
            const existsFn = mockClient.indices.exists as jest.MockedFunction<
                typeof mockClient.indices.exists
            >;
            const createFn = mockClient.indices.create as jest.MockedFunction<
                typeof mockClient.indices.create
            >;

            existsFn.mockResolvedValueOnce({ body: false });
            createFn.mockResolvedValueOnce({ body: { acknowledged: true } });

            await service.initializeIndex();

            expect(mockClient.indices.exists).toHaveBeenCalledWith({
                index: expect.any(String),
            });
            expect(mockClient.indices.create).toHaveBeenCalled();
        });

        it("should not create index if it already exists", async () => {
            const existsFn = mockClient.indices.exists as jest.MockedFunction<
                typeof mockClient.indices.exists
            >;
            existsFn.mockResolvedValueOnce({ body: true });

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
            const indexFn = mockClient.index as jest.MockedFunction<
                typeof mockClient.index
            >;
            indexFn.mockResolvedValueOnce({
                body: { result: "created", _id: "test-id" },
            });

            await service.storeQuestionEmbedding(mockData);

            expect(mockClient.index).toHaveBeenCalledWith({
                index: "math-questions",
                body: expect.objectContaining(mockData),
            });
        });
    });

    describe("searchSimilarQuestions", () => {
        it("should search for similar questions using vector similarity", async () => {
            const searchFn = mockClient.search as jest.MockedFunction<
                typeof mockClient.search
            >;
            searchFn.mockResolvedValueOnce({
                body: {
                    hits: {
                        hits: [
                            {
                                _score: 0.8,
                                _source: {
                                    questionId: "test-123",
                                    question: "test question",
                                    topic: "algebra",
                                    difficulty: "medium",
                                },
                            },
                        ],
                    },
                },
            });

            const result = await service.searchSimilarQuestions(
                [0.1, 0.2, 0.3],
                5
            );

            expect(mockClient.search).toHaveBeenCalled();
            expect(result).toEqual([
                {
                    questionId: "test-123",
                    question: "test question",
                    topic: "algebra",
                    difficulty: "medium",
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

            const healthFn = mockClient.cluster.health as jest.MockedFunction<
                typeof mockClient.cluster.health
            >;
            healthFn.mockResolvedValueOnce(mockHealth);

            const result = await service.getClusterHealth();

            expect(mockClient.cluster.health).toHaveBeenCalled();
            expect(result).toEqual(mockHealth.body);
        });
    });
});
