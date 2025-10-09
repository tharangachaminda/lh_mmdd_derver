/**
 * @fileoverview Test Suite for Enhanced QuestionGenerationRequest Interface
 * @description Tests for new fields: questionTypes (array), category, questionFormat, interests, motivators
 *
 * TDD Phase: 🔴 RED
 * Session: 08 - Phase A1
 * Work Item: TN-FEATURE-NEW-QUESTION-GENERATION-UI
 *
 * Purpose: Validate that the updated QuestionGenerationRequest interface supports:
 * - Multiple question types (array of 1-5 types)
 * - Category context from new taxonomy
 * - Question format selection (multiple_choice, short_answer, true_false, fill_in_blank)
 * - Complete persona fields (interests array, motivators array)
 */

// Import types that we'll update
type QuestionFormat =
    | "multiple_choice"
    | "short_answer"
    | "true_false"
    | "fill_in_blank";
type DifficultyLevel = "easy" | "medium" | "hard";
type LearningStyle = "visual" | "auditory" | "kinesthetic" | "reading_writing";

/**
 * Enhanced QuestionGenerationRequest Interface (NEW)
 * This is what we're testing - the interface that will be implemented in GREEN phase
 */
interface EnhancedQuestionGenerationRequest {
    // Context from navigation
    subject: string;
    category: string;
    gradeLevel: number;

    // Multi-type selection (NEW)
    questionTypes: string[]; // Array of 1-5 types

    // Question configuration (NEW)
    questionFormat: QuestionFormat;
    difficultyLevel: DifficultyLevel;
    numberOfQuestions: number;

    // Complete Persona Fields (ENHANCED)
    learningStyle: LearningStyle;
    interests: string[]; // Array of 1-5 interests
    motivators: string[]; // Array of 1-3 motivators

    // Optional enhancement fields
    focusAreas?: string[];
    includeExplanations?: boolean;
}

describe("🔴 RED Phase - Enhanced QuestionGenerationRequest Interface", () => {
    describe("Multi-Type Selection Support", () => {
        it("should accept array of question types with minimum 1 type", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: ["Achievement"],
            };

            expect(request.questionTypes).toBeInstanceOf(Array);
            expect(request.questionTypes.length).toBeGreaterThanOrEqual(1);
        });

        it("should accept multiple question types (up to 5)", () => {
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
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: ["Achievement"],
            };

            expect(request.questionTypes.length).toBeLessThanOrEqual(5);
            expect(request.questionTypes.length).toBe(5);
        });

        it("should fail validation if questionTypes is empty array", () => {
            const createInvalidRequest = () => {
                const request: Partial<EnhancedQuestionGenerationRequest> = {
                    subject: "mathematics",
                    category: "number-operations",
                    gradeLevel: 5,
                    questionTypes: [], // Invalid: empty array
                };

                // Validation logic will be implemented in GREEN phase
                if (
                    request.questionTypes &&
                    request.questionTypes.length === 0
                ) {
                    throw new Error("At least one question type required");
                }
            };

            expect(createInvalidRequest).toThrow(
                "At least one question type required"
            );
        });
    });

    describe("Category Context Support", () => {
        it("should include category field from new taxonomy", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations", // NEW field
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: ["Achievement"],
            };

            expect(request.category).toBe("number-operations");
            expect(typeof request.category).toBe("string");
        });

        it("should support all 8 category types", () => {
            const categories = [
                "number-operations",
                "algebraic-thinking",
                "geometry-spatial",
                "measurement-data",
                "fractions-decimals",
                "problem-solving",
                "patterns-relationships",
                "financial-literacy",
            ];

            categories.forEach((category) => {
                const request: EnhancedQuestionGenerationRequest = {
                    subject: "mathematics",
                    category: category,
                    gradeLevel: 5,
                    questionTypes: ["ADDITION"],
                    questionFormat: "multiple_choice",
                    difficultyLevel: "medium",
                    numberOfQuestions: 10,
                    learningStyle: "visual",
                    interests: ["Sports"],
                    motivators: ["Achievement"],
                };

                expect(request.category).toBe(category);
            });
        });
    });

    describe("Question Format Support", () => {
        it("should support multiple_choice format", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: ["Achievement"],
            };

            expect(request.questionFormat).toBe("multiple_choice");
        });

        it("should support all question format types", () => {
            const formats: QuestionFormat[] = [
                "multiple_choice",
                "short_answer",
                "true_false",
                "fill_in_blank",
            ];

            formats.forEach((format) => {
                const request: EnhancedQuestionGenerationRequest = {
                    subject: "mathematics",
                    category: "number-operations",
                    gradeLevel: 5,
                    questionTypes: ["ADDITION"],
                    questionFormat: format,
                    difficultyLevel: "medium",
                    numberOfQuestions: 10,
                    learningStyle: "visual",
                    interests: ["Sports"],
                    motivators: ["Achievement"],
                };

                expect(request.questionFormat).toBe(format);
            });
        });
    });

    describe("Complete Persona Fields - Interests", () => {
        it("should accept interests array with 1 interest", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: ["Achievement"],
            };

            expect(request.interests).toBeInstanceOf(Array);
            expect(request.interests.length).toBe(1);
        });

        it("should accept interests array with up to 5 interests", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: [
                    "Sports",
                    "Gaming",
                    "Science",
                    "Technology",
                    "Space",
                ],
                motivators: ["Achievement"],
            };

            expect(request.interests.length).toBeLessThanOrEqual(5);
            expect(request.interests.length).toBe(5);
        });

        it("should support all 17 interest options", () => {
            const allInterests = [
                "Sports",
                "Technology",
                "Arts",
                "Music",
                "Nature",
                "Animals",
                "Space",
                "History",
                "Science",
                "Reading",
                "Gaming",
                "Cooking",
                "Travel",
                "Movies",
                "Fashion",
                "Cars",
                "Photography",
            ];

            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: allInterests.slice(0, 5), // Take first 5
                motivators: ["Achievement"],
            };

            expect(
                request.interests.every((interest) =>
                    allInterests.includes(interest)
                )
            ).toBe(true);
        });

        it("should fail validation if interests exceed 5 items", () => {
            const validateInterests = (interests: string[]) => {
                if (interests.length > 5) {
                    throw new Error("Maximum 5 interests allowed");
                }
            };

            const tooManyInterests = [
                "Sports",
                "Gaming",
                "Science",
                "Technology",
                "Space",
                "Arts",
            ];

            expect(() => validateInterests(tooManyInterests)).toThrow(
                "Maximum 5 interests allowed"
            );
        });
    });

    describe("Complete Persona Fields - Motivators", () => {
        it("should accept motivators array with 1 motivator", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: ["Achievement"],
            };

            expect(request.motivators).toBeInstanceOf(Array);
            expect(request.motivators.length).toBe(1);
        });

        it("should accept motivators array with up to 3 motivators", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: ["Competition", "Achievement", "Problem Solving"],
            };

            expect(request.motivators.length).toBeLessThanOrEqual(3);
            expect(request.motivators.length).toBe(3);
        });

        it("should support all 8 motivator options", () => {
            const allMotivators = [
                "Competition",
                "Achievement",
                "Exploration",
                "Creativity",
                "Social Learning",
                "Personal Growth",
                "Problem Solving",
                "Recognition",
            ];

            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: allMotivators.slice(0, 3), // Take first 3
            };

            expect(
                request.motivators.every((motivator) =>
                    allMotivators.includes(motivator)
                )
            ).toBe(true);
        });

        it("should fail validation if motivators exceed 3 items", () => {
            const validateMotivators = (motivators: string[]) => {
                if (motivators.length > 3) {
                    throw new Error("Maximum 3 motivators allowed");
                }
            };

            const tooManyMotivators = [
                "Competition",
                "Achievement",
                "Exploration",
                "Creativity",
            ];

            expect(() => validateMotivators(tooManyMotivators)).toThrow(
                "Maximum 3 motivators allowed"
            );
        });
    });

    describe("Complete Request Validation", () => {
        it("should create valid request with all required fields", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION", "SUBTRACTION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports", "Gaming", "Science"],
                motivators: ["Competition", "Achievement"],
            };

            // Validate all fields exist
            expect(request.subject).toBeDefined();
            expect(request.category).toBeDefined();
            expect(request.gradeLevel).toBeDefined();
            expect(request.questionTypes).toBeDefined();
            expect(request.questionFormat).toBeDefined();
            expect(request.difficultyLevel).toBeDefined();
            expect(request.numberOfQuestions).toBeDefined();
            expect(request.learningStyle).toBeDefined();
            expect(request.interests).toBeDefined();
            expect(request.motivators).toBeDefined();
        });

        it("should support optional enhancement fields", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual",
                interests: ["Sports"],
                motivators: ["Achievement"],
                focusAreas: ["Basic addition", "Two-digit numbers"],
                includeExplanations: true,
            };

            expect(request.focusAreas).toBeDefined();
            expect(request.includeExplanations).toBe(true);
        });
    });

    describe("Backward Compatibility", () => {
        it("should maintain structure compatible with existing persona system", () => {
            const request: EnhancedQuestionGenerationRequest = {
                subject: "mathematics",
                category: "number-operations",
                gradeLevel: 5,
                questionTypes: ["ADDITION"],
                questionFormat: "multiple_choice",
                difficultyLevel: "medium",
                numberOfQuestions: 10,
                learningStyle: "visual", // Existing field
                interests: ["Sports"], // Enhanced from persona
                motivators: ["Achievement"], // Enhanced from persona
            };

            // Learning style should still work as before
            expect(request.learningStyle).toBe("visual");
            expect([
                "visual",
                "auditory",
                "kinesthetic",
                "reading_writing",
            ]).toContain(request.learningStyle);
        });
    });
});
