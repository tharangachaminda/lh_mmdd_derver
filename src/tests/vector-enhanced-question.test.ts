import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { QuestionType, DifficultyLevel } from "../models/question.js";

// Mock OpenSearch service
jest.mock("../services/opensearch.service.js");

// Enhanced Question Generation Service with Vector Database Integration
interface VectorEnhancedQuestionService {
    generateVectorEnhancedQuestion(params: {
        type: QuestionType;
        difficulty: DifficultyLevel;
        grade: number;
        useVectorContext?: boolean;
        maxSimilarQuestions?: number;
    }): Promise<{
        id: string;
        type: QuestionType;
        difficulty: DifficultyLevel;
        grade: number;
        question: string;
        answer: number;
        explanation?: string;
        createdAt: Date;
        // Vector enhancement metadata
        vectorContext: {
            similarQuestions: Array<{
                id: string;
                question: string;
                similarity: number;
            }>;
            contextUsed: boolean;
            diversityScore: number;
        };
        generationMetadata: {
            method: "ai-vector-enhanced" | "ai-basic" | "deterministic";
            promptTokens?: number;
            processingTime: number;
        };
    }>;

    analyzeQuestionSimilarity(questionText: string): Promise<{
        embedding: number[];
        similarQuestions: Array<{
            id: string;
            question: string;
            similarity: number;
            difficulty: DifficultyLevel;
            type: QuestionType;
        }>;
        diversityMetrics: {
            uniquenessScore: number;
            patternVariation: number;
        };
    }>;

    buildContextAwarePrompt(params: {
        type: QuestionType;
        difficulty: DifficultyLevel;
        grade: number;
        similarQuestions: Array<{
            question: string;
            explanation?: string;
            type: QuestionType;
        }>;
    }): string;
}

describe("VectorEnhancedQuestionService - TDD Red Phase", () => {
    let vectorQuestionService: VectorEnhancedQuestionService;

    beforeEach(async () => {
        // Mock the embedding service
        const mockEmbeddingService = {
            generateEmbedding: jest
                .fn()
                .mockImplementation(async () => Array(768).fill(0.1)),
            testConnection: jest
                .fn()
                .mockImplementation(async () => ({ success: true })),
        };

        // Mock the language model
        const mockLanguageModel = {
            generateMathQuestion: jest
                .fn()
                .mockImplementation(
                    async () => "Question: What is 5 + 3? Answer: 8"
                ),
            generateFeedback: jest
                .fn()
                .mockImplementation(async () => "Great job!"),
            initialize: jest.fn().mockImplementation(async () => undefined),
        };

        const { VectorEnhancedQuestionService } = await import(
            "../services/vector-enhanced-question.service.js"
        );
        vectorQuestionService = new VectorEnhancedQuestionService(
            mockLanguageModel as any,
            mockEmbeddingService as any
        );
    });

    describe("Vector-Enhanced Question Generation", () => {
        it("should generate question with vector context when available", async () => {
            // RED Phase: This will fail - service doesn't exist
            const params = {
                type: QuestionType.ADDITION,
                difficulty: DifficultyLevel.MEDIUM,
                grade: 5,
                useVectorContext: true,
                maxSimilarQuestions: 3,
            };

            const result =
                await vectorQuestionService.generateVectorEnhancedQuestion(
                    params
                );

            // Enhanced question structure validation
            expect(result).toBeDefined();
            expect(result.question).toBeDefined();
            expect(result.answer).toBeDefined();
            expect(typeof result.answer).toBe("number");

            // Vector context validation
            expect(result.vectorContext).toBeDefined();
            expect(result.vectorContext.similarQuestions).toBeDefined();
            expect(Array.isArray(result.vectorContext.similarQuestions)).toBe(
                true
            );
            expect(result.vectorContext.contextUsed).toBe(true);
            expect(result.vectorContext.diversityScore).toBeGreaterThan(0);
            expect(result.vectorContext.diversityScore).toBeLessThanOrEqual(1);

            // Generation metadata validation
            expect(result.generationMetadata).toBeDefined();
            expect(result.generationMetadata.method).toBe("ai-vector-enhanced");
            expect(result.generationMetadata.processingTime).toBeGreaterThan(0);
        });

        it("should fall back to basic AI generation when vector context fails", async () => {
            // RED Phase: This will fail - service doesn't exist
            const params = {
                type: QuestionType.MULTIPLICATION,
                difficulty: DifficultyLevel.HARD,
                grade: 5,
                useVectorContext: true,
                maxSimilarQuestions: 5,
            };

            // Mock vector search failure
            jest.spyOn(console, "warn").mockImplementation(() => {});

            const result =
                await vectorQuestionService.generateVectorEnhancedQuestion(
                    params
                );

            expect(result.generationMetadata.method).toMatch(
                /ai-basic|deterministic/
            );
            expect(result.vectorContext.contextUsed).toBe(false);
        });

        it("should include explanation when using vector context", async () => {
            // RED Phase: This will fail - service doesn't exist
            const params = {
                type: QuestionType.SUBTRACTION,
                difficulty: DifficultyLevel.EASY,
                grade: 5,
                useVectorContext: true,
            };

            const result =
                await vectorQuestionService.generateVectorEnhancedQuestion(
                    params
                );

            if (result.vectorContext.contextUsed) {
                expect(result.explanation).toBeDefined();
                expect(result.explanation!.length).toBeGreaterThan(10);
            }
        });
    });

    describe("Question Similarity Analysis", () => {
        it("should analyze question similarity and return embeddings", async () => {
            // RED Phase: This will fail - service doesn't exist
            const questionText = "What is 45 + 67? Show your working.";

            const analysis =
                await vectorQuestionService.analyzeQuestionSimilarity(
                    questionText
                );

            expect(analysis.embedding).toBeDefined();
            expect(Array.isArray(analysis.embedding)).toBe(true);
            expect(analysis.embedding.length).toBe(768); // nomic-embed-text dimension

            expect(analysis.similarQuestions).toBeDefined();
            expect(Array.isArray(analysis.similarQuestions)).toBe(true);
            expect(analysis.similarQuestions.length).toBeGreaterThan(0);

            // Validate similarity scores
            analysis.similarQuestions.forEach((q) => {
                expect(q.similarity).toBeGreaterThan(0);
                expect(q.similarity).toBeLessThanOrEqual(1);
                expect(q.id).toBeDefined();
                expect(q.question).toBeDefined();
            });

            // Validate diversity metrics
            expect(analysis.diversityMetrics).toBeDefined();
            expect(analysis.diversityMetrics.uniquenessScore).toBeGreaterThan(
                0
            );
            expect(analysis.diversityMetrics.patternVariation).toBeGreaterThan(
                0
            );
        });

        it("should return sorted similar questions by similarity score", async () => {
            // RED Phase: This will fail - service doesn't exist
            const questionText = "Calculate 234 × 56";

            const analysis =
                await vectorQuestionService.analyzeQuestionSimilarity(
                    questionText
                );

            // Check sorting (highest similarity first)
            for (let i = 1; i < analysis.similarQuestions.length; i++) {
                expect(
                    analysis.similarQuestions[i - 1].similarity
                ).toBeGreaterThanOrEqual(
                    analysis.similarQuestions[i].similarity
                );
            }
        });
    });

    describe("Context-Aware Prompt Building", () => {
        it("should build enhanced prompts with similar question examples", async () => {
            // RED Phase: This will fail - service doesn't exist
            const params = {
                type: QuestionType.DIVISION,
                difficulty: DifficultyLevel.MEDIUM,
                grade: 5,
                similarQuestions: [
                    {
                        question: "What is 144 ÷ 12?",
                        explanation:
                            "144 ÷ 12 = 12. Think of how many groups of 12 fit into 144.",
                        type: QuestionType.DIVISION,
                    },
                    {
                        question: "Calculate 96 ÷ 8",
                        explanation:
                            "96 ÷ 8 = 12. Use the times table to help: 8 × 12 = 96.",
                        type: QuestionType.DIVISION,
                    },
                ],
            };

            const prompt =
                vectorQuestionService.buildContextAwarePrompt(params);

            expect(prompt).toBeDefined();
            expect(prompt.length).toBeGreaterThan(100);

            // Should include examples
            expect(prompt).toContain("144 ÷ 12");
            expect(prompt).toContain("96 ÷ 8");

            // Should include grade and difficulty
            expect(prompt).toContain("grade 5");
            expect(prompt).toContain("medium");

            // Should include generation instructions
            expect(prompt).toContain("Generate");
            expect(prompt).toContain("similar style");
        });

        it("should handle empty similar questions gracefully", async () => {
            // RED Phase: This will fail - service doesn't exist
            const params = {
                type: QuestionType.ADDITION,
                difficulty: DifficultyLevel.EASY,
                grade: 5,
                similarQuestions: [],
            };

            const prompt =
                vectorQuestionService.buildContextAwarePrompt(params);

            expect(prompt).toBeDefined();
            expect(prompt.length).toBeGreaterThan(50);
            expect(prompt).toContain("grade 5");
            expect(prompt).toContain("easy");
        });
    });

    describe("Integration with Existing Services", () => {
        it("should maintain compatibility with existing QuestionGenerationService", async () => {
            // RED Phase: This will fail - enhanced service doesn't exist
            const params = {
                type: QuestionType.ADDITION,
                difficulty: DifficultyLevel.EASY,
                grade: 5,
                useVectorContext: false, // Disable vector features
            };

            const result =
                await vectorQuestionService.generateVectorEnhancedQuestion(
                    params
                );

            // Should work like traditional generation
            expect(result.question).toBeDefined();
            expect(result.answer).toBeDefined();
            expect(result.generationMetadata.method).toMatch(
                /ai-basic|deterministic/
            );
        });
    });

    describe("Performance and Quality Metrics", () => {
        it("should complete vector-enhanced generation within acceptable time", async () => {
            // RED Phase: This will fail - service doesn't exist
            const startTime = Date.now();

            const params = {
                type: QuestionType.MULTIPLICATION,
                difficulty: DifficultyLevel.MEDIUM,
                grade: 5,
                useVectorContext: true,
            };

            const result =
                await vectorQuestionService.generateVectorEnhancedQuestion(
                    params
                );

            const totalTime = Date.now() - startTime;

            // Should complete within 5 seconds
            expect(totalTime).toBeLessThan(5000);
            expect(result.generationMetadata.processingTime).toBeLessThan(5000);
        });

        it("should generate diverse questions when called multiple times", async () => {
            // RED Phase: This will fail - service doesn't exist
            const params = {
                type: QuestionType.SUBTRACTION,
                difficulty: DifficultyLevel.MEDIUM,
                grade: 5,
                useVectorContext: true,
            };

            const questions = await Promise.all([
                vectorQuestionService.generateVectorEnhancedQuestion(params),
                vectorQuestionService.generateVectorEnhancedQuestion(params),
                vectorQuestionService.generateVectorEnhancedQuestion(params),
            ]);

            // All questions should be different
            const questionTexts = questions.map((q) => q.question);
            const uniqueQuestions = new Set(questionTexts);
            expect(uniqueQuestions.size).toBe(3);

            // Diversity scores should be reasonable
            questions.forEach((q) => {
                if (q.vectorContext.contextUsed) {
                    expect(q.vectorContext.diversityScore).toBeGreaterThan(0.3);
                }
            });
        });
    });
});
