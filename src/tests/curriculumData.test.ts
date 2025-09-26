import { jest } from "@jest/globals";
import type { Client } from "@opensearch-project/opensearch";
import { DifficultyLevel, QuestionType } from "../models/question.js";
import {
    CurriculumContent,
    MathConcept,
    SampleQuestion,
} from "../models/curriculum.js";
import { CurriculumDataService } from "../services/curriculumData.service.js";
import { LangChainService } from "../services/langchain.service.js";

// Mock OpenSearch client
jest.mock("@opensearch-project/opensearch", () => ({
    Client: jest.fn(() => ({
        indices: {
            exists: jest
                .fn()
                .mockImplementation(() => Promise.resolve({ body: true })),
            create: jest
                .fn()
                .mockImplementation(() =>
                    Promise.resolve({ body: { acknowledged: true } })
                ),
        },
        index: jest
            .fn()
            .mockImplementation(() =>
                Promise.resolve({ body: { _id: "curr-001" } })
            ),
        search: jest.fn().mockImplementation(() =>
            Promise.resolve({
                body: {
                    hits: {
                        hits: [],
                    },
                },
            })
        ),
        delete: jest
            .fn()
            .mockImplementation(() =>
                Promise.resolve({ body: { found: true, _id: "curr-001" } })
            ),
        cluster: {
            health: jest
                .fn()
                .mockImplementation(() =>
                    Promise.resolve({ body: { status: "green" } })
                ),
        },
    })),
}));

// Mock node-llama-cpp
jest.mock("node-llama-cpp", () => {
    const mockModel = {
        completion: jest
            .fn()
            .mockImplementation(() =>
                Promise.resolve({ text: "mock response" })
            ),
        embedding: jest
            .fn()
            .mockImplementation(() =>
                Promise.resolve(new Float32Array(1536).fill(0.1))
            ),
    };

    return {
        getLlama: jest.fn().mockImplementation(() => ({
            loadModel: jest
                .fn()
                .mockImplementation(() => Promise.resolve(mockModel)),
        })),
    };
});

// Mock process.env
process.env.LLAMA_MODEL_PATH = "/mock/model/path";

// Mock LangChain service
jest.mock("../services/langchain.service.js", () => {
    const mockEmbedding = new Float32Array(new Array(1536).fill(0.1));

    const mockLangChainService = {
        getInstance: jest.fn().mockImplementation(() => ({
            initialize: jest.fn().mockImplementation(() => Promise.resolve()),
            generateMathQuestion: jest
                .fn()
                .mockImplementation(() => Promise.resolve("What is 2+2?")),
            generateFeedback: jest
                .fn()
                .mockImplementation(() => Promise.resolve("Good job!")),
            generateEmbedding: jest
                .fn()
                .mockImplementation(() => Promise.resolve(mockEmbedding)),
            cleanup: jest.fn().mockImplementation(() => Promise.resolve()),
        })),
    };

    return { LangChainService: mockLangChainService };
});

// Mock language model factory
jest.mock("../services/language-model.factory.js", () => {
    const mockEmbedding = new Float32Array(new Array(1536).fill(0.1));

    const mockLanguageModel = {
        initialize: jest.fn().mockImplementation(() => Promise.resolve()),
        generateMathQuestion: jest
            .fn()
            .mockImplementation(() => Promise.resolve("What is 2+2?")),
        generateFeedback: jest
            .fn()
            .mockImplementation(() => Promise.resolve("Good job!")),
        generateEmbedding: jest
            .fn()
            .mockImplementation(() =>
                Promise.resolve(Array.from(mockEmbedding))
            ),
        cleanup: jest.fn().mockImplementation(() => Promise.resolve()),
    };

    return {
        LanguageModelFactory: {
            getInstance: jest.fn().mockImplementation(() => ({
                createModel: jest
                    .fn()
                    .mockImplementation(() => mockLanguageModel),
            })),
            LanguageModelType: {
                OLLAMA: "ollama",
            },
        },
    };
});

describe("CurriculumDataService", () => {
    let service: CurriculumDataService;
    let mockClient: Client;
    let mockLangChainService: LangChainService;
    let sampleContent: CurriculumContent;

    beforeEach(() => {
        jest.clearAllMocks();

        // Setup mock client with basic mock functions
        mockClient = {
            indices: {
                exists: jest
                    .fn()
                    .mockImplementation(() => Promise.resolve({ body: true })),
                create: jest
                    .fn()
                    .mockImplementation(() =>
                        Promise.resolve({ body: { acknowledged: true } })
                    ),
            },
            index: jest
                .fn()
                .mockImplementation(() =>
                    Promise.resolve({ body: { _id: "curr-001" } })
                ),
            update: jest
                .fn()
                .mockImplementation(() =>
                    Promise.resolve({ body: { _id: "curr-001" } })
                ),
            search: jest.fn().mockImplementation(() =>
                Promise.resolve({
                    body: {
                        hits: {
                            hits: [],
                        },
                    },
                })
            ),
            delete: jest
                .fn()
                .mockImplementation(() =>
                    Promise.resolve({ body: { found: true, _id: "curr-001" } })
                ),
            cluster: {
                health: jest
                    .fn()
                    .mockImplementation(() =>
                        Promise.resolve({ body: { status: "green" } })
                    ),
            },
        } as unknown as Client; // Setup mock LangChain service
        mockLangChainService = LangChainService.getInstance();

        // Create sample entities
        const conceptSample: MathConcept = {
            id: "concept-001",
            name: "Single Digit Addition",
            description: "Adding numbers between 0 and 9",
            keywords: ["addition", "single digit", "basic math"],
        };

        const questionSample: SampleQuestion = {
            id: "q-001",
            question: "What is 5 + 3?",
            answer: "8",
            explanation: "Count forward 3 numbers starting from 5",
            type: QuestionType.ADDITION,
        };

        // Setup sample content
        // Setup sample content
        sampleContent = {
            id: "curr-001",
            grade: 5,
            subject: "Math",
            topic: "Arithmetic",
            subtopic: "Addition",
            difficulty: DifficultyLevel.EASY,
            questionTypes: [QuestionType.ADDITION],
            concept: conceptSample,
            sampleQuestions: [questionSample],
            learningObjectives: ["Learn to add single digit numbers"],
            version: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        // Initialize service
        service = new CurriculumDataService(mockClient, mockLangChainService);
    });

    describe("constructor", () => {
        it("should use LanguageModelFactory to create language model by default", () => {
            // This test expects the service to use factory pattern
            // Currently it uses direct LangChainService, so this will fail
            const serviceWithoutLangChain = new CurriculumDataService(
                mockClient
            );

            // We expect the service to use factory.createModel() which should return OllamaLanguageModel
            // This will fail until we refactor the constructor
            expect(() => {
                // Access private field for testing - this is a design smell we want to fix
                const langService = (serviceWithoutLangChain as any)
                    .langchainService;
                // Should be OllamaLanguageModel after factory refactor
                expect(langService.constructor.name).toBe(
                    "OllamaLanguageModel"
                );
            }).not.toThrow();
        });
    });

    describe("initializeIndex", () => {
        it("should create index if it does not exist", async () => {
            // Setup
            (mockClient.indices.exists as any).mockResolvedValue({
                body: false,
            });

            (mockClient.indices.create as any).mockResolvedValue({
                body: { acknowledged: true },
            });

            // Execute
            await service.initializeIndex();

            // Assert
            expect(mockClient.indices.exists).toHaveBeenCalled();
            expect(mockClient.indices.create).toHaveBeenCalled();
        });

        it("should not create index if it already exists", async () => {
            // Setup
            (mockClient.indices.exists as any).mockResolvedValue({
                body: true,
            });

            // Execute
            await service.initializeIndex();

            // Assert
            expect(mockClient.indices.exists).toHaveBeenCalled();
            expect(mockClient.indices.create).not.toHaveBeenCalled();
        });

        it("should throw error if index creation fails", async () => {
            // Setup
            (mockClient.indices.exists as jest.Mock).mockImplementation(() =>
                Promise.resolve({ body: false })
            );
            (mockClient.indices.create as jest.Mock).mockImplementation(() =>
                Promise.reject(new Error("Failed to create index"))
            );

            // Execute & Assert
            await expect(service.initializeIndex()).rejects.toThrow(
                "Failed to create index"
            );
        });
    });

    describe("storeCurriculumContent", () => {
        it("should successfully store curriculum content", async () => {
            // Setup
            (mockClient.index as jest.Mock).mockImplementation(() =>
                Promise.resolve({ body: { _id: "curr-001" } })
            );

            // Execute
            const result = await service.storeCurriculumContent(sampleContent);

            // Assert
            expect(result).toBe("curr-001");
            expect(mockClient.index).toHaveBeenCalledWith({
                index: "curriculum",
                body: expect.objectContaining({
                    ...sampleContent,
                    vector: expect.any(Float32Array),
                }),
            });
        });

        it("should throw error if storage fails", async () => {
            // Setup
            (mockClient.index as jest.Mock).mockImplementation(() =>
                Promise.reject(new Error("Failed to store curriculum content"))
            );

            // Execute & Assert
            await expect(
                service.storeCurriculumContent(sampleContent)
            ).rejects.toThrow("Failed to store curriculum content");
        });
    });

    describe("searchSimilarContent", () => {
        it("should return similar content based on search criteria", async () => {
            // Setup
            const mockSearchResponse = {
                body: {
                    hits: {
                        hits: [
                            {
                                _source: sampleContent,
                                _score: 0.8,
                            },
                        ],
                    },
                },
            };
            (mockClient.search as jest.Mock).mockImplementation(() =>
                Promise.resolve(mockSearchResponse)
            );

            // Execute
            const searchTerm = "addition problems";
            const results = await service.searchSimilarContent(searchTerm);

            // Assert
            expect(results).toHaveLength(1);
            expect(results[0]).toEqual({
                content: sampleContent,
                score: 0.8,
            });
            expect(mockClient.search).toHaveBeenCalledWith(
                expect.objectContaining({
                    index: "curriculum",
                    body: expect.any(Object),
                })
            );
        });

        it("should return empty array when no matches found", async () => {
            // Setup
            (mockClient.search as jest.Mock).mockImplementation(() =>
                Promise.resolve({
                    body: {
                        hits: {
                            hits: [],
                        },
                    },
                })
            );

            // Execute
            const results = await service.searchSimilarContent(
                "nonexistent content"
            );

            // Assert
            expect(results).toHaveLength(0);
        });
    });

    describe("deleteCurriculumContent", () => {
        it("should successfully delete curriculum content", async () => {
            // Setup
            (mockClient.delete as jest.Mock).mockImplementation(() =>
                Promise.resolve({
                    body: { result: "deleted" },
                })
            );

            // Execute & Assert
            await expect(
                service.deleteCurriculumContent("curr-001")
            ).resolves.not.toThrow();
            expect(mockClient.delete).toHaveBeenCalledWith({
                index: "curriculum",
                id: "curr-001",
            });
        });

        it("should throw error if deletion fails", async () => {
            // Setup
            (mockClient.delete as jest.Mock).mockImplementation(() =>
                Promise.reject(new Error("Curriculum content not found"))
            );

            // Execute & Assert
            await expect(
                service.deleteCurriculumContent("curr-001")
            ).rejects.toThrow("Curriculum content not found");
        });
    });
});
