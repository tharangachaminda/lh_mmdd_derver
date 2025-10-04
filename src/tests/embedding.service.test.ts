import { describe, it, expect, beforeEach, jest } from "@jest/globals";

// Define interface for the embedding service
interface EmbeddingService {
    generateEmbedding(text: string): Promise<number[]>;
    generateBatchEmbeddings(texts: string[]): Promise<number[][]>;
    testConnection(): Promise<boolean>;
}

describe("EmbeddingService - TDD Red Phase", () => {
    let embeddingService: EmbeddingService;

    beforeEach(async () => {
        const { EmbeddingService } = await import(
            "../services/embedding.service.js"
        );
        embeddingService = new EmbeddingService();
    });

    describe("Single Embedding Generation", () => {
        it("should generate embedding for question content", async () => {
            // RED Phase: This will fail because service doesn't exist
            const questionContent =
                "Calculate: 4,567 + 2,834. Addition problem requiring carrying across multiple place values.";

            const embedding = await embeddingService.generateEmbedding(
                questionContent
            );

            expect(embedding).toBeDefined();
            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding.length).toBe(768); // nomic-embed-text dimension
            expect(embedding.every((num) => typeof num === "number")).toBe(
                true
            );
        });

        it("should handle empty text gracefully", async () => {
            // RED Phase: This will fail because service doesn't exist
            const embedding = await embeddingService.generateEmbedding("");

            expect(embedding).toBeDefined();
            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding.length).toBe(768);
        });
    });

    describe("Batch Embedding Generation", () => {
        it("should generate embeddings for multiple questions", async () => {
            // RED Phase: This will fail because service doesn't exist
            const questionContents = [
                "Calculate: 4,567 + 2,834. Addition problem requiring carrying across multiple place values.",
                "What is 156 ÷ 12? Division problem with remainder.",
                "Find the perimeter of a rectangle with length 8cm and width 5cm.",
            ];

            const embeddings = await embeddingService.generateBatchEmbeddings(
                questionContents
            );

            expect(embeddings).toBeDefined();
            expect(Array.isArray(embeddings)).toBe(true);
            expect(embeddings.length).toBe(3);
            embeddings.forEach((embedding) => {
                expect(Array.isArray(embedding)).toBe(true);
                expect(embedding.length).toBe(768);
                expect(embedding.every((num) => typeof num === "number")).toBe(
                    true
                );
            });
        });

        it("should handle batch processing with error recovery", async () => {
            // RED Phase: This will fail because service doesn't exist
            const questionContents = [
                "Valid question content",
                "", // Empty content - should still work
                "Another valid question",
            ];

            const embeddings = await embeddingService.generateBatchEmbeddings(
                questionContents
            );

            expect(embeddings.length).toBe(3);
            embeddings.forEach((embedding) => {
                expect(embedding.length).toBe(768);
            });
        });
    });

    describe("Service Connection", () => {
        it("should test connection to embedding service", async () => {
            // RED Phase: This will fail because service doesn't exist
            const isConnected = await embeddingService.testConnection();

            expect(typeof isConnected).toBe("boolean");
        });
    });
});
