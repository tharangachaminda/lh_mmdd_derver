import { OpenSearchService } from "../services/opensearch.service";
import { Client } from "@opensearch-project/opensearch";

jest.mock("@opensearch-project/opensearch");

describe("OpenSearch Connection Tests", () => {
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
                health: jest.fn().mockResolvedValue({
                    body: {
                        cluster_name: "opensearch-cluster",
                        status: "green",
                        timed_out: false,
                        number_of_nodes: 2,
                        number_of_data_nodes: 2,
                        active_primary_shards: 14,
                        active_shards: 28,
                        relocating_shards: 0,
                        initializing_shards: 0,
                        unassigned_shards: 0,
                        delayed_unassigned_shards: 0,
                        number_of_pending_tasks: 0,
                        number_of_in_flight_fetch: 0,
                        task_max_waiting_in_queue_millis: 0,
                        active_shards_percent_as_number: 100,
                    },
                }),
            },
        } as unknown as jest.Mocked<Client>;

        // Mock the Client constructor to return our mockClient
        (Client as jest.Mock).mockImplementation(() => mockClient);

        service = new OpenSearchService();
    });

    it("should connect to OpenSearch and get cluster health", async () => {
        const health = await service.getClusterHealth();

        expect(mockClient.cluster.health).toHaveBeenCalled();
        expect(health).toEqual({
            cluster_name: "opensearch-cluster",
            status: "green",
            timed_out: false,
            number_of_nodes: 2,
            number_of_data_nodes: 2,
            active_primary_shards: 14,
            active_shards: 28,
            relocating_shards: 0,
            initializing_shards: 0,
            unassigned_shards: 0,
            delayed_unassigned_shards: 0,
            number_of_pending_tasks: 0,
            number_of_in_flight_fetch: 0,
            task_max_waiting_in_queue_millis: 0,
            active_shards_percent_as_number: 100,
        });
    });

    it("should initialize index successfully", async () => {
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

    it("should not initialize index if it already exists", async () => {
        (mockClient.indices.exists as jest.Mock).mockResolvedValueOnce({
            body: true,
        });

        await service.initializeIndex();

        expect(mockClient.indices.exists).toHaveBeenCalled();
        expect(mockClient.indices.create).not.toHaveBeenCalled();
    });
});
