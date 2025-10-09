/**
 * Questions API Enhanced Endpoint Tests
 *
 * Tests for POST /api/questions/generate-enhanced endpoint
 * Validates multi-type question generation with complete persona fields
 *
 * RED Phase - Phase A3
 * Session 08 - TN-FEATURE-NEW-QUESTION-GENERATION-UI
 */

import { Request, Response } from "express";
import { QuestionsController } from "../controllers/questions.controller.js";
import {
    EnhancedQuestionGenerationRequest,
    QuestionFormat,
    DifficultyLevel,
    LearningStyle,
} from "../interfaces/question-generation.interface.js";

/**
 * Test Suite: Enhanced API Endpoint
 * Tests the new POST /api/questions/generate-enhanced endpoint
 */
describe("Questions API - Enhanced Generation Endpoint", () => {
    let controller: QuestionsController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let responseData: any;

    beforeEach(() => {
        controller = new QuestionsController();
        responseData = {};

        // Mock response object
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockImplementation((data) => {
                responseData = data;
                return mockResponse;
            }),
        };
    });

    describe("Enhanced Request Acceptance", () => {
        it("should accept EnhancedQuestionGenerationRequest with multiple types", async () => {
            const enhancedRequest: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION", "SUBTRACTION"],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Sports", "Gaming"],
                motivators: ["Competition", "Achievement"],
            };

            mockRequest = {
                body: enhancedRequest,
                user: {
                    userId: "test-user-123",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseData.success).toBe(true);
            expect(responseData.data).toBeDefined();
        });

        it("should handle single question type in array format", async () => {
            const singleTypeRequest: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "geometry",
                gradeLevel: 6,
                questionTypes: ["AREA_PERIMETER"],
                questionFormat: QuestionFormat.SHORT_ANSWER,
                difficultyLevel: DifficultyLevel.EASY,
                numberOfQuestions: 5,
                learningStyle: LearningStyle.KINESTHETIC,
                interests: ["Sports"],
                motivators: [],
            };

            mockRequest = {
                body: singleTypeRequest,
                user: {
                    userId: "test-user-456",
                    email: "student@example.com",
                    role: "STUDENT" as any,
                    grade: 6,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseData.data.questions).toBeDefined();
        });

        it("should handle maximum 5 question types", async () => {
            const maxTypesRequest: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 7,
                questionTypes: [
                    "ADDITION",
                    "SUBTRACTION",
                    "MULTIPLICATION",
                    "DIVISION",
                    "WORD_PROBLEMS",
                ],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.HARD,
                numberOfQuestions: 25,
                learningStyle: LearningStyle.READING_WRITING,
                interests: [
                    "Science",
                    "Technology",
                    "Space",
                    "Reading",
                    "Gaming",
                ],
                motivators: [
                    "Achievement",
                    "Problem Solving",
                    "Personal Growth",
                ],
            };

            mockRequest = {
                body: maxTypesRequest,
                user: {
                    userId: "test-user-789",
                    email: "advanced@example.com",
                    role: "STUDENT" as any,
                    grade: 7,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseData.data.typeDistribution).toBeDefined();
        });
    });

    describe("Response Structure Validation", () => {
        it("should return response with type distribution metadata", async () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION", "SUBTRACTION"],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Sports", "Gaming"],
                motivators: ["Competition"],
            };

            mockRequest = {
                body: request,
                user: {
                    userId: "user-1",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(responseData.data.typeDistribution).toBeDefined();
            expect(responseData.data.categoryContext).toBe("number-operations");
            expect(responseData.data.personalizationApplied).toBeDefined();
        });

        it("should include all persona fields in response metadata", async () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "science",
                category: "scientific-inquiry",
                gradeLevel: 6,
                questionTypes: ["HYPOTHESIS_TESTING"],
                questionFormat: QuestionFormat.SHORT_ANSWER,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 5,
                learningStyle: LearningStyle.AUDITORY,
                interests: ["Science", "Nature", "Animals"],
                motivators: ["Exploration", "Creativity"],
            };

            mockRequest = {
                body: request,
                user: {
                    userId: "user-2",
                    email: "science@example.com",
                    role: "STUDENT" as any,
                    grade: 6,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            const personalization = responseData.data.personalizationApplied;
            expect(personalization.interests).toEqual([
                "Science",
                "Nature",
                "Animals",
            ]);
            expect(personalization.motivators).toEqual([
                "Exploration",
                "Creativity",
            ]);
            expect(personalization.learningStyle).toBe("auditory");
        });

        it("should return session ID and question count", async () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "algebraic-thinking",
                gradeLevel: 8,
                questionTypes: ["EQUATIONS", "INEQUALITIES"],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.HARD,
                numberOfQuestions: 20,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Technology", "Gaming"],
                motivators: ["Problem Solving", "Achievement"],
            };

            mockRequest = {
                body: request,
                user: {
                    userId: "user-3",
                    email: "math@example.com",
                    role: "STUDENT" as any,
                    grade: 8,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(responseData.data.sessionId).toBeDefined();
            expect(responseData.data.totalQuestions).toBe(20);
            expect(responseData.data.questions).toHaveLength(20);
        });
    });

    describe("All Question Format Support", () => {
        const baseRequest = {
            subject: "mathematics",
            category: "number-operations",
            gradeLevel: 5,
            questionTypes: ["ADDITION"],
            difficultyLevel: DifficultyLevel.MEDIUM,
            numberOfQuestions: 5,
            learningStyle: LearningStyle.VISUAL,
            interests: ["Sports"],
            motivators: ["Achievement"],
        };

        it("should generate multiple choice questions", async () => {
            mockRequest = {
                body: {
                    ...baseRequest,
                    questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                },
                user: {
                    userId: "user-mc",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(responseData.data.questions[0].options).toBeDefined();
            expect(responseData.data.questions[0].options).toHaveLength(4);
        });

        it("should generate short answer questions", async () => {
            mockRequest = {
                body: {
                    ...baseRequest,
                    questionFormat: QuestionFormat.SHORT_ANSWER,
                },
                user: {
                    userId: "user-sa",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            const question = responseData.data.questions[0];
            expect(question.options).toBeUndefined();
            expect(question.correctAnswer).toBeDefined();
        });

        it("should generate true/false questions", async () => {
            mockRequest = {
                body: {
                    ...baseRequest,
                    questionFormat: QuestionFormat.TRUE_FALSE,
                },
                user: {
                    userId: "user-tf",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            const question = responseData.data.questions[0];
            expect(question.options).toHaveLength(2);
            expect(question.options).toContain("True");
            expect(question.options).toContain("False");
        });

        it("should generate fill-in-blank questions", async () => {
            mockRequest = {
                body: {
                    ...baseRequest,
                    questionFormat: QuestionFormat.FILL_IN_BLANK,
                },
                user: {
                    userId: "user-fib",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            const question = responseData.data.questions[0];
            expect(question.questionText).toContain("_____");
        });
    });

    describe("Validation and Error Handling", () => {
        it("should reject request with empty questionTypes array", async () => {
            const invalidRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: [],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Sports"],
                motivators: [],
            };

            mockRequest = {
                body: invalidRequest,
                user: {
                    userId: "user-4",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseData.success).toBe(false);
            expect(responseData.message).toContain("question type");
        });

        it("should reject request with more than 5 question types", async () => {
            const invalidRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: [
                    "TYPE1",
                    "TYPE2",
                    "TYPE3",
                    "TYPE4",
                    "TYPE5",
                    "TYPE6",
                ],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Sports"],
                motivators: [],
            };

            mockRequest = {
                body: invalidRequest,
                user: {
                    userId: "user-5",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseData.success).toBe(false);
            expect(responseData.message).toContain("Maximum 5");
        });

        it("should reject request without category", async () => {
            const invalidRequest = {
                subject: "mathematics",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: [],
            };

            mockRequest = {
                body: invalidRequest,
                user: {
                    userId: "user-6",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseData.success).toBe(false);
            expect(responseData.message).toContain("category");
        });

        it("should reject request with too many interests", async () => {
            const invalidRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.VISUAL,
                interests: [
                    "Interest1",
                    "Interest2",
                    "Interest3",
                    "Interest4",
                    "Interest5",
                    "Interest6",
                ],
                motivators: [],
            };

            mockRequest = {
                body: invalidRequest,
                user: {
                    userId: "user-7",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseData.success).toBe(false);
            expect(responseData.message).toContain("interests");
        });

        it("should reject request with too many motivators", async () => {
            const invalidRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Sports"],
                motivators: ["Mot1", "Mot2", "Mot3", "Mot4"],
            };

            mockRequest = {
                body: invalidRequest,
                user: {
                    userId: "user-8",
                    email: "test@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(responseData.success).toBe(false);
            expect(responseData.message).toContain("motivators");
        });
    });

    describe("Authentication Requirements", () => {
        it("should require authentication for enhanced endpoint", async () => {
            const request = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Sports"],
                motivators: [],
            };

            mockRequest = {
                body: request,
                // No user object (unauthenticated)
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(responseData.success).toBe(false);
        });

        it("should use authenticated user grade if not specified in request", async () => {
            const request = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5, // Will use user's grade: 7
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: [],
            };

            mockRequest = {
                body: request,
                user: {
                    userId: "user-9",
                    email: "grade7@example.com",
                    role: "STUDENT" as any,
                    grade: 7, // User is in grade 7
                },
            } as any;

            await controller.generateQuestionsEnhanced(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            // Should use grade from request (5), not user grade (7)
            expect(responseData.user.grade).toBe(7);
        });
    });

    describe("Backward Compatibility", () => {
        it("should maintain existing /generate endpoint for legacy clients", async () => {
            // Ensure old endpoint still exists and works
            const legacyRequest = {
                subject: "mathematics",
                topic: "Addition",
                difficulty: "medium",
                numQuestions: 5,
            };

            mockRequest = {
                body: legacyRequest,
                user: {
                    userId: "legacy-user",
                    email: "legacy@example.com",
                    role: "STUDENT" as any,
                    grade: 5,
                },
            } as any;

            // Should still work with existing generateQuestions method
            await controller.generateQuestions(
                mockRequest as Request,
                mockResponse as Response
            );

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(responseData.success).toBe(true);
        });
    });
});
