/**
 * Service Integration Tests
 *
 * Tests integration between new subject-agnostic EducationalContentController
 * and existing mathematics services (AgenticQuestionService, QuestionGenerationService)
 *
 * @fileoverview RED Phase - These tests SHOULD FAIL initially
 * @version 1.0.0
 */

import { Request, Response } from "express";
import { EducationalContentController } from "../controllers/educational-content.controller";

// Local type definitions for testing (will be replaced by @learning-hub/shared)
enum Subject {
    MATHEMATICS = "mathematics",
    SCIENCE = "science",
    ENGLISH = "english",
    SOCIAL_STUDIES = "social_studies",
}

enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
}

enum QuestionFormat {
    MULTIPLE_CHOICE = "multiple_choice",
    CALCULATION = "calculation",
    WORD_PROBLEM = "word_problem",
}

// Mock the existing services that we'll integrate with
jest.mock("../../../../src/services/agentic-question.service.ts", () => ({
    AgenticQuestionService: jest.fn().mockImplementation(() => ({
        generateQuestions: jest.fn(),
        generateSingleQuestion: jest.fn(),
    })),
}));

jest.mock("../../../../src/services/questionGeneration.service.ts", () => ({
    QuestionGenerationService: jest.fn().mockImplementation(() => ({
        generateQuestion: jest.fn(),
        validateAnswer: jest.fn(),
    })),
}));

jest.mock("../../../../src/services/simplified-question.service.ts", () => ({
    SimplifiedQuestionService: jest.fn().mockImplementation(() => ({
        generateQuestionStructured: jest.fn(),
    })),
}));

describe("EducationalContentController - Service Integration", () => {
    let controller: EducationalContentController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let jsonSpy: jest.SpyInstance;
    let statusSpy: jest.SpyInstance;

    beforeEach(() => {
        controller = new EducationalContentController();

        jsonSpy = jest.fn();
        statusSpy = jest.fn().mockReturnValue({ json: jsonSpy });

        mockResponse = {
            json: jsonSpy,
            status: statusSpy,
        } as any as Response;

        jest.clearAllMocks();
    });

    describe("Mathematics Service Integration", () => {
        describe("generateContent - Mathematics Subject", () => {
            it("should integrate with AgenticQuestionService for mathematics content generation", async () => {
                // FAILING TEST: AgenticQuestionService not yet integrated
                mockRequest = {
                    body: {
                        subject: Subject.MATHEMATICS,
                        grade: 5,
                        topic: "addition",
                        difficulty: DifficultyLevel.EASY,
                        format: QuestionFormat.CALCULATION,
                        count: 1,
                    },
                };

                await controller.generateContent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                // Should integrate with AgenticQuestionService and return real mathematics questions
                expect(statusSpy).toHaveBeenCalledWith(200);
                expect(jsonSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        data: expect.objectContaining({
                            id: expect.stringMatching(/^math_/),
                            subject: Subject.MATHEMATICS,
                            grade: 5,
                            question: expect.stringContaining("addition"), // Should be real question from service
                            answer: expect.any(String),
                            difficulty: DifficultyLevel.EASY,
                            subjectSpecific: expect.objectContaining({
                                mathematicsData: expect.any(Object),
                            }),
                        }),
                        metadata: expect.objectContaining({
                            generationTime: expect.any(Number),
                            qualityScore: expect.any(Number),
                            curriculumAlignment: expect.any(Boolean),
                            vectorContext: expect.any(Object), // From AgenticQuestionService
                        }),
                    })
                );
            });

            it("should generate multiple mathematics questions using AgenticQuestionService", async () => {
                // FAILING TEST: Multiple question generation not implemented
                mockRequest = {
                    body: {
                        subject: Subject.MATHEMATICS,
                        grade: 3,
                        topic: "multiplication",
                        difficulty: DifficultyLevel.MEDIUM,
                        format: QuestionFormat.WORD_PROBLEM,
                        count: 3,
                    },
                };

                await controller.generateContent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(statusSpy).toHaveBeenCalledWith(200);
                expect(jsonSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        data: expect.arrayContaining([
                            expect.objectContaining({
                                subject: Subject.MATHEMATICS,
                                topic: "multiplication",
                                difficulty: DifficultyLevel.MEDIUM,
                            }),
                        ]),
                    })
                );

                const responseData = jsonSpy.mock.calls[0][0].data;
                expect(Array.isArray(responseData)).toBe(true);
                expect(responseData).toHaveLength(3);
            });

            it("should fallback to QuestionGenerationService when AgenticQuestionService fails", async () => {
                // FAILING TEST: Fallback mechanism not implemented
                mockRequest = {
                    body: {
                        subject: Subject.MATHEMATICS,
                        grade: 4,
                        topic: "division",
                        difficulty: DifficultyLevel.HARD,
                        format: QuestionFormat.CALCULATION,
                    },
                };

                // Mock AgenticQuestionService to fail
                // This will test our fallback to QuestionGenerationService

                await controller.generateContent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(statusSpy).toHaveBeenCalledWith(200);
                expect(jsonSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: true,
                        data: expect.objectContaining({
                            subject: Subject.MATHEMATICS,
                            topic: "division",
                        }),
                        metadata: expect.objectContaining({
                            fallbackUsed: true,
                            primaryServiceError: expect.any(String),
                        }),
                    })
                );
            });

            it("should map legacy question types to new educational question format", async () => {
                // FAILING TEST: Type mapping not implemented
                mockRequest = {
                    body: {
                        subject: Subject.MATHEMATICS,
                        grade: 6,
                        topic: "fractions",
                        difficulty: DifficultyLevel.MEDIUM,
                        format: QuestionFormat.MULTIPLE_CHOICE,
                    },
                };

                await controller.generateContent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                const responseData = jsonSpy.mock.calls[0][0].data;

                // Should properly map from old Question interface to new EducationalQuestion
                expect(responseData).toMatchObject({
                    id: expect.any(String),
                    subject: Subject.MATHEMATICS,
                    grade: 6,
                    title: expect.any(String),
                    question: expect.any(String),
                    answer: expect.any(String),
                    explanation: expect.any(String),
                    difficulty: DifficultyLevel.MEDIUM,
                    format: QuestionFormat.MULTIPLE_CHOICE,
                    topic: "fractions",
                    framework: "new_zealand",
                    createdAt: expect.any(Date),
                    updatedAt: expect.any(Date),
                    metadata: expect.objectContaining({
                        version: expect.any(String),
                        author: expect.any(String),
                        tags: expect.any(Array),
                        keywords: expect.any(Array),
                        learningObjectives: expect.any(Array),
                    }),
                    subjectSpecific: expect.objectContaining({
                        mathematicsData: expect.objectContaining({
                            mathType: expect.any(String),
                            formula: expect.any(String),
                        }),
                    }),
                });
            });
        });

        describe("Legacy Endpoint Compatibility", () => {
            it("should maintain backward compatibility with generateMathQuestion endpoint", async () => {
                // FAILING TEST: Legacy endpoint doesn't use real services yet
                mockRequest = {
                    body: {
                        grade: 5,
                        type: "addition",
                        difficulty: "easy",
                        count: 1,
                        context: "classroom",
                    },
                };

                await controller.generateMathQuestion(
                    mockRequest as Request,
                    mockResponse as Response
                );

                // Should return in old format but use new service integration
                expect(statusSpy).toHaveBeenCalledWith(200);

                const responseData = jsonSpy.mock.calls[0][0];

                // Legacy format should contain real question from integrated services
                expect(responseData).toMatchObject({
                    id: expect.stringMatching(/^math_/),
                    subject: Subject.MATHEMATICS,
                    grade: 5,
                    question: expect.stringContaining("addition"),
                    answer: expect.any(String),
                    difficulty: DifficultyLevel.EASY,
                });
            });

            it("should handle legacy request format variations", async () => {
                // FAILING TEST: Complex legacy format handling not implemented
                mockRequest = {
                    body: {
                        grade: "3", // String grade
                        type: "subtraction",
                        difficulty: "medium",
                        // Missing count - should default to 1
                        context: "real-world problem",
                    },
                };

                await controller.generateMathQuestion(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(statusSpy).toHaveBeenCalledWith(200);
                expect(jsonSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        grade: 3, // Should be converted to number
                        topic: "subtraction",
                        difficulty: DifficultyLevel.MEDIUM,
                    })
                );
            });
        });

        describe("Error Handling and Resilience", () => {
            it("should handle service initialization failures gracefully", async () => {
                // FAILING TEST: Service initialization error handling not implemented
                mockRequest = {
                    body: {
                        subject: Subject.MATHEMATICS,
                        grade: 5,
                        topic: "algebra",
                        difficulty: DifficultyLevel.HARD,
                    },
                };

                // Mock service initialization failure
                // Should gracefully handle and provide meaningful error

                await controller.generateContent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(statusSpy).toHaveBeenCalledWith(500);
                expect(jsonSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: false,
                        error: expect.stringContaining(
                            "service initialization"
                        ),
                        metadata: expect.objectContaining({
                            fallbackAttempted: true,
                            serviceErrors: expect.any(Array),
                        }),
                    })
                );
            });

            it("should handle invalid mathematics question types gracefully", async () => {
                // FAILING TEST: Invalid type handling not implemented
                mockRequest = {
                    body: {
                        subject: Subject.MATHEMATICS,
                        grade: 2,
                        topic: "calculus", // Invalid for grade 2
                        difficulty: DifficultyLevel.EASY,
                    },
                };

                await controller.generateContent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                expect(statusSpy).toHaveBeenCalledWith(400);
                expect(jsonSpy).toHaveBeenCalledWith(
                    expect.objectContaining({
                        success: false,
                        error: expect.stringContaining(
                            "invalid topic for grade"
                        ),
                    })
                );
            });
        });

        describe("Service Performance and Quality Metrics", () => {
            it("should include comprehensive metadata from AgenticQuestionService", async () => {
                // FAILING TEST: Rich metadata not passed through yet
                mockRequest = {
                    body: {
                        subject: Subject.MATHEMATICS,
                        grade: 7,
                        topic: "geometry",
                        difficulty: DifficultyLevel.MEDIUM,
                    },
                };

                await controller.generateContent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                const response = jsonSpy.mock.calls[0][0];

                expect(response.metadata).toMatchObject({
                    generationTime: expect.any(Number),
                    qualityScore: expect.any(Number),
                    curriculumAlignment: expect.any(Boolean),
                    vectorContext: expect.objectContaining({
                        used: expect.any(Boolean),
                        similarQuestionsFound: expect.any(Number),
                        curriculumAlignment: expect.any(Boolean),
                    }),
                    workflow: expect.objectContaining({
                        totalTime: expect.any(Number),
                        errors: expect.any(Array),
                        warnings: expect.any(Array),
                        agentPerformance: expect.any(Object),
                    }),
                    qualityChecks: expect.objectContaining({
                        mathematicalAccuracy: expect.any(Boolean),
                        ageAppropriateness: expect.any(Boolean),
                        pedagogicalSoundness: expect.any(Boolean),
                        diversityScore: expect.any(Number),
                    }),
                });
            });

            it("should track service selection and performance", async () => {
                // FAILING TEST: Service tracking not implemented
                mockRequest = {
                    body: {
                        subject: Subject.MATHEMATICS,
                        grade: 8,
                        topic: "algebra",
                        difficulty: DifficultyLevel.HARD,
                        count: 2,
                    },
                };

                await controller.generateContent(
                    mockRequest as Request,
                    mockResponse as Response
                );

                const response = jsonSpy.mock.calls[0][0];

                expect(response.metadata).toMatchObject({
                    serviceUsed: expect.stringMatching(
                        /^(AgenticQuestionService|QuestionGenerationService)$/
                    ),
                    serviceSelection: expect.objectContaining({
                        primary: "AgenticQuestionService",
                        fallbackAvailable: true,
                        selectionReason: expect.any(String),
                    }),
                    performance: expect.objectContaining({
                        totalTime: expect.any(Number),
                        questionsPerSecond: expect.any(Number),
                        memoryUsage: expect.any(Number),
                    }),
                });
            });
        });
    });

    describe("Cross-Service Integration", () => {
        it("should maintain consistency between new API and existing question controller", async () => {
            // FAILING TEST: Cross-service consistency not verified
            const newApiRequest = {
                body: {
                    subject: Subject.MATHEMATICS,
                    grade: 5,
                    topic: "addition",
                    difficulty: DifficultyLevel.EASY,
                },
            };

            await controller.generateContent(
                newApiRequest as Request,
                mockResponse as Response
            );
            const newApiResponse = jsonSpy.mock.calls[0][0];

            // Reset mocks for second call
            jest.clearAllMocks();

            // Call legacy endpoint with equivalent parameters
            const legacyRequest = {
                body: {
                    grade: 5,
                    type: "addition",
                    difficulty: "easy",
                },
            };

            await controller.generateMathQuestion(
                legacyRequest as Request,
                mockResponse as Response
            );
            const legacyResponse = jsonSpy.mock.calls[0][0];

            // Both should produce mathematically equivalent results
            expect(newApiResponse.data.subject).toBe(Subject.MATHEMATICS);
            expect(legacyResponse.subject).toBe(Subject.MATHEMATICS);
            expect(newApiResponse.data.grade).toBe(legacyResponse.grade);
            expect(newApiResponse.data.topic).toBe(
                legacyResponse.topic || "addition"
            );
        });
    });
});
