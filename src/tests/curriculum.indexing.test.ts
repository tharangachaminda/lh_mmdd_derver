import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import fs from "fs/promises";
import path from "path";
import { CurriculumDataService } from "../services/curriculumData.service.js";
import { CurriculumContent } from "../models/curriculum.js";
import { QuestionType, DifficultyLevel } from "../models/question.js";
import { Client } from "@opensearch-project/opensearch";
import {
    loadCurriculumFromJSON,
    validateCurriculumData,
    processCurriculumBatch,
} from "../utils/curriculum.loader.js";

// Mock OpenSearch client using the same structure as existing tests
const mockExists = jest.fn();
const mockCreate = jest.fn();
const mockIndex = jest.fn();
const mockSearch = jest.fn();

const mockClient = {
    indices: {
        exists: mockExists,
        create: mockCreate,
    },
    index: mockIndex,
    search: mockSearch,
} as unknown as Client;

// Set up default mock return values
(mockExists as any).mockResolvedValue({ body: true });
(mockCreate as any).mockResolvedValue({ body: { acknowledged: true } });
(mockIndex as any).mockResolvedValue({ body: { _id: "test-curriculum-id" } });
(mockSearch as any).mockResolvedValue({
    body: {
        hits: {
            hits: [
                {
                    _source: {
                        id: "test-curriculum-id",
                        grade: 2,
                        topic: "Addition",
                    },
                    _score: 0.95,
                },
            ],
        },
    },
});

// Mock the language model service
const mockGenerateEmbedding = jest.fn();
const mockGenerateQuestions = jest.fn();

const mockLanguageModel = {
    generateEmbedding: mockGenerateEmbedding,
    generateQuestions: mockGenerateQuestions,
};

describe("Curriculum Vector Indexing", () => {
    let curriculumService: CurriculumDataService;
    let sampleCurriculumData: CurriculumContent;

    beforeEach(() => {
        jest.clearAllMocks();

        // Set up mock embedding response
        const mockEmbedding = Array.from({ length: 1536 }, () => Math.random());
        (mockGenerateEmbedding as any).mockResolvedValue(mockEmbedding);

        curriculumService = new CurriculumDataService(
            mockClient,
            mockLanguageModel as any
        );
    });

    describe("JSON Data Loading", () => {
        it("should load curriculum data from JSON file", async () => {
            // This test expects a JSON loader utility to exist
            // Currently will fail because we haven't implemented it
            const jsonPath = path.join(
                process.cwd(),
                "sample-curriculum-data.json"
            );

            // We expect a utility function to load and parse curriculum JSON
            const loadedData = await loadCurriculumFromJSON(jsonPath);

            expect(loadedData).toBeDefined();
            expect(loadedData.id).toBe("math-grade2-addition-basic");
            expect(loadedData.grade).toBe(2);
            expect(loadedData.topic).toBe("Addition");
            expect(loadedData.sampleQuestions).toHaveLength(3);
        });

        it("should validate curriculum data structure", async () => {
            const jsonPath = path.join(
                process.cwd(),
                "sample-curriculum-data.json"
            );

            // This test expects validation function to exist
            const isValid = await validateCurriculumData(jsonPath);

            expect(isValid).toBe(true);
        });
    });

    describe("Embedding Generation and Vector Storage", () => {
        beforeEach(() => {
            sampleCurriculumData = {
                id: "test-curriculum-001",
                grade: 2,
                subject: "Mathematics",
                topic: "Addition",
                subtopic: "Single Digit Addition",
                concept: {
                    id: "concept-single-digit-addition",
                    name: "Single Digit Addition",
                    description: "Addition of two single-digit numbers (0-9)",
                    keywords: ["addition", "single digit", "sum"],
                },
                difficulty: DifficultyLevel.EASY,
                questionTypes: [QuestionType.ADDITION],
                sampleQuestions: [
                    {
                        id: "q-001",
                        question: "What is 3 + 4?",
                        answer: 7,
                        explanation: "Count forward 4 steps from 3",
                        type: QuestionType.ADDITION,
                        keywords: ["addition", "basic"],
                    },
                ],
                prerequisites: ["Number recognition"],
                learningObjectives: ["Add single-digit numbers"],
                commonMistakes: ["Confusing with subtraction"],
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
            };
        });

        it("should generate embeddings for curriculum content", async () => {
            // Test that embeddings are generated for the content description
            const result = await curriculumService.storeCurriculumContent(
                sampleCurriculumData
            );

            expect(result).toBeDefined();
            expect(mockClient.index).toHaveBeenCalledWith({
                index: "curriculum",
                id: "test-curriculum-001",
                body: expect.objectContaining({
                    ...sampleCurriculumData,
                    embedding: expect.any(Array),
                }),
            });
        });

        it("should store curriculum data with vector embeddings", async () => {
            const curriculumId = await curriculumService.storeCurriculumContent(
                sampleCurriculumData
            );

            expect(curriculumId).toBe("test-curriculum-id");
            expect(mockClient.index).toHaveBeenCalledWith(
                expect.objectContaining({
                    index: "curriculum",
                    id: "test-curriculum-001",
                    body: expect.objectContaining({
                        grade: 2,
                        topic: "Addition",
                        embedding: expect.any(Array),
                    }),
                })
            );
        });

        it("should search similar curriculum content using vectors", async () => {
            const searchResults = await curriculumService.searchSimilarContent(
                "addition problems for grade 2",
                { grade: 2, limit: 3 }
            );

            expect(searchResults).toBeDefined();
            expect(searchResults.length).toBeGreaterThan(0);
            expect(searchResults[0]).toHaveProperty("content");
            expect(searchResults[0]).toHaveProperty("score");
            expect(searchResults[0].score).toBeGreaterThan(0);
        });
    });

    describe("Batch Processing", () => {
        it("should process multiple curriculum items from JSON array", async () => {
            // This test expects batch processing functionality
            const jsonArrayPath = path.join(
                process.cwd(),
                "curriculum-batch-sample.json"
            );

            // Expected to fail - batch processing not implemented yet
            const results = await processCurriculumBatch(jsonArrayPath);

            expect(results).toBeDefined();
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);
        });

        it("should handle errors gracefully during batch processing", async () => {
            const invalidJsonPath = "non-existent-file.json";

            // Should handle file not found gracefully
            await expect(
                processCurriculumBatch(invalidJsonPath)
            ).rejects.toThrow(
                /File not found|Failed to process curriculum batch/
            );
        });
    });
});
