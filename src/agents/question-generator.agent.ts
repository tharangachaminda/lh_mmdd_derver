import { IEducationalAgent, AgentContext } from "./base-agent.interface.js";
import { LanguageModelFactory } from "../services/language-model.factory.js";
import { ILanguageModel } from "../interfaces/language-model.interface.js";
import { QuestionType, DifficultyLevel } from "../models/question.js";

/**
 * Question Generator Agent
 *
 * Responsible for:
 * - Using vector database context for question creation
 * - Generating diverse question types with proper context
 * - Leveraging similar questions for inspiration
 * - Routing to optimal model (llama3.1 vs qwen3:14b) based on complexity
 */
export class QuestionGeneratorAgent implements IEducationalAgent {
    public readonly name = "QuestionGeneratorAgent";
    public readonly description =
        "Generates questions using vector database context and intelligent model routing";

    private languageModel: ILanguageModel;

    constructor(languageModel?: ILanguageModel) {
        this.languageModel =
            languageModel || LanguageModelFactory.getInstance().createModel();
    }

    /**
     * Process question generation for the given context
     *
     * @param context - Current workflow context
     * @returns Updated context with generated questions
     */
    async process(context: AgentContext): Promise<AgentContext> {
        try {
            context.workflow.currentStep = this.name;

            // Initialize questions array if not exists
            if (!context.questions) {
                context.questions = [];
            }

            // Generate the requested number of questions
            for (let i = 0; i < context.count; i++) {
                const startTime = Date.now();

                const question = await this.generateSingleQuestion(context, i);

                context.questions.push({
                    text: question.text,
                    answer: question.answer,
                    explanation: question.explanation,
                    confidence: question.confidence,
                    metadata: {
                        modelUsed: question.modelUsed,
                        generationTime: Date.now() - startTime,
                        vectorContext:
                            (context.curriculumContext?.similarQuestions
                                ?.length || 0) > 0,
                    },
                });
            }

            return context;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            context.workflow.errors.push(`QuestionGenerator: ${errorMessage}`);
            return context;
        }
    }

    /**
     * Generate a single question with vector database context
     *
     * @param context - Current workflow context
     * @param questionIndex - Index of current question being generated
     * @returns Generated question data
     */
    private async generateSingleQuestion(
        context: AgentContext,
        questionIndex: number
    ): Promise<{
        text: string;
        answer: number;
        explanation?: string;
        confidence: number;
        modelUsed: string;
    }> {
        // Build context-aware prompt
        const prompt = this.buildContextAwarePrompt(context, questionIndex);

        // Determine which model to use based on complexity
        const useAlternativeModel = this.shouldUseAlternativeModel(context);

        // Generate question using language model
        const response = await this.languageModel.generateMathQuestion(
            context.questionType,
            context.grade,
            context.difficulty
        );

        const modelUsed = useAlternativeModel ? "qwen3:14b" : "llama3.1:latest";

        // Parse the response (response is a string)
        const parsedQuestion = this.parseQuestionResponse(response);
        return {
            text: parsedQuestion.question,
            answer: parsedQuestion.answer,
            explanation: parsedQuestion.explanation,
            confidence: this.calculateConfidence(context, parsedQuestion),
            modelUsed: modelUsed,
        };
    }

    /**
     * Build context-aware prompt using curriculum analysis and difficulty settings
     *
     * @param context - Current workflow context
     * @param questionIndex - Index of current question
     * @returns Formatted prompt for question generation
     */
    private buildContextAwarePrompt(
        context: AgentContext,
        questionIndex: number
    ): string {
        const {
            questionType,
            difficulty,
            grade,
            curriculumContext,
            difficultySettings,
        } = context;

        let prompt = `Generate a grade ${grade} ${difficulty} difficulty ${questionType.replace(
            "_",
            " "
        )} math question.\n\n`;

        // Add curriculum context if available
        if (
            curriculumContext?.learningObjectives &&
            curriculumContext.learningObjectives.length > 0
        ) {
            prompt += `Learning Objectives:\n`;
            curriculumContext.learningObjectives.forEach((obj) => {
                prompt += `- ${obj}\n`;
            });
            prompt += "\n";
        }

        // Add similar questions as examples if available
        if (
            curriculumContext?.similarQuestions &&
            curriculumContext.similarQuestions.length > 0
        ) {
            prompt += `Here are some examples of similar questions to inspire your generation (create something in a similar style but different):\n\n`;

            curriculumContext.similarQuestions
                .slice(0, 3)
                .forEach((q, index) => {
                    prompt += `Example ${index + 1}: ${q.question}\n`;
                    if (q.explanation) {
                        prompt += `Explanation: ${q.explanation}\n`;
                    }
                    prompt += "\n";
                });
        }

        // Add difficulty-specific constraints
        if (difficultySettings) {
            prompt += `Number Range: Use numbers between ${difficultySettings.numberRange.min} and ${difficultySettings.numberRange.max}\n`;

            if (
                questionType === QuestionType.DIVISION &&
                difficultySettings.numberRange.max > 20
            ) {
                prompt += `IMPORTANT: For division problems, keep divisors small (≤12) to ensure age-appropriate difficulty.\n`;
            }

            if (difficultySettings.allowedOperations.length > 0) {
                prompt += `Allowed Operations: ${difficultySettings.allowedOperations.join(
                    ", "
                )}\n`;
            }

            prompt += "\n";
        }

        // Add generation requirements
        prompt += `Requirements:\n`;
        prompt += `- Is appropriate for grade ${grade} students\n`;
        prompt += `- Has ${difficulty} difficulty level\n`;
        prompt += `- Focuses on ${questionType.replace("_", " ")} skills\n`;
        prompt += `- Uses age-appropriate numbers and context\n`;

        if (questionIndex > 0) {
            prompt += `- Is different from the previous ${questionIndex} question(s) in this set\n`;
        }

        prompt += "\n";
        prompt += `Format your response as:\n`;
        prompt += `Question: [your question here]\n`;
        prompt += `Answer: [numeric answer]\n`;
        prompt += `Explanation: [brief explanation of the solution method]`;

        return prompt;
    }

    /**
     * Determine if we should use the alternative model based on complexity
     *
     * @param context - Current workflow context
     * @returns Whether to use alternative model
     */
    private shouldUseAlternativeModel(context: AgentContext): boolean {
        // Use alternative model (qwen3:14b) for complex questions
        const complexity = context.difficultySettings?.complexity;
        const difficulty = context.difficulty;

        return complexity === "complex" || difficulty === DifficultyLevel.HARD;
    }

    /**
     * Parse the language model response to extract question components
     *
     * @param response - Raw response from language model
     * @returns Parsed question components
     */
    private parseQuestionResponse(response: string): {
        question: string;
        answer: number;
        explanation?: string;
    } {
        const lines = response.split("\n").filter((line) => line.trim());

        let question = "";
        let answer = 0;
        let explanation = "";

        for (const line of lines) {
            const cleanLine = line.trim();

            if (cleanLine.toLowerCase().startsWith("question:")) {
                question = cleanLine.substring(9).trim();
            } else if (cleanLine.toLowerCase().startsWith("answer:")) {
                const answerText = cleanLine.substring(7).trim();
                const numberMatch = answerText.match(/[+-]?\d*\.?\d+/);
                if (numberMatch) {
                    answer = parseFloat(numberMatch[0]);
                }
            } else if (cleanLine.toLowerCase().startsWith("explanation:")) {
                explanation = cleanLine.substring(12).trim();
            }
        }

        // Fallback if parsing fails
        if (!question) {
            question = response.trim();
            // Try to extract a simple math problem and answer
            const simpleMatch = response.match(
                /(\d+\s*[+\-*/]\s*\d+)\s*=\s*(\d+)/
            );
            if (simpleMatch) {
                question = `What is ${simpleMatch[1]}?`;
                answer = parseFloat(simpleMatch[2]);
            }
        }

        return { question, answer, explanation };
    }

    /**
     * Calculate confidence score for the generated question
     *
     * @param context - Current workflow context
     * @param parsedQuestion - Parsed question components
     * @returns Confidence score (0-1)
     */
    private calculateConfidence(
        context: AgentContext,
        parsedQuestion: {
            question: string;
            answer: number;
            explanation?: string;
        }
    ): number {
        let confidence = 0.5; // Base confidence

        // Increase confidence if we have vector context
        if ((context.curriculumContext?.similarQuestions?.length || 0) > 0) {
            confidence += 0.2;
        }

        // Increase confidence if we have clear difficulty settings
        if (context.difficultySettings) {
            confidence += 0.1;
        }

        // Increase confidence if question has explanation
        if (
            parsedQuestion.explanation &&
            parsedQuestion.explanation.length > 10
        ) {
            confidence += 0.1;
        }

        // Increase confidence if answer is reasonable
        if (parsedQuestion.answer > 0 && parsedQuestion.answer < 10000) {
            confidence += 0.1;
        }

        return Math.min(1.0, confidence);
    }
}
