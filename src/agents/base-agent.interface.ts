import { DifficultyLevel, QuestionType } from "../models/question.js";

/**
 * Base interface for all educational agents in the question generation workflow
 *
 * @interface IEducationalAgent
 */
export interface IEducationalAgent {
    /**
     * Process agent-specific logic with context
     *
     * @param context - Current workflow context
     * @returns Updated context with agent's contributions
     */
    process(context: AgentContext): Promise<AgentContext>;

    /**
     * Agent identification
     */
    readonly name: string;
    readonly description: string;
}

/**
 * Context passed between agents in the workflow
 *
 * @interface AgentContext
 */
export interface AgentContext {
    // Input parameters
    questionType: QuestionType;
    difficulty: DifficultyLevel;
    grade: number;
    count: number;

    // Curriculum analysis results
    curriculumContext?: {
        learningObjectives: string[];
        prerequisiteSkills: string[];
        similarQuestions: Array<{
            question: string;
            explanation?: string;
            type: QuestionType;
            score: number;
        }>;
    };

    // Difficulty calibration results
    difficultySettings?: {
        numberRange: { min: number; max: number };
        complexity: "simple" | "moderate" | "complex";
        cognitiveLoad: "low" | "medium" | "high";
        allowedOperations: string[];
    };

    // Generated questions (accumulated)
    questions?: Array<{
        text: string;
        answer: number;
        explanation?: string;
        confidence: number;
        metadata: {
            modelUsed: string;
            generationTime: number;
            vectorContext: boolean;
        };
    }>;

    // Quality validation results
    qualityChecks?: {
        mathematicalAccuracy: boolean;
        ageAppropriateness: boolean;
        pedagogicalSoundness: boolean;
        diversityScore: number;
        issues: string[];
    };

    // Context enhancement results
    enhancedQuestions?: Array<{
        originalText: string;
        enhancedText: string;
        contextType: "real-world" | "story" | "visual" | "none";
        engagementScore: number;
    }>;

    // Workflow metadata
    workflow: {
        currentStep: string;
        startTime: number;
        errors: string[];
        warnings: string[];
    };
}
