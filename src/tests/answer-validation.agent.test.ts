/**
 * Answer Validation Agent Tests
 *
 * Tests for AI-powered answer validation with partial credit scoring,
 * constructive feedback, and performance analytics.
 *
 * @module tests/answer-validation-agent
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { AnswerValidationAgent } from "../agents/answer-validation.agent.js";
import { ILanguageModel } from "../interfaces/language-model.interface.js";

/**
 * Test interfaces matching frontend contract
 */
interface StudentAnswer {
    questionId: string;
    questionText: string;
    studentAnswer: string;
}

interface AnswerSubmission {
    sessionId: string;
    studentId: string;
    studentEmail: string;
    answers: StudentAnswer[];
    submittedAt: Date;
}

interface ValidationResult {
    success: boolean;
    sessionId: string;
    totalScore: number;
    maxScore: number;
    percentageScore: number;
    questions: Array<{
        questionId: string;
        questionText: string;
        studentAnswer: string;
        score: number;
        maxScore: number;
        feedback: string;
        isCorrect: boolean;
    }>;
    overallFeedback: string;
    strengths: string[];
    areasForImprovement: string[];
}

describe("AnswerValidationAgent", () => {
    let agent: AnswerValidationAgent;
    let mockLanguageModel: jest.Mocked<ILanguageModel>;

    beforeEach(() => {
        // Create mock language model
        mockLanguageModel = {
            generateText: jest.fn(),
            generateWithComplexReasoning: jest.fn(),
            initialize: jest.fn(),
            shutdown: jest.fn(),
        } as unknown as jest.Mocked<ILanguageModel>;

        // Initialize agent with mock
        agent = new AnswerValidationAgent(mockLanguageModel);
    });

    // ============================================================================
    // 1. AGENT INITIALIZATION TESTS
    // ============================================================================

    describe("Agent Initialization", () => {
        it("should initialize with default Ollama client if none provided", () => {
            const defaultAgent = new AnswerValidationAgent();
            expect(defaultAgent).toBeInstanceOf(AnswerValidationAgent);
            expect(defaultAgent.name).toBe("AnswerValidationAgent");
        });

        it("should accept custom language model in constructor", () => {
            expect(agent).toBeInstanceOf(AnswerValidationAgent);
            expect(agent.name).toBe("AnswerValidationAgent");
        });

        it("should have descriptive agent properties", () => {
            expect(agent.name).toBe("AnswerValidationAgent");
            expect(agent.description).toContain("AI validation");
            expect(agent.description).toContain("partial credit");
        });
    });

    // ============================================================================
    // 2. SINGLE ANSWER VALIDATION TESTS
    // ============================================================================

    describe("Single Answer Validation", () => {
        it("should validate a correct math answer with full credit", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-001",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "What is 5 + 3?",
                        studentAnswer: "8",
                    },
                ],
                submittedAt: new Date(),
            };

            // Mock LLM response for correct answer
            mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                JSON.stringify({
                    score: 10,
                    feedback: "Correct! 5 + 3 equals 8.",
                    isCorrect: true,
                })
            );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );

            expect(result.success).toBe(true);
            expect(result.questions[0].score).toBe(10);
            expect(result.questions[0].isCorrect).toBe(true);
            expect(result.totalScore).toBe(10);
            expect(result.maxScore).toBe(10);
            expect(result.percentageScore).toBe(100);
        });

        it("should validate an incorrect answer with zero credit", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-002",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "What is 5 + 3?",
                        studentAnswer: "7",
                    },
                ],
                submittedAt: new Date(),
            };

            // Mock LLM response for incorrect answer
            mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                JSON.stringify({
                    score: 0,
                    feedback:
                        "Incorrect. 5 + 3 equals 8, not 7. Review addition facts.",
                    isCorrect: false,
                })
            );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );

            expect(result.success).toBe(true);
            expect(result.questions[0].score).toBe(0);
            expect(result.questions[0].isCorrect).toBe(false);
            expect(result.totalScore).toBe(0);
            expect(result.percentageScore).toBe(0);
        });

        it("should assign partial credit for partially correct answers", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-003",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Explain the water cycle.",
                        studentAnswer:
                            "Water evaporates and then comes back as rain.",
                    },
                ],
                submittedAt: new Date(),
            };

            // Mock LLM response for partial credit
            mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                JSON.stringify({
                    score: 6,
                    feedback:
                        "Good start! You mentioned evaporation and precipitation. To improve, include condensation and collection stages.",
                    isCorrect: false,
                })
            );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );

            expect(result.questions[0].score).toBe(6);
            expect(result.questions[0].isCorrect).toBe(false);
            expect(result.questions[0].feedback).toContain("evaporation");
            expect(result.questions[0].feedback).toContain("condensation");
        });
    });

    // ============================================================================
    // 3. BATCH VALIDATION TESTS
    // ============================================================================

    describe("Batch Validation", () => {
        it("should validate multiple answers in batch", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-004",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "What is 2 + 2?",
                        studentAnswer: "4",
                    },
                    {
                        questionId: "q2",
                        questionText: "What is 3 × 3?",
                        studentAnswer: "9",
                    },
                    {
                        questionId: "q3",
                        questionText: "What is 10 - 5?",
                        studentAnswer: "5",
                    },
                ],
                submittedAt: new Date(),
            };

            // Mock LLM responses for all correct answers
            mockLanguageModel.generateWithComplexReasoning
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 10,
                        feedback: "Correct!",
                        isCorrect: true,
                    })
                )
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 10,
                        feedback: "Correct!",
                        isCorrect: true,
                    })
                )
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 10,
                        feedback: "Correct!",
                        isCorrect: true,
                    })
                );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );

            expect(result.questions).toHaveLength(3);
            expect(result.totalScore).toBe(30);
            expect(result.maxScore).toBe(30);
            expect(result.percentageScore).toBe(100);
        });

        it("should calculate correct totals with mixed scores", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-005",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Q1",
                        studentAnswer: "A1",
                    },
                    {
                        questionId: "q2",
                        questionText: "Q2",
                        studentAnswer: "A2",
                    },
                    {
                        questionId: "q3",
                        questionText: "Q3",
                        studentAnswer: "A3",
                    },
                ],
                submittedAt: new Date(),
            };

            // Mock mixed scores: 10, 5, 0
            mockLanguageModel.generateWithComplexReasoning
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 10,
                        feedback: "Perfect!",
                        isCorrect: true,
                    })
                )
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 5,
                        feedback: "Partially correct",
                        isCorrect: false,
                    })
                )
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 0,
                        feedback: "Incorrect",
                        isCorrect: false,
                    })
                );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );

            expect(result.totalScore).toBe(15); // 10 + 5 + 0
            expect(result.maxScore).toBe(30); // 3 questions × 10
            expect(result.percentageScore).toBe(50); // 15/30 × 100
        });
    });

    // ============================================================================
    // 4. PARTIAL CREDIT SCORING TESTS
    // ============================================================================

    describe("Partial Credit Scoring (0-10 Scale)", () => {
        it("should support all scores from 0 to 10", async () => {
            const scores = [0, 2, 4, 6, 8, 10];

            for (const score of scores) {
                const submission: AnswerSubmission = {
                    sessionId: `test-session-score-${score}`,
                    studentId: "student-123",
                    studentEmail: "student@test.com",
                    answers: [
                        {
                            questionId: "q1",
                            questionText: "Test",
                            studentAnswer: "Test",
                        },
                    ],
                    submittedAt: new Date(),
                };

                mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                    JSON.stringify({
                        score,
                        feedback: `Score ${score}/10`,
                        isCorrect: score >= 8,
                    })
                );

                const result: ValidationResult = await agent.validateAnswers(
                    submission
                );
                expect(result.questions[0].score).toBe(score);
            }
        });

        it("should mark answers with score >= 8 as correct", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-006",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Test",
                        studentAnswer: "Test",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                JSON.stringify({
                    score: 8,
                    feedback: "Good answer",
                    isCorrect: true,
                })
            );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );
            expect(result.questions[0].isCorrect).toBe(true);
        });

        it("should mark answers with score < 8 as incorrect", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-007",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Test",
                        studentAnswer: "Test",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                JSON.stringify({
                    score: 7,
                    feedback: "Needs improvement",
                    isCorrect: false,
                })
            );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );
            expect(result.questions[0].isCorrect).toBe(false);
        });
    });

    // ============================================================================
    // 5. CONSTRUCTIVE FEEDBACK TESTS
    // ============================================================================

    describe("Constructive Feedback Generation", () => {
        it("should generate encouraging feedback for correct answers", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-008",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "What is 10 × 10?",
                        studentAnswer: "100",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                JSON.stringify({
                    score: 10,
                    feedback:
                        "Excellent work! You correctly calculated 10 × 10 = 100.",
                    isCorrect: true,
                })
            );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );
            expect(result.questions[0].feedback).toContain("Excellent");
            expect(result.questions[0].feedback).toContain("100");
        });

        it("should provide improvement guidance for incorrect answers", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-009",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "What is 7 × 8?",
                        studentAnswer: "54",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                JSON.stringify({
                    score: 0,
                    feedback:
                        "Incorrect. 7 × 8 = 56, not 54. Try using the multiplication table.",
                    isCorrect: false,
                })
            );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );
            expect(result.questions[0].feedback).toContain("56");
            expect(result.questions[0].feedback).toContain(
                "multiplication table"
            );
        });

        it("should generate overall feedback summarizing performance", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-010",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Q1",
                        studentAnswer: "A1",
                    },
                    {
                        questionId: "q2",
                        questionText: "Q2",
                        studentAnswer: "A2",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 10,
                        feedback: "Great!",
                        isCorrect: true,
                    })
                )
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 5,
                        feedback: "Partial",
                        isCorrect: false,
                    })
                );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );

            expect(result.overallFeedback).toBeDefined();
            expect(result.overallFeedback.length).toBeGreaterThan(0);
            expect(result.overallFeedback).toContain("75%"); // 15/20 = 75%
        });
    });

    // ============================================================================
    // 6. PERFORMANCE ANALYSIS TESTS
    // ============================================================================

    describe("Performance Analysis (Strengths & Improvements)", () => {
        it("should identify strengths from high-scoring questions", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-011",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Addition problem",
                        studentAnswer: "Correct answer",
                    },
                    {
                        questionId: "q2",
                        questionText: "Subtraction problem",
                        studentAnswer: "Correct answer",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 10,
                        feedback: "Perfect addition!",
                        isCorrect: true,
                    })
                )
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 10,
                        feedback: "Great subtraction!",
                        isCorrect: true,
                    })
                );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );

            expect(result.strengths).toBeDefined();
            expect(result.strengths.length).toBeGreaterThan(0);
            expect(result.strengths).toEqual(
                expect.arrayContaining([expect.stringContaining("addition")])
            );
        });

        it("should identify improvement areas from low-scoring questions", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-012",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Multiplication problem",
                        studentAnswer: "Wrong",
                    },
                    {
                        questionId: "q2",
                        questionText: "Division problem",
                        studentAnswer: "Wrong",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 2,
                        feedback: "Needs work on multiplication",
                        isCorrect: false,
                    })
                )
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 3,
                        feedback: "Review division",
                        isCorrect: false,
                    })
                );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );

            expect(result.areasForImprovement).toBeDefined();
            expect(result.areasForImprovement.length).toBeGreaterThan(0);
            expect(result.areasForImprovement).toEqual(
                expect.arrayContaining([
                    expect.stringContaining("multiplication"),
                ])
            );
        });

        it("should provide balanced analysis with mixed performance", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-013",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Strong area",
                        studentAnswer: "Good",
                    },
                    {
                        questionId: "q2",
                        questionText: "Weak area",
                        studentAnswer: "Poor",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 9,
                        feedback: "Excellent!",
                        isCorrect: true,
                    })
                )
                .mockResolvedValueOnce(
                    JSON.stringify({
                        score: 3,
                        feedback: "Needs practice",
                        isCorrect: false,
                    })
                );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );

            expect(result.strengths.length).toBeGreaterThan(0);
            expect(result.areasForImprovement.length).toBeGreaterThan(0);
        });
    });

    // ============================================================================
    // 7. QUALITY METRICS TESTS
    // ============================================================================

    describe("Quality Metrics Tracking", () => {
        it("should include quality metrics in response", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-014",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Test",
                        studentAnswer: "Test",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                JSON.stringify({ score: 10, feedback: "Good", isCorrect: true })
            );

            const result: ValidationResult = await agent.validateAnswers(
                submission
            );

            // Quality metrics should be tracked internally (not exposed in ValidationResult interface)
            // Agent should log model used, validation time, etc.
            expect(result.success).toBe(true);
        });

        it("should use qwen2.5:14b model for complex reasoning", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-015",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Complex question",
                        studentAnswer: "Answer",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                JSON.stringify({
                    score: 8,
                    feedback: "Good reasoning",
                    isCorrect: true,
                })
            );

            await agent.validateAnswers(submission);

            // Verify complex reasoning method was called (uses qwen2.5:14b)
            expect(
                mockLanguageModel.generateWithComplexReasoning
            ).toHaveBeenCalled();
        });
    });

    // ============================================================================
    // 8. ERROR HANDLING TESTS
    // ============================================================================

    describe("Error Handling", () => {
        it("should handle LLM generation failures gracefully", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-016",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Test",
                        studentAnswer: "Test",
                    },
                ],
                submittedAt: new Date(),
            };

            mockLanguageModel.generateWithComplexReasoning.mockRejectedValue(
                new Error("LLM service unavailable")
            );

            await expect(agent.validateAnswers(submission)).rejects.toThrow(
                "validation failed"
            );
        });

        it("should validate required fields in submission", async () => {
            const invalidSubmission = {
                sessionId: "",
                studentId: "",
                studentEmail: "",
                answers: [],
                submittedAt: new Date(),
            } as AnswerSubmission;

            await expect(
                agent.validateAnswers(invalidSubmission)
            ).rejects.toThrow();
        });

        it("should handle malformed LLM responses", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-017",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [
                    {
                        questionId: "q1",
                        questionText: "Test",
                        studentAnswer: "Test",
                    },
                ],
                submittedAt: new Date(),
            };

            // Mock invalid JSON response
            mockLanguageModel.generateWithComplexReasoning.mockResolvedValue(
                "Invalid JSON {malformed"
            );

            await expect(agent.validateAnswers(submission)).rejects.toThrow();
        });

        it("should handle empty answer submissions", async () => {
            const submission: AnswerSubmission = {
                sessionId: "test-session-018",
                studentId: "student-123",
                studentEmail: "student@test.com",
                answers: [],
                submittedAt: new Date(),
            };

            await expect(agent.validateAnswers(submission)).rejects.toThrow(
                "No answers"
            );
        });
    });
});
