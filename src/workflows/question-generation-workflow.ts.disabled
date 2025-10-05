import {
    AgentContext,
    IEducationalAgent,
} from "../agents/base-agent.interface.js";
import { CurriculumAnalyzerAgent } from "../agents/curriculum-analyzer.agent.js";
import { DifficultyCalibatorAgent } from "../agents/difficulty-calibrator.agent.js";
import { QuestionGeneratorAgent } from "../agents/question-generator.agent.js";
import { QualityValidatorAgent } from "../agents/quality-validator.agent.js";
import { ContextEnhancerAgent } from "../agents/context-enhancer.agent.js";
import { DifficultyLevel, QuestionType } from "../models/question.js";

/**
 * Educational Question Generation Workflow
 *
 * Orchestrates multiple agents to create high-quality, age-appropriate,
 * curriculum-aligned questions with vector database context.
 */
export class QuestionGenerationWorkflow {
    private agents: {
        curriculumAnalyzer: CurriculumAnalyzerAgent;
        difficultyCalibrator: DifficultyCalibatorAgent;
        questionGenerator: QuestionGeneratorAgent;
        qualityValidator: QualityValidatorAgent;
        contextEnhancer: ContextEnhancerAgent;
    };

    constructor() {
        // Initialize agents
        this.agents = {
            curriculumAnalyzer: new CurriculumAnalyzerAgent(),
            difficultyCalibrator: new DifficultyCalibatorAgent(),
            questionGenerator: new QuestionGeneratorAgent(),
            qualityValidator: new QualityValidatorAgent(),
            contextEnhancer: new ContextEnhancerAgent(),
        };
    }

    /**
     * Generate questions using the agentic workflow
     *
     * @param params - Question generation parameters
     * @returns Generated questions with metadata
     */
    async generateQuestions(params: {
        questionType: QuestionType;
        difficulty: DifficultyLevel;
        grade: number;
        count: number;
    }): Promise<{
        questions: Array<{
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
        enhancedQuestions?: Array<{
            originalText: string;
            enhancedText: string;
            contextType: "real-world" | "story" | "visual" | "none";
            engagementScore: number;
        }>;
        qualityChecks: {
            mathematicalAccuracy: boolean;
            ageAppropriateness: boolean;
            pedagogicalSoundness: boolean;
            diversityScore: number;
            issues: string[];
        };
        workflow: {
            totalTime: number;
            errors: string[];
            warnings: string[];
            agentPerformance: Record<string, number>;
        };
    }> {
        const startTime = Date.now();

        // Initialize context
        const initialContext: AgentContext = {
            questionType: params.questionType,
            difficulty: params.difficulty,
            grade: params.grade,
            count: params.count,
            workflow: {
                currentStep: "initialization",
                startTime: startTime,
                errors: [],
                warnings: [],
            },
        };

        try {
            // Execute workflow sequentially
            const result = await this.executeWorkflow(initialContext);

            const totalTime = Date.now() - startTime;

            // Calculate agent performance metrics
            const agentPerformance = this.calculateAgentPerformance(
                result,
                totalTime
            );

            return {
                questions: result.questions || [],
                enhancedQuestions: result.enhancedQuestions,
                qualityChecks: result.qualityChecks || {
                    mathematicalAccuracy: false,
                    ageAppropriateness: false,
                    pedagogicalSoundness: false,
                    diversityScore: 0,
                    issues: ["Workflow incomplete"],
                },
                workflow: {
                    totalTime: totalTime,
                    errors: result.workflow.errors,
                    warnings: result.workflow.warnings,
                    agentPerformance: agentPerformance,
                },
            };
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "Unknown workflow error";

            return {
                questions: [],
                qualityChecks: {
                    mathematicalAccuracy: false,
                    ageAppropriateness: false,
                    pedagogicalSoundness: false,
                    diversityScore: 0,
                    issues: [`Workflow failed: ${errorMessage}`],
                },
                workflow: {
                    totalTime: Date.now() - startTime,
                    errors: [errorMessage],
                    warnings: [],
                    agentPerformance: {},
                },
            };
        }
    }

    /**
     * Execute the workflow sequentially through all agents
     *
     * @param context - Initial workflow context
     * @returns Final workflow context
     */
    private async executeWorkflow(
        context: AgentContext
    ): Promise<AgentContext> {
        const agentTimes: Record<string, number> = {};

        // Step 1: Curriculum Analysis
        const step1Start = Date.now();
        context = await this.agents.curriculumAnalyzer.process(context);
        agentTimes.curriculumAnalyzer = Date.now() - step1Start;

        if (context.workflow.errors.length > 0) {
            return context; // Stop on critical errors
        }

        // Step 2: Difficulty Calibration
        const step2Start = Date.now();
        context = await this.agents.difficultyCalibrator.process(context);
        agentTimes.difficultyCalibrator = Date.now() - step2Start;

        if (context.workflow.errors.length > 0) {
            return context; // Stop on critical errors
        }

        // Step 3: Question Generation
        const step3Start = Date.now();
        context = await this.agents.questionGenerator.process(context);
        agentTimes.questionGenerator = Date.now() - step3Start;

        if (context.workflow.errors.length > 0) {
            return context; // Stop on critical errors
        }

        // Step 4: Quality Validation
        const step4Start = Date.now();
        context = await this.agents.qualityValidator.process(context);
        agentTimes.qualityValidator = Date.now() - step4Start;

        // Step 5: Context Enhancement (conditional)
        if (this.shouldEnhanceContext(context)) {
            const step5Start = Date.now();
            context = await this.agents.contextEnhancer.process(context);
            agentTimes.contextEnhancer = Date.now() - step5Start;
        }

        // Store agent performance data
        (context.workflow as any).agentTimes = agentTimes;

        return context;
    }

    /**
     * Determine if context enhancement should be applied
     *
     * @param context - Current workflow context
     * @returns Routing decision
     */
    private shouldEnhanceContext(context: AgentContext): "enhance" | "finish" {
        // Skip enhancement if there are critical quality issues
        if (
            context.qualityChecks &&
            !context.qualityChecks.mathematicalAccuracy
        ) {
            return "finish";
        }

        // Skip enhancement if questions are already context-rich
        if (context.questions && context.questions.length > 0) {
            const hasContextAlready = context.questions.some(
                (q) =>
                    q.text.length > 50 &&
                    (q.text.includes("has") ||
                        q.text.includes("bought") ||
                        q.text.includes("students"))
            );

            if (hasContextAlready) {
                return "finish";
            }
        }

        // Apply enhancement for grades 1-6
        return context.grade <= 6 ? "enhance" : "finish";
    }

    /**
     * Calculate performance metrics for each agent
     *
     * @param context - Final workflow context
     * @param totalTime - Total workflow execution time
     * @returns Agent performance metrics
     */
    private calculateAgentPerformance(
        context: AgentContext,
        totalTime: number
    ): Record<string, number> {
        const agentTimes = (context.workflow as any).agentTimes || {};
        const performance: Record<string, number> = {};

        // Calculate percentage of total time for each agent
        Object.keys(agentTimes).forEach((agentName) => {
            performance[agentName] = (agentTimes[agentName] / totalTime) * 100;
        });

        return performance;
    }
}
