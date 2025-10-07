/**
 * Real Vector Database Integration Tests - RED Phase
 *
 * These tests SHOULD FAIL initially since AIEnhancedQuestionsService currently uses simulation
 */

import {
    AIEnhancedQuestionsService,
    QuestionGenerationRequest,
} from "../services/questions-ai-enhanced.service.js";
import { UserRole } from "../models/user.model.js";
import { LearningStyle } from "../models/persona.model.js";

const mockJWTPayload = {
    userId: "test-user-123",
    email: "test@example.com",
    role: UserRole.STUDENT,
};

const testPersona = {
    grade: 5,
    learningStyle: LearningStyle.VISUAL,
    interests: ["mathematics", "sports"],
    culturalContext: "New Zealand",
} as any;

describe("🔴 RED: Real Vector Database Integration", () => {
    let aiService: AIEnhancedQuestionsService;

    beforeEach(() => {
        aiService = new AIEnhancedQuestionsService();
    });

    it("SHOULD FAIL: should not use simulation delays", async () => {
        const request: QuestionGenerationRequest = {
            subject: "mathematics",
            topic: "Addition",
            difficulty: "beginner",
            questionType: "multiple_choice",
            count: 1,
            persona: testPersona,
        };

        const startTime = Date.now();
        const result = await aiService.generateQuestions(
            request,
            mockJWTPayload
        );
        const actualTime = Date.now() - startTime;

        // SHOULD FAIL: Real implementation should be faster than 200ms
        expect(actualTime).toBeLessThan(200); // WILL FAIL - simulation adds 1600ms delay
    });

    it("SHOULD FAIL: should not log simulation messages", async () => {
        const request: QuestionGenerationRequest = {
            subject: "mathematics",
            topic: "Addition",
            difficulty: "beginner",
            questionType: "multiple_choice",
            count: 1,
            persona: testPersona,
        };

        const consoleSpy = jest.spyOn(console, "log").mockImplementation();

        const result = await aiService.generateQuestions(
            request,
            mockJWTPayload
        );

        const simulationLogs = consoleSpy.mock.calls.filter((call: any) =>
            call[0]?.includes?.("Phase 1: Vector database similarity search")
        );

        // SHOULD FAIL: Real implementation should not log simulation messages
        expect(simulationLogs.length).toBe(0); // WILL FAIL - simulation logs exist

        consoleSpy.mockRestore();
    });

    it("SHOULD FAIL: should use real vector scores not calculated ones", async () => {
        const request: QuestionGenerationRequest = {
            subject: "mathematics",
            topic: "Addition",
            difficulty: "advanced",
            questionType: "multiple_choice",
            count: 1,
            persona: testPersona,
        };

        const result = await aiService.generateQuestions(
            request,
            mockJWTPayload
        );
        const vectorScore = result.qualityMetrics.vectorRelevanceScore;

        // Calculated score follows predictable pattern: 0.75 + (5/12)*0.15 + 0.05 + 0.05 = 0.8625
        const expectedCalculated = 0.8625;
        const tolerance = 0.01;

        // SHOULD FAIL: Real vector scores shouldn't match calculated pattern
        expect(Math.abs(vectorScore - expectedCalculated)).toBeGreaterThan(
            tolerance
        );
    });

    it("SHOULD FAIL: should contain database source metadata", async () => {
        const request: QuestionGenerationRequest = {
            subject: "mathematics",
            topic: "Addition",
            difficulty: "beginner",
            questionType: "multiple_choice",
            count: 1,
            persona: testPersona,
        };

        const result = await aiService.generateQuestions(
            request,
            mockJWTPayload
        );
        const question = result.questions[0];

        // SHOULD FAIL: Real implementation should have database metadata
        expect(question.metadata.tags).toContain("vector-database-sourced"); // WILL FAIL
        expect(question.metadata.tags).not.toContain("simulated"); // WILL FAIL - has simulated tags
    });

    it("SHOULD FAIL: should have vector context in personalization", async () => {
        const request: QuestionGenerationRequest = {
            subject: "mathematics",
            topic: "Addition",
            difficulty: "beginner",
            questionType: "multiple_choice",
            count: 1,
            persona: testPersona,
        };

        const result = await aiService.generateQuestions(
            request,
            mockJWTPayload
        );

        // SHOULD FAIL: Real implementation should reference database usage
        expect(result.personalizationSummary).toContain("vector database"); // WILL FAIL - simulation message
        expect(result.personalizationSummary).not.toContain(
            "using vector database similarity"
        ); // WILL FAIL
    });
});
