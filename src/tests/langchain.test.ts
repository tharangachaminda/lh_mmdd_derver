import { LangChainService } from "../services/langchain.service";
import path from "node:path";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";

jest.mock("node-llama-cpp", () => ({
    getLlama: jest.fn().mockResolvedValue({
        loadModel: jest.fn().mockResolvedValue({
            createEmbeddingContext: jest.fn().mockResolvedValue({
                getEmbeddingFor: jest.fn().mockResolvedValue({
                    vector: new Float32Array(
                        new Array(1536).fill(0).map(() => Math.random())
                    ),
                }),
                free: jest.fn().mockResolvedValue(undefined),
            }),
            free: jest.fn().mockResolvedValue(undefined),
        }),
    }),
}));

describe("LangChainService", () => {
    let service: LangChainService;

    beforeEach(() => {
        // Reset environment variables
        const filePath = new URL("test-model.gguf", import.meta.url).pathname;
        process.env.LLAMA_MODEL_PATH = filePath;
        process.env.LLAMA_NUM_THREADS = "4";
        process.env.LLAMA_CONTEXT_SIZE = "2048";
        process.env.LLAMA_BATCH_SIZE = "512";
        process.env.LLAMA_EMBEDDING_SIZE = "1536";

        // Clear the singleton instance before each test
        (LangChainService as any).instance = null;
        service = LangChainService.getInstance();
    });

    afterEach(async () => {
        await service.cleanup();
    });

    describe("generateEmbedding", () => {
        it("should generate embedding of correct dimension", async () => {
            const text = "Sample text for embedding";
            const embedding = await service.generateEmbedding(text);

            expect(embedding).toHaveLength(1536);
            expect(embedding.every((val) => typeof val === "number")).toBe(
                true
            );
        });

        it("should handle empty text", async () => {
            const embedding = await service.generateEmbedding("");
            expect(embedding).toHaveLength(1536);
        });

        it("should maintain consistent dimensions across calls", async () => {
            const text1 = "First text";
            const text2 = "Second text";

            const embedding1 = await service.generateEmbedding(text1);
            const embedding2 = await service.generateEmbedding(text2);

            expect(embedding1.length).toBe(embedding2.length);
        });

        it("should initialize model on first call", async () => {
            const text = "Test text";
            await service.generateEmbedding(text);

            // Model should be initialized after first call
            expect(require("node-llama-cpp").getLlama).toHaveBeenCalled();
        });

        it("should reuse model for subsequent calls", async () => {
            const llama = require("node-llama-cpp");
            const originalGetLlama = llama.getLlama;
            const getLlamaSpy = jest.fn().mockImplementation(originalGetLlama);
            llama.getLlama = getLlamaSpy;

            await service.generateEmbedding("First call");
            await service.generateEmbedding("Second call");

            expect(getLlamaSpy).toHaveBeenCalledTimes(1);

            // Restore the original function
            llama.getLlama = originalGetLlama;
        });
    });
});
