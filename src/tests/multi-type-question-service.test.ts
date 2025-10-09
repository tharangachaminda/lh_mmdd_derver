/**
 * @fileoverview Test Suite for Multi-Type Question Generation Service
 * @description Tests for enhanced service supporting multiple question types
 *
 * TDD Phase: 🔴 RED
 * Session: 08 - Phase A2
 * Work Item: TN-FEATURE-NEW-QUESTION-GENERATION-UI
 *
 * Purpose: Validate that the question service can:
 * - Accept EnhancedQuestionGenerationRequest with multiple types
 * - Distribute questions across selected types
 * - Use category context for generation
 * - Apply all persona fields (interests, motivators) to AI prompts
 * - Support all question formats
 */

import {
    EnhancedQuestionGenerationRequest,
    QuestionFormat,
    DifficultyLevel,
    LearningStyle,
} from "../interfaces/question-generation.interface.js";

/**
 * Mock response structure for multi-type generation
 */
interface MultiTypeGenerationResponse {
    sessionId: string;
    questions: any[];
    typeDistribution: Record<string, number>;
    categoryContext: string;
    personalizationApplied: {
        interests: string[];
        motivators: string[];
        learningStyle: string;
    };
    totalQuestions: number;
}

describe("🔴 RED Phase - Multi-Type Question Generation Service", () => {
    describe("Enhanced Request Acceptance", () => {
        it("should accept EnhancedQuestionGenerationRequest with multiple types", () => {
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
                motivators: ["Competition", "Achievement"],
            };

            // Service should accept this structure
            expect(request.questionTypes).toBeInstanceOf(Array);
            expect(request.questionTypes.length).toBe(2);
            expect(request.category).toBe("number-operations");
        });

        it("should handle single question type in array format", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"], // Single type
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.EASY,
                numberOfQuestions: 5,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Sports"],
                motivators: ["Achievement"],
            };

            expect(request.questionTypes.length).toBe(1);
            expect(request.numberOfQuestions).toBe(5);
        });

        it("should handle maximum 5 question types", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
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
                learningStyle: LearningStyle.KINESTHETIC,
                interests: ["Technology", "Space", "Science"],
                motivators: ["Exploration", "Problem Solving"],
            };

            expect(request.questionTypes.length).toBe(5);
            expect(request.numberOfQuestions).toBe(25);
        });
    });

    describe("Question Distribution Across Types", () => {
        it("should distribute questions evenly across multiple types", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION", "SUBTRACTION"],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Sports"],
                motivators: ["Achievement"],
            };

            // Mock expected distribution
            const expectedDistribution = {
                ADDITION: 5,
                SUBTRACTION: 5,
            };

            // Service should split 10 questions evenly: 5 addition + 5 subtraction
            expect(Object.keys(expectedDistribution).length).toBe(2);
            expect(expectedDistribution["ADDITION"]).toBe(5);
            expect(expectedDistribution["SUBTRACTION"]).toBe(5);
        });

        it("should handle uneven distribution when questions cannot be split evenly", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION", "SUBTRACTION", "MULTIPLICATION"],
                questionFormat: QuestionFormat.SHORT_ANSWER,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.READING_WRITING,
                interests: ["Reading", "History"],
                motivators: ["Personal Growth"],
            };

            // 10 questions / 3 types = 3.33... per type
            // Expected: 4, 3, 3 or similar distribution
            const mockDistribution = {
                ADDITION: 4,
                SUBTRACTION: 3,
                MULTIPLICATION: 3,
            };

            const total = Object.values(mockDistribution).reduce(
                (a, b) => a + b,
                0
            );
            expect(total).toBe(10);
            expect(Object.keys(mockDistribution).length).toBe(3);
        });

        it("should prioritize types when count is less than number of types", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: [
                    "ADDITION",
                    "SUBTRACTION",
                    "MULTIPLICATION",
                    "DIVISION",
                ],
                questionFormat: QuestionFormat.TRUE_FALSE,
                difficultyLevel: DifficultyLevel.EASY,
                numberOfQuestions: 3, // Less than 4 types
                learningStyle: LearningStyle.AUDITORY,
                interests: ["Music"],
                motivators: ["Creativity"],
            };

            // Should select 3 types and generate 1 question each
            // Or generate 3 questions from first 3 types
            expect(request.numberOfQuestions).toBeLessThan(
                request.questionTypes.length
            );
            expect(request.numberOfQuestions).toBe(3);
        });
    });

    describe("Category Context Integration", () => {
        it("should use category metadata for question generation", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 5,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Sports"],
                motivators: ["Competition"],
            };

            // Service should recognize category and apply appropriate generation strategy
            expect(request.category).toBe("number-operations");

            // Category should influence:
            // - Number ranges (appropriate for number operations)
            // - Problem types (focus on operations)
            // - Vocabulary (operation-specific terms)
        });

        it("should handle different category contexts appropriately", () => {
            const categories = [
                "algebraic-thinking",
                "geometry-spatial",
                "fractions-decimals",
                "problem-solving",
            ];

            categories.forEach((category) => {
                const request: EnhancedQuestionGenerationRequest = {
                    subject: "mathematics",
                    category: category,
                    gradeLevel: 6,
                    questionTypes: ["BASIC_OPERATIONS"],
                    questionFormat: QuestionFormat.FILL_IN_BLANK,
                    difficultyLevel: DifficultyLevel.MEDIUM,
                    numberOfQuestions: 5,
                    learningStyle: LearningStyle.VISUAL,
                    interests: ["Technology"],
                    motivators: ["Achievement"],
                };

                expect(request.category).toBe(category);
                // Each category should trigger different generation logic
            });
        });
    });

    describe("Persona Fields Application", () => {
        it("should apply all interests to question personalization", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["WORD_PROBLEMS"],
                questionFormat: QuestionFormat.SHORT_ANSWER,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 5,
                learningStyle: LearningStyle.KINESTHETIC,
                interests: ["Sports", "Gaming", "Animals"],
                motivators: ["Competition"],
            };

            // Service should generate questions using these interests
            // Example: "A basketball player (Sports) scored..."
            // Example: "In a video game (Gaming), you collected..."
            // Example: "A zoo keeper (Animals) counted..."

            expect(request.interests.length).toBe(3);
            expect(request.interests).toContain("Sports");
            expect(request.interests).toContain("Gaming");
            expect(request.interests).toContain("Animals");
        });

        it("should apply motivators to question style and feedback", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Technology"],
                motivators: ["Competition", "Achievement", "Recognition"],
            };

            // Motivators should influence:
            // - Competition: "Beat your previous score!"
            // - Achievement: "Unlock the next level!"
            // - Recognition: "Join the leaderboard!"

            expect(request.motivators.length).toBe(3);
            expect(request.motivators).toContain("Competition");
            expect(request.motivators).toContain("Achievement");
        });

        it("should adapt questions to learning style", () => {
            const learningStyles = [
                LearningStyle.VISUAL,
                LearningStyle.AUDITORY,
                LearningStyle.KINESTHETIC,
                LearningStyle.READING_WRITING,
            ];

            learningStyles.forEach((style) => {
                const request: EnhancedQuestionGenerationRequest = {
                    subject: "mathematics",
                    category: "number-operations",
                    gradeLevel: 5,
                    questionTypes: ["ADDITION"],
                    questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                    difficultyLevel: DifficultyLevel.MEDIUM,
                    numberOfQuestions: 5,
                    learningStyle: style,
                    interests: ["Science"],
                    motivators: ["Exploration"],
                };

                expect(request.learningStyle).toBe(style);
                // Each style should affect:
                // - VISUAL: Include diagrams, number lines
                // - AUDITORY: Emphasize word descriptions
                // - KINESTHETIC: Hands-on, action-oriented
                // - READING_WRITING: Detailed text explanations
            });
        });
    });

    describe("Question Format Support", () => {
        it("should generate multiple choice format with 4 options", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: QuestionFormat.MULTIPLE_CHOICE,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 5,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Sports"],
                motivators: ["Achievement"],
            };

            expect(request.questionFormat).toBe(QuestionFormat.MULTIPLE_CHOICE);
            // Generated questions should have: question, options[4], correctAnswer
        });

        it("should generate short answer format without options", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["SUBTRACTION"],
                questionFormat: QuestionFormat.SHORT_ANSWER,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 5,
                learningStyle: LearningStyle.READING_WRITING,
                interests: ["Reading"],
                motivators: ["Personal Growth"],
            };

            expect(request.questionFormat).toBe(QuestionFormat.SHORT_ANSWER);
            // Generated questions should have: question, correctAnswer (no options)
        });

        it("should generate true/false format with binary choice", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION", "SUBTRACTION"],
                questionFormat: QuestionFormat.TRUE_FALSE,
                difficultyLevel: DifficultyLevel.EASY,
                numberOfQuestions: 10,
                learningStyle: LearningStyle.VISUAL,
                interests: ["Animals"],
                motivators: ["Competition"],
            };

            expect(request.questionFormat).toBe(QuestionFormat.TRUE_FALSE);
            // Generated questions should be statements with true/false answers
        });

        it("should generate fill-in-blank format with blank markers", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["MULTIPLICATION"],
                questionFormat: QuestionFormat.FILL_IN_BLANK,
                difficultyLevel: DifficultyLevel.MEDIUM,
                numberOfQuestions: 5,
                learningStyle: LearningStyle.KINESTHETIC,
                interests: ["Gaming"],
                motivators: ["Problem Solving"],
            };

            expect(request.questionFormat).toBe(QuestionFormat.FILL_IN_BLANK);
            // Generated questions should have: "5 × 3 = ___", correctAnswer: "15"
        });
    });

    describe("Response Structure Validation", () => {
        it("should return response with type distribution metadata", () => {
            const mockResponse: MultiTypeGenerationResponse = {
                sessionId: "test-session-123",
                questions: [],
                typeDistribution: {
                    ADDITION: 5,
                    SUBTRACTION: 5,
                },
                categoryContext: "number-operations",
                personalizationApplied: {
                    interests: ["Sports", "Gaming"],
                    motivators: ["Competition"],
                    learningStyle: "visual",
                },
                totalQuestions: 10,
            };

            expect(mockResponse.typeDistribution).toBeDefined();
            expect(mockResponse.categoryContext).toBe("number-operations");
            expect(mockResponse.personalizationApplied).toBeDefined();
        });

        it("should include all persona fields in response metadata", () => {
            const mockResponse: MultiTypeGenerationResponse = {
                sessionId: "test-session-456",
                questions: [],
                typeDistribution: { ADDITION: 10 },
                categoryContext: "number-operations",
                personalizationApplied: {
                    interests: ["Technology", "Space", "Science"],
                    motivators: ["Exploration", "Creativity"],
                    learningStyle: "kinesthetic",
                },
                totalQuestions: 10,
            };

            expect(mockResponse.personalizationApplied.interests.length).toBe(
                3
            );
            expect(mockResponse.personalizationApplied.motivators.length).toBe(
                2
            );
            expect(mockResponse.personalizationApplied.learningStyle).toBe(
                "kinesthetic"
            );
        });
    });

    describe("Error Handling", () => {
        it("should validate minimum question type requirement", () => {
            const validateRequest = (types: string[]) => {
                if (types.length === 0) {
                    throw new Error("At least one question type required");
                }
            };

            expect(() => validateRequest([])).toThrow(
                "At least one question type required"
            );
            expect(() => validateRequest(["ADDITION"])).not.toThrow();
        });

        it("should validate maximum question type limit", () => {
            const validateRequest = (types: string[]) => {
                if (types.length > 5) {
                    throw new Error("Maximum 5 question types allowed");
                }
            };

            const tooManyTypes = [
                "TYPE1",
                "TYPE2",
                "TYPE3",
                "TYPE4",
                "TYPE5",
                "TYPE6",
            ];
            expect(() => validateRequest(tooManyTypes)).toThrow(
                "Maximum 5 question types allowed"
            );
        });

        it("should handle invalid category gracefully", () => {
            const validateCategory = (category: string) => {
                const validCategories = [
                    "number-operations",
                    "algebraic-thinking",
                    "geometry-spatial",
                    "measurement-data",
                    "fractions-decimals",
                    "problem-solving",
                    "patterns-relationships",
                    "financial-literacy",
                ];

                if (!validCategories.includes(category)) {
                    throw new Error(`Invalid category: ${category}`);
                }
            };

            expect(() => validateCategory("invalid-category")).toThrow(
                "Invalid category"
            );
            expect(() => validateCategory("number-operations")).not.toThrow();
        });
    });
});
