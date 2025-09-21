import { Client } from "@opensearch-project/opensearch";
import { CurriculumDataService } from "../services/curriculumData.service.js";
import {
    CurriculumContent,
    MathConcept,
    SampleQuestion,
} from "../models/curriculum.js";
import { QuestionType, DifficultyLevel } from "../models/question.js";
import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";

jest.mock("@opensearch-project/opensearch");

describe("CurriculumDataService", () => {
    let curriculumService: CurriculumDataService;
    let mockClient: DeepMockProxy<Client>;
    let sampleContent: CurriculumContent;

    beforeEach(() => {
        mockClient = mockDeep<Client>();
        curriculumService = new CurriculumDataService(mockClient);

        // Setup sample curriculum content
        sampleContent = {
            id: "curr-001",
            grade: 5,
            subject: "Mathematics",
            topic: "Fractions",
            subtopic: "Addition",
            concept: {
                id: "concept-001",
                name: "Adding Fractions with Like Denominators",
                description:
                    "Learn to add fractions that have the same denominator",
                keywords: ["fractions", "addition", "like denominators"],
            },
            difficulty: DifficultyLevel.MEDIUM,
            questionTypes: [QuestionType.FRACTION_ADDITION],
            sampleQuestions: [
                {
                    id: "q-001",
                    question: "What is 2/5 + 1/5?",
                    answer: "3/5",
                    explanation:
                        "Add the numerators, keep the same denominator",
                    type: QuestionType.FRACTION_ADDITION,
                    keywords: ["fractions", "addition"],
                },
            ],
            learningObjectives: ["Add fractions with like denominators"],
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
        };
    });

    describe("initializeIndex", () => {
        it("should create index with correct mapping if it does not exist", async () => {
            (mockClient.indices.exists as jest.Mock).mockResolvedValue({
                body: false,
            });
            (mockClient.indices.create as jest.Mock).mockResolvedValue({
                body: { acknowledged: true },
            });

            await curriculumService.initializeIndex();

            expect(mockClient.indices.create).toHaveBeenCalledWith({
                index: "curriculum",
                body: expect.objectContaining({
                    mappings: expect.objectContaining({
                        properties: expect.objectContaining({
                            embedding: {
                                type: "knn_vector",
                                dimension: 1536,
                            },
                        }),
                    }),
                }),
            });
        });

        it("should not create index if it already exists", async () => {
            (mockClient.indices.exists as jest.Mock).mockResolvedValue({
                body: true,
            });

            await curriculumService.initializeIndex();

            expect(mockClient.indices.create).not.toHaveBeenCalled();
        });
    });

    describe("storeCurriculumContent", () => {
        it("should store curriculum content with generated embedding", async () => {
            const mockEmbedding = new Array(1536).fill(0.1);
            (mockClient.index as jest.Mock).mockResolvedValue({
                body: { _id: "curr-001" },
            });

            // Mock the embedding generation
            jest.spyOn(
                curriculumService as any,
                "generateEmbedding"
            ).mockResolvedValue(mockEmbedding);

            const result = await curriculumService.storeCurriculumContent(
                sampleContent
            );

            expect(mockClient.index).toHaveBeenCalledWith({
                index: "curriculum",
                id: sampleContent.id,
                body: expect.objectContaining({
                    ...sampleContent,
                    embedding: mockEmbedding,
                }),
            });
            expect(result).toBe("curr-001");
        });

        it("should throw error if storing fails", async () => {
            (mockClient.index as jest.Mock).mockRejectedValue(
                new Error("Storage failed")
            );

            await expect(
                curriculumService.storeCurriculumContent(sampleContent)
            ).rejects.toThrow("Failed to store curriculum content");
        });
    });

    describe("searchSimilarContent", () => {
        it("should find similar content based on query", async () => {
            const mockEmbedding = new Array(1536).fill(0.1);
            const mockHits = [
                {
                    _source: { ...sampleContent },
                    _score: 0.95,
                },
            ];

            (mockClient.search as jest.Mock).mockResolvedValue({
                body: { hits: { hits: mockHits } },
            });

            // Mock the embedding generation
            jest.spyOn(
                curriculumService as any,
                "generateEmbedding"
            ).mockResolvedValue(mockEmbedding);

            const results = await curriculumService.searchSimilarContent(
                "adding fractions with same denominator",
                { grade: 5, limit: 5 }
            );

            expect(mockClient.search).toHaveBeenCalledWith({
                index: "curriculum",
                body: expect.objectContaining({
                    query: expect.objectContaining({
                        bool: expect.objectContaining({
                            must: expect.arrayContaining([
                                { term: { grade: 5 } },
                                {
                                    script_score: expect.objectContaining({
                                        script: expect.objectContaining({
                                            source: expect.stringContaining(
                                                "cosineSimilarity"
                                            ),
                                        }),
                                    }),
                                },
                            ]),
                        }),
                    }),
                    size: 5,
                }),
            });

            expect(results).toHaveLength(1);
            expect(results[0].content).toEqual(sampleContent);
            expect(results[0].score).toBe(0.95);
        });

        it("should handle no results found", async () => {
            (mockClient.search as jest.Mock).mockResolvedValue({
                body: { hits: { hits: [] } },
            });

            const results = await curriculumService.searchSimilarContent(
                "adding fractions",
                { limit: 5 }
            );

            expect(results).toHaveLength(0);
        });
    });

    describe("deleteCurriculumContent", () => {
        it("should delete curriculum content by id", async () => {
            (mockClient.delete as jest.Mock).mockResolvedValue({
                body: { result: "deleted" },
            });

            await curriculumService.deleteCurriculumContent("curr-001");

            expect(mockClient.delete).toHaveBeenCalledWith({
                index: "curriculum",
                id: "curr-001",
            });
        });

        it("should throw error if content not found", async () => {
            (mockClient.delete as jest.Mock).mockRejectedValue({
                body: { result: "not_found" },
            });

            await expect(
                curriculumService.deleteCurriculumContent("invalid-id")
            ).rejects.toThrow("Curriculum content not found");
        });
    });

    describe("updateCurriculumContent", () => {
        it("should update existing curriculum content", async () => {
            const updatedContent = {
                ...sampleContent,
                topic: "Updated Topic",
            };

            (mockClient.update as jest.Mock).mockResolvedValue({
                body: { result: "updated" },
            });

            await curriculumService.updateCurriculumContent(updatedContent);

            expect(mockClient.update).toHaveBeenCalledWith({
                index: "curriculum",
                id: updatedContent.id,
                body: {
                    doc: expect.objectContaining({
                        topic: "Updated Topic",
                        updatedAt: expect.any(Date),
                    }),
                },
            });
        });

        it("should throw error if content not found", async () => {
            (mockClient.update as jest.Mock).mockRejectedValue({
                body: { result: "not_found" },
            });

            await expect(
                curriculumService.updateCurriculumContent(sampleContent)
            ).rejects.toThrow("Curriculum content not found");
        });
    });
});
