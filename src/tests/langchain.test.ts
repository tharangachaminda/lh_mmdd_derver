import { LangChainService } from "../services/langchain.service.js";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

// Mock the llama-cpp module
jest.mock("node-llama-cpp", () => {
    const mockEmbeddingVector = new Float32Array(new Array(1536).fill(0.1));

    const mockContext = {
        getEmbeddingFor: jest
            .fn()
            .mockImplementation(() =>
                Promise.resolve({ vector: mockEmbeddingVector })
            ),
        free: jest.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockModel = {
        createEmbeddingContext: jest
            .fn()
            .mockImplementation(() => Promise.resolve(mockContext)),
        free: jest.fn().mockImplementation(() => Promise.resolve()),
    };

    const mockLlama = {
        loadModel: jest
            .fn()
            .mockImplementation(() => Promise.resolve(mockModel)),
    };

    return {
        getLlama: jest.fn().mockImplementation(() => mockLlama),
    };
});

// Test suite begins

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
            const mockModule = jest.requireMock("node-llama-cpp") as {
                getLlama: jest.MockedFunction<
                    () => {
                        loadModel: jest.MockedFunction<
                            (opts: any) => Promise<any>
                        >;
                    }
                >;
            };
            expect(mockModule.getLlama).toHaveBeenCalled();
            expect(mockModule.getLlama().loadModel).toHaveBeenCalledWith({
                modelPath: expect.any(String),
                gpuLayers: 0,
            });
        });

        it("should reuse model for subsequent calls", async () => {
            // Act
            await service.generateEmbedding("First call");
            await service.generateEmbedding("Second call");

            // Assert
            const mockModule = jest.requireMock("node-llama-cpp") as {
                getLlama: jest.MockedFunction<
                    () => {
                        loadModel: jest.MockedFunction<
                            (opts: any) => Promise<any>
                        >;
                    }
                >;
            };
            expect(mockModule.getLlama).toHaveBeenCalledTimes(1);
            expect(mockModule.getLlama().loadModel).toHaveBeenCalledTimes(1);
        });
    });

    describe("cleanup", () => {
        it("should free resources when cleanup is called", async () => {
            // Arrange
            await service.generateEmbedding("Test text"); // Initialize the model

            // Act
            await service.cleanup();

            // Assert
            const mockModule = jest.requireMock("node-llama-cpp") as {
                getLlama: jest.MockedFunction<
                    () => {
                        loadModel: jest.MockedFunction<
                            (opts: any) => Promise<any>
                        >;
                    }
                >;
            };
            const mockGetLlama = mockModule.getLlama;
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
