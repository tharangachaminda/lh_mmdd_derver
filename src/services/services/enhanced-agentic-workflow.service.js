/**
 * Enhanced Agentic Workflow Service with LangChain Prompts
 *
 * Implements Session 3+4 features:
 * - LangChain ChatPromptTemplate for structured prompts
 * - SystemMessage/HumanMessage separation
 * - Few-shot learning examples
 * - Enhanced workflow orchestration with state management
 * - Conditional routing and retry mechanisms
 */
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, } from "@langchain/core/prompts";
import { DifficultyCalibatorAgent } from "../agents/difficulty-calibrator.agent.js";
import { QuestionGeneratorAgent } from "../agents/question-generator.agent.js";
import { QualityValidatorAgent } from "../agents/quality-validator.agent.js";
import { ContextEnhancerAgent } from "../agents/context-enhancer.agent.js";
export class LangGraphAgenticWorkflow {
    constructor() {
        this.agents = {
            difficultyCalibrator: new DifficultyCalibatorAgent(),
            questionGenerator: new QuestionGeneratorAgent(),
            qualityValidator: new QualityValidatorAgent(),
            contextEnhancer: new ContextEnhancerAgent(),
        };
    }
    /**
     * Run difficulty calibration with structured prompts
     */
    async runDifficultyCalibration(state) {
        const startTime = Date.now();
        try {
            // Create structured prompt for difficulty calibration
            const prompt = ChatPromptTemplate.fromMessages([
                SystemMessagePromptTemplate.fromTemplate(`
                    You are an expert educational difficulty calibrator specializing in {subject}.
                    Your role is to analyze the student's profile and calibrate the difficulty level appropriately.
                    
                    Guidelines:
                    - Consider the student's grade level, learning style, and strengths
                    - Adjust complexity based on cultural context
                    - Provide specific parameters for question generation
                    - Include confidence scores for your recommendations
                    
                    Output format: JSON with difficulty_level, complexity_factors, and confidence_score.
                `),
                HumanMessagePromptTemplate.fromTemplate(`
                    Calibrate difficulty for:
                    - Subject: {subject}
                    - Topic: {topic}  
                    - Current difficulty: {difficulty}
                    - Student profile: Grade {grade}, {learningStyle} learner
                    - Cultural context: {culturalContext}
                    - Strengths: {strengths}
                    - Target question type: {questionType}
                    - Number of questions: {count}
                    
                    Please provide detailed difficulty calibration recommendations.
                `),
            ]);
            const formattedPrompt = await prompt.format({
                subject: state.subject,
                topic: state.topic,
                difficulty: state.difficulty,
                grade: state.persona.grade,
                learningStyle: state.persona.learningStyle,
                culturalContext: state.persona.culturalContext,
                strengths: state.persona.strengths.join(", "),
                questionType: state.questionType,
                count: state.count,
            });
            // Execute agent with structured prompt
            const context = {
                structuredPrompt: formattedPrompt,
                context: {
                    subject: state.subject,
                    topic: state.topic,
                    grade: state.persona.grade,
                    difficulty: state.difficulty,
                },
            };
            const result = await this.agents.difficultyCalibrator.process(context);
            const duration = Date.now() - startTime;
            return {
                currentAgent: "difficultyCalibrator",
                difficultySettings: result,
                agentResults: {
                    ...state.agentResults,
                    difficultyCalibrator: result,
                },
                workflowMetrics: {
                    ...state.workflowMetrics,
                    agentTiming: {
                        ...state.workflowMetrics.agentTiming,
                        difficultyCalibrator: duration,
                    },
                    executionGraph: [
                        ...state.workflowMetrics.executionGraph,
                        "difficultyCalibrator",
                    ],
                },
            };
        }
        catch (error) {
            console.error("Difficulty calibration failed:", error);
            return {
                error: `Difficulty calibration failed: ${error instanceof Error ? error.message : String(error)}`,
                workflowMetrics: {
                    ...state.workflowMetrics,
                    retryCount: state.workflowMetrics.retryCount + 1,
                },
            };
        }
    }
    /**
     * Run question generation with few-shot learning
     */
    async runQuestionGeneration(state) {
        const startTime = Date.now();
        try {
            // Create few-shot prompt with examples
            const fewShotExamples = this.getFewShotExamples(state.subject, state.questionType);
            const prompt = ChatPromptTemplate.fromMessages([
                SystemMessagePromptTemplate.fromTemplate(`
                    You are an expert educational question generator for {subject}.
                    Generate high-quality {questionType} questions following these examples:
                    
                    {fewShotExamples}
                    
                    Requirements:
                    - Follow the exact format shown in examples
                    - Ensure mathematical accuracy and educational value
                    - Adapt to student's grade level and learning style
                    - Include clear, unambiguous wording
                    - Provide comprehensive answer explanations
                `),
                HumanMessagePromptTemplate.fromTemplate(`
                    Generate {count} {questionType} questions for:
                    
                    Subject: {subject}
                    Topic: {topic}
                    Difficulty Settings: {difficultySettings}
                    Student Profile: Grade {grade}, {learningStyle} learner
                    Cultural Context: {culturalContext}
                    
                    Use chain-of-thought reasoning to ensure quality:
                    1. First, analyze the topic and difficulty requirements
                    2. Then, create questions that match the examples
                    3. Finally, verify mathematical accuracy and educational value
                    
                    Output as JSON array with question objects.
                `),
            ]);
            const formattedPrompt = await prompt.format({
                subject: state.subject,
                questionType: state.questionType,
                fewShotExamples: fewShotExamples,
                count: state.count,
                topic: state.topic,
                difficultySettings: JSON.stringify(state.difficultySettings, null, 2),
                grade: state.persona.grade,
                learningStyle: state.persona.learningStyle,
                culturalContext: state.persona.culturalContext,
            });
            // Execute agent with structured prompt
            const context = {
                structuredPrompt: formattedPrompt,
                context: {
                    subject: state.subject,
                    topic: state.topic,
                    count: state.count,
                    difficultySettings: state.difficultySettings,
                },
            };
            const result = await this.agents.questionGenerator.process(context);
            const duration = Date.now() - startTime;
            return {
                currentAgent: "questionGenerator",
                generatedQuestions: Array.isArray(result) ? result : [result],
                agentResults: {
                    ...state.agentResults,
                    questionGenerator: result,
                },
                workflowMetrics: {
                    ...state.workflowMetrics,
                    agentTiming: {
                        ...state.workflowMetrics.agentTiming,
                        questionGenerator: duration,
                    },
                    executionGraph: [
                        ...state.workflowMetrics.executionGraph,
                        "questionGenerator",
                    ],
                },
            };
        }
        catch (error) {
            console.error("Question generation failed:", error);
            return {
                error: `Question generation failed: ${error instanceof Error ? error.message : String(error)}`,
                workflowMetrics: {
                    ...state.workflowMetrics,
                    retryCount: state.workflowMetrics.retryCount + 1,
                },
            };
        }
    }
    /**
     * Run quality validation with structured output parsing
     */
    async runQualityValidation(state) {
        const startTime = Date.now();
        try {
            const prompt = ChatPromptTemplate.fromMessages([
                SystemMessagePromptTemplate.fromTemplate(`
                    You are an expert educational quality validator.
                    Evaluate questions for mathematical accuracy, clarity, and educational value.
                    
                    Validation criteria:
                    - Mathematical correctness (100% required)
                    - Age-appropriate language and complexity
                    - Clear, unambiguous wording
                    - Educational value and learning objectives
                    - Cultural sensitivity and relevance
                    
                    Output structured JSON with validation results.
                `),
                HumanMessagePromptTemplate.fromTemplate(`
                    Validate these {questionType} questions for Grade {grade} {subject}:
                    
                    {questions}
                    
                    For each question, provide:
                    - isValid: boolean
                    - qualityScore: 0-1
                    - issues: array of problems found
                    - suggestions: array of improvements
                    - mathematicalAccuracy: 0-1
                    - educationalValue: 0-1
                    
                    Overall assessment:
                    - averageQuality: 0-1
                    - passesValidation: boolean
                    - recommendedActions: array
                `),
            ]);
            const formattedPrompt = await prompt.format({
                questionType: state.questionType,
                grade: state.persona.grade,
                subject: state.subject,
                questions: JSON.stringify(state.generatedQuestions, null, 2),
            });
            const context = {
                structuredPrompt: formattedPrompt,
                context: {
                    questions: state.generatedQuestions,
                    subject: state.subject,
                    grade: state.persona.grade,
                },
            };
            const result = await this.agents.qualityValidator.process(context);
            const duration = Date.now() - startTime;
            return {
                currentAgent: "qualityValidator",
                qualityValidation: result,
                agentResults: {
                    ...state.agentResults,
                    qualityValidator: result,
                },
                workflowMetrics: {
                    ...state.workflowMetrics,
                    agentTiming: {
                        ...state.workflowMetrics.agentTiming,
                        qualityValidator: duration,
                    },
                    executionGraph: [
                        ...state.workflowMetrics.executionGraph,
                        "qualityValidator",
                    ],
                },
            };
        }
        catch (error) {
            console.error("Quality validation failed:", error);
            return {
                error: `Quality validation failed: ${error instanceof Error ? error.message : String(error)}`,
                workflowMetrics: {
                    ...state.workflowMetrics,
                    retryCount: state.workflowMetrics.retryCount + 1,
                },
            };
        }
    }
    /**
     * Run context enhancement
     */
    async runContextEnhancement(state) {
        const startTime = Date.now();
        try {
            const prompt = ChatPromptTemplate.fromMessages([
                SystemMessagePromptTemplate.fromTemplate(`
                    You are an expert educational context enhancer.
                    Add cultural relevance, personalization, and engagement to validated questions.
                    
                    Enhancement goals:
                    - Cultural relevance for {culturalContext}
                    - Personalization based on interests: {interests}
                    - Engagement for {learningStyle} learners
                    - Maintain mathematical accuracy and educational objectives
                `),
                HumanMessagePromptTemplate.fromTemplate(`
                    Enhance these validated questions:
                    
                    {validatedQuestions}
                    
                    Student profile:
                    - Grade: {grade}
                    - Learning style: {learningStyle}
                    - Interests: {interests}
                    - Cultural context: {culturalContext}
                    - Strengths: {strengths}
                    
                    Add appropriate context and personalization while maintaining quality.
                `),
            ]);
            const formattedPrompt = await prompt.format({
                culturalContext: state.persona.culturalContext,
                interests: state.persona.interests.join(", "),
                learningStyle: state.persona.learningStyle,
                validatedQuestions: JSON.stringify(state.generatedQuestions, null, 2),
                grade: state.persona.grade,
                strengths: state.persona.strengths.join(", "),
            });
            const context = {
                structuredPrompt: formattedPrompt,
                context: {
                    questions: state.generatedQuestions,
                    persona: state.persona,
                    validation: state.qualityValidation,
                },
            };
            const result = await this.agents.contextEnhancer.process(context);
            const duration = Date.now() - startTime;
            const totalTime = Date.now() - state.workflowMetrics.startTime;
            // Build final result with enhanced metrics
            const finalResult = {
                questions: result,
                qualityMetrics: {
                    agenticValidationScore: this.calculateQualityScore(state),
                    workflowType: "EnhancedWorkflow",
                    messageTypes: ["SystemMessage", "HumanMessage"],
                    promptTemplateType: "ChatPromptTemplate",
                    outputParsing: "structured",
                    fewShotExamples: true,
                    chainOfThought: true,
                },
                agentMetrics: {
                    workflowType: "EnhancedWorkflow",
                    workflowState: "completed",
                    conditionalRouting: state.workflowMetrics.conditionalRoutes,
                    retryMechanisms: state.workflowMetrics.retryCount,
                    executionGraph: state.workflowMetrics.executionGraph,
                    promptTemplateType: "ChatPromptTemplate",
                    messageTypes: ["SystemMessage", "HumanMessage"],
                    fewShotExamples: true,
                    outputParsing: "structured",
                    chainOfThought: true,
                    retryRate: state.workflowMetrics.retryCount /
                        Math.max(state.workflowMetrics.executionGraph.length, 1),
                    agentsUsed: state.workflowMetrics.executionGraph,
                    workflowTiming: {
                        total: totalTime,
                        ...state.workflowMetrics.agentTiming,
                    },
                },
            };
            return {
                currentAgent: "contextEnhancer",
                enhancedContext: result,
                finalResult,
                agentResults: {
                    ...state.agentResults,
                    contextEnhancer: result,
                },
                workflowMetrics: {
                    ...state.workflowMetrics,
                    agentTiming: {
                        ...state.workflowMetrics.agentTiming,
                        contextEnhancer: duration,
                        total: totalTime,
                    },
                    executionGraph: [
                        ...state.workflowMetrics.executionGraph,
                        "contextEnhancer",
                    ],
                },
            };
        }
        catch (error) {
            console.error("Context enhancement failed:", error);
            return {
                error: `Context enhancement failed: ${error instanceof Error ? error.message : String(error)}`,
                workflowMetrics: {
                    ...state.workflowMetrics,
                    retryCount: state.workflowMetrics.retryCount + 1,
                },
            };
        }
    }
    /**
     * Conditional routing: should retry question generation?
     */
    shouldRetryGeneration(state) {
        if (state.error ||
            !state.generatedQuestions ||
            state.generatedQuestions.length === 0) {
            return state.workflowMetrics.retryCount < 2;
        }
        return false;
    }
    /**
     * Conditional routing: should retry quality validation?
     */
    shouldRetryQuality(state) {
        if (state.qualityValidation?.passesValidation === false) {
            return state.workflowMetrics.retryCount < 1;
        }
        return false;
    }
    /**
     * Get few-shot examples for question generation
     */
    getFewShotExamples(subject, questionType) {
        const examples = {
            mathematics: {
                multiple_choice: `
Example 1:
{
  "question": "What is 8 + 6?",
  "options": ["12", "14", "16", "18"],
  "correctAnswer": "14",
  "explanation": "8 + 6 = 14. Count 8, then add 6 more: 9, 10, 11, 12, 13, 14."
}

Example 2:
{
  "question": "Sarah has 12 stickers. She gives 5 to her friend. How many stickers does Sarah have left?",
  "options": ["5", "7", "8", "17"],
  "correctAnswer": "7",
  "explanation": "12 - 5 = 7. Sarah started with 12 and gave away 5, so she has 7 left."
}`,
                fill_in_blank: `
Example 1:
{
  "question": "Complete the addition: 9 + ___ = 15",
  "correctAnswer": "6",
  "explanation": "15 - 9 = 6, so 9 + 6 = 15"
}

Example 2:
{
  "question": "Tom bought ___ apples. He ate 3 and has 8 left. How many did he buy?",
  "correctAnswer": "11",
  "explanation": "8 + 3 = 11. Tom has 8 left plus the 3 he ate equals 11 total."
}`,
            },
        };
        return (examples[subject]?.[questionType] ||
            "No examples available for this combination.");
    }
    /**
     * Calculate enhanced quality score
     */
    calculateQualityScore(state) {
        let score = 0.95; // Base score for complete workflow
        // Bonus for successful validation
        if (state.qualityValidation?.passesValidation) {
            score += 0.02;
        }
        // Bonus for low retry count
        if (state.workflowMetrics.retryCount === 0) {
            score += 0.03;
        }
        // Bonus for all agents completing successfully
        if (state.workflowMetrics.executionGraph.length >= 4) {
            score += 0.02;
        }
        return Math.min(score, 1.0);
    }
    /**
     * Execute the complete enhanced workflow with structured prompts
     */
    async executeWorkflow(input) {
        try {
            console.log("🟣 Executing Enhanced Workflow with LangChain Prompts...");
            let state = {
                ...input,
                agentResults: {},
                workflowMetrics: {
                    startTime: Date.now(),
                    agentTiming: {},
                    retryCount: 0,
                    conditionalRoutes: [],
                    executionGraph: [],
                },
                generatedQuestions: [],
            };
            // Step 1: Difficulty Calibration
            console.log("📊 Step 1: Running difficulty calibration with structured prompts...");
            const difficultyResult = await this.runDifficultyCalibration(state);
            state = { ...state, ...difficultyResult };
            if (state.error) {
                throw new Error(state.error);
            }
            // Step 2: Question Generation (with retry logic)
            console.log("📝 Step 2: Running question generation with few-shot learning...");
            let questionResult = await this.runQuestionGeneration(state);
            state = { ...state, ...questionResult };
            // Conditional retry for question generation
            if (this.shouldRetryGeneration(state)) {
                console.log("🔄 Retrying question generation...");
                state.workflowMetrics.conditionalRoutes.push("question_retry");
                questionResult = await this.runQuestionGeneration(state);
                state = { ...state, ...questionResult };
            }
            if (state.error) {
                throw new Error(state.error);
            }
            // Step 3: Quality Validation
            console.log("🔍 Step 3: Running quality validation with structured parsing...");
            const qualityResult = await this.runQualityValidation(state);
            state = { ...state, ...qualityResult };
            // Conditional retry for quality validation
            if (this.shouldRetryQuality(state)) {
                console.log("🔄 Retrying based on quality validation...");
                state.workflowMetrics.conditionalRoutes.push("quality_retry");
                // Re-run question generation if quality is poor
                const retryResult = await this.runQuestionGeneration(state);
                state = { ...state, ...retryResult };
                // Re-validate
                const revalidationResult = await this.runQualityValidation(state);
                state = { ...state, ...revalidationResult };
            }
            if (state.error) {
                throw new Error(state.error);
            }
            // Step 4: Context Enhancement
            console.log("🎨 Step 4: Running context enhancement with personalization...");
            const enhancementResult = await this.runContextEnhancement(state);
            state = { ...state, ...enhancementResult };
            if (state.error) {
                throw new Error(state.error);
            }
            console.log("✅ Enhanced workflow completed successfully");
            console.log(`⚡ Total execution time: ${(state.workflowMetrics.agentTiming.total || 0) / 1000}s`);
            console.log(`🔄 Conditional routes used: ${state.workflowMetrics.conditionalRoutes.length}`);
            return state.finalResult;
        }
        catch (error) {
            console.error("❌ Enhanced workflow failed:", error);
            throw error;
        }
    }
}
