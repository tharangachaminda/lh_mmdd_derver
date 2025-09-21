import { LangChainService } from "../services/langchain.service.js";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Define types for our mocked objects
type MockEmbeddingResult = {
    vector: Float32Array;
};

type MockContext = {
    getEmbeddingFor: jest.MockedFunction<
        (text: string) => Promise<MockEmbeddingResult>
    >;
    free: jest.MockedFunction<() => Promise<void>>;
};

type MockModel = {
    createEmbeddingContext: jest.MockedFunction<() => Promise<MockContext>>;
    free: jest.MockedFunction<() => Promise<void>>;
};

type MockLlamaInstance = {
    loadModel: jest.MockedFunction<
        (options: {
            modelPath: string;
            gpuLayers?: number;
        }) => Promise<MockModel>
    >;
};

// Mock the module before any imports or test setup
jest.mock("node-llama-cpp", () => {
    const mockContext: MockContext = {
        getEmbeddingFor: jest.fn(async () => ({
            vector: new Float32Array(new Array(1536).fill(0.1)),
        })),
        free: jest.fn(async () => undefined),
    };

    const mockModel: MockModel = {
        createEmbeddingContext: jest.fn(async () => mockContext),
        free: jest.fn(async () => undefined),
    };

    const mockLlama: MockLlamaInstance = {
        loadModel: jest.fn(async (options) => {
            if (!options?.modelPath) {
                throw new Error("Model path not provided");
            }
            return mockModel;
        }),
    };

    return {
        getLlama: jest.fn(() => mockLlama),
    };
});

describe("LangChainService", () => {
    let service: LangChainService;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Reset the singleton instance
        (LangChainService as any).instance = null;
        service = LangChainService.getInstance();
    });

    describe("generateEmbedding", () => {
        it("should generate embedding of correct dimension", async () => {
            // Act
            const text = "Sample text for embedding";
            const embedding = await service.generateEmbedding(text);

            // Assert
            expect(embedding).toBeInstanceOf(Float32Array);
            expect(embedding.length).toBe(1536);
            expect(
                Array.from(embedding).every(
                    (val: unknown): val is number => typeof val === "number"
                )
            ).toBe(true);
        });

        it("should handle empty text", async () => {
            // Act
            const embedding = await service.generateEmbedding("");

            // Assert
            expect(embedding).toBeInstanceOf(Float32Array);
            expect(embedding.length).toBe(1536);
        });

        it("should initialize model on first call", async () => {
            // Act
            await service.generateEmbedding("Test text");

            // Assert
            const module = jest.requireMock("node-llama-cpp") as {
                getLlama: jest.MockedFunction<() => MockLlamaInstance>;
            };
            const mockGetLlama = module.getLlama;
            const mockLlama = mockGetLlama();
            expect(mockGetLlama).toHaveBeenCalled();
            expect(mockLlama.loadModel).toHaveBeenCalledWith({
                modelPath: expect.any(String),
                gpuLayers: 0,
            });
        });

        it("should reuse model for subsequent calls", async () => {
            // Act
            await service.generateEmbedding("First call");
            await service.generateEmbedding("Second call");

            // Assert
            const module = jest.requireMock("node-llama-cpp") as {
                getLlama: jest.MockedFunction<() => MockLlamaInstance>;
            };
            const mockGetLlama = module.getLlama;
            const mockLlama = mockGetLlama();
            expect(mockGetLlama).toHaveBeenCalledTimes(1);
            expect(mockLlama.loadModel).toHaveBeenCalledTimes(1);
        });
    });

    describe("cleanup", () => {
        it("should free resources when cleanup is called", async () => {
            // Arrange
            await service.generateEmbedding("Test text"); // Initialize the model

            // Act
            await service.cleanup();

            // Assert
            const module = jest.requireMock("node-llama-cpp") as {
                getLlama: jest.MockedFunction<() => MockLlamaInstance>;
            };
            const mockGetLlama = module.getLlama;
            const mockLlama = mockGetLlama();
            const mockModel = await mockLlama.loadModel({
                modelPath: "/mock/model/path",
            });
            expect(mockModel.free).toHaveBeenCalled();
        });

        it("should handle cleanup when no model is initialized", async () => {
            // Act & Assert
            await expect(service.cleanup()).resolves.not.toThrow();
        });
    });
});
