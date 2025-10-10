/**
 * Answer Validation Agent
 *
 * AI-powered answer validation with partial credit scoring (0-10 scale),
 * constructive feedback generation, and performance analytics.
 *
 * Uses Ollama with qwen2.5:14b for complex reasoning and nuanced grading.
 *
 * @module agents/answer-validation
 */

import { OllamaLanguageModel } from "../services/ollama-language.service.js";

/**
 * Student answer submission from frontend
 */
export interface StudentAnswer {
    questionId: string;
    questionText: string;
    studentAnswer: string;
}

/**
 * Complete answer submission from student
 */
export interface AnswerSubmission {
    sessionId: string;
    studentId: string;
    studentEmail: string;
    answers: StudentAnswer[];
    submittedAt: Date;
}

/**
 * Individual question validation result
 */
export interface QuestionValidationResult {
    questionId: string;
    questionText: string;
    studentAnswer: string;
    score: number;
    maxScore: number;
    feedback: string;
    isCorrect: boolean;
}

/**
 * Complete validation result returned to frontend
 */
export interface ValidationResult {
    success: boolean;
    sessionId: string;
    totalScore: number;
    maxScore: number;
    percentageScore: number;
    questions: QuestionValidationResult[];
    overallFeedback: string;
    strengths: string[];
    areasForImprovement: string[];
}

/**
 * Answer Validation Agent
 *
 * Validates student answers using AI with partial credit scoring,
 * generates constructive feedback, and analyzes performance patterns.
 *
 * @class AnswerValidationAgent
 */
export class AnswerValidationAgent {
    public readonly name = "AnswerValidationAgent";
    public readonly description =
        "AI validation with partial credit scoring and constructive feedback";

    private languageModel: OllamaLanguageModel;

    /**
     * Initialize agent with language model
     *
     * @param languageModel - Optional custom language model (defaults to Ollama)
     */
    constructor(languageModel?: OllamaLanguageModel) {
        this.languageModel = languageModel || OllamaLanguageModel.getInstance();
    }

    /**
     * Validate student answers with AI grading
     *
     * Main method that processes complete answer submission, validates each answer,
     * generates feedback, and analyzes performance patterns.
     *
     * @param submission - Student answer submission
     * @returns Validation result with scores, feedback, and analytics
     * @throws Error if submission is invalid or validation fails
     *
     * @example
     * ```typescript
     * const result = await agent.validateAnswers({
     *   sessionId: 'session-123',
     *   studentId: 'student-456',
     *   studentEmail: 'student@example.com',
     *   answers: [
     *     { questionId: 'q1', questionText: 'What is 5 + 3?', studentAnswer: '8' }
     *   ],
     *   submittedAt: new Date()
     * });
     *
     * console.log(`Score: ${result.percentageScore}%`);
     * console.log(`Feedback: ${result.overallFeedback}`);
     * ```
     */
    async validateAnswers(
        submission: AnswerSubmission
    ): Promise<ValidationResult> {
        const startTime = Date.now();

        try {
            // Validate input
            this.validateSubmission(submission);

            // Validate each answer using AI
            const questionResults: QuestionValidationResult[] = [];

            for (const answer of submission.answers) {
                const result = await this.validateSingleAnswer(answer);
                questionResults.push(result);
            }

            // Calculate totals
            const totalScore = questionResults.reduce(
                (sum, q) => sum + q.score,
                0
            );
            const maxScore = questionResults.length * 10; // 10 points per question
            const percentageScore = Math.round((totalScore / maxScore) * 100);

            // Generate overall feedback
            const overallFeedback = await this.generateOverallFeedback(
                questionResults,
                percentageScore
            );

            // Analyze performance patterns
            const { strengths, areasForImprovement } =
                this.analyzePerformance(questionResults);

            const validationTime = Date.now() - startTime;

            // Log quality metrics
            console.log(`✅ Answer validation complete:`);
            console.log(`   - Model: qwen2.5:14b`);
            console.log(`   - Validation time: ${validationTime}ms`);
            console.log(`   - Questions: ${questionResults.length}`);
            console.log(`   - Score: ${percentageScore}%`);

            return {
                success: true,
                sessionId: submission.sessionId,
                totalScore,
                maxScore,
                percentageScore,
                questions: questionResults,
                overallFeedback,
                strengths,
                areasForImprovement,
            };
        } catch (error) {
            console.error("❌ Answer validation failed:", error);
            throw new Error(
                `Answer validation failed: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Validate single answer using AI
     *
     * Uses Ollama with qwen2.5:14b for complex reasoning and nuanced grading.
     * Generates score (0-10), feedback, and correctness determination.
     *
     * @param answer - Single student answer
     * @returns Validation result for the answer
     * @private
     */
    private async validateSingleAnswer(
        answer: StudentAnswer
    ): Promise<QuestionValidationResult> {
        const prompt = this.buildValidationPrompt(answer);

        try {
            // Generate validation using Ollama with complex reasoning
            const response = await this.callOllamaValidation(prompt);

            // Parse LLM response
            const parsed = this.parseLLMResponse(response);

            return {
                questionId: answer.questionId,
                questionText: answer.questionText,
                studentAnswer: answer.studentAnswer,
                score: parsed.score,
                maxScore: 10,
                feedback: parsed.feedback,
                isCorrect: parsed.isCorrect,
            };
        } catch (error) {
            console.error(
                `❌ Failed to validate answer for question ${answer.questionId}:`,
                error
            );
            throw error;
        }
    }

    /**
     * Call Ollama API for answer validation
     *
     * Uses qwen3:14b model directly for complex reasoning tasks.
     *
     * @param prompt - Validation prompt
     * @returns LLM response text
     * @private
     */
    private async callOllamaValidation(prompt: string): Promise<string> {
        const baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
        const model = process.env.OLLAMA_ALTERNATIVE_MODEL || "qwen3:14b";

        // Create AbortController for timeout handling
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 second timeout

        try {
            const response = await fetch(`${baseUrl}/api/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    stream: false,
                    options: {
                        temperature: 0.3, // Lower temperature for consistent grading
                    },
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(
                    `Failed to generate validation with ${model}: ${response.statusText}`
                );
            }

            const data = (await response.json()) as { response: string };
            return data.response;
        } catch (error) {
            clearTimeout(timeoutId);
            if ((error as Error).name === "AbortError") {
                throw new Error(
                    `Ollama request timed out after 120 seconds. Model: ${model}`
                );
            }
            throw error;
        }
    }

    /**
     * Build validation prompt for LLM
     *
     * Creates structured prompt for AI grading with clear scoring guidelines.
     *
     * @param answer - Student answer to validate
     * @returns Formatted prompt for LLM
     * @private
     */
    private buildValidationPrompt(answer: StudentAnswer): string {
        return `You are an expert educational grader. Validate this student answer with partial credit scoring.

QUESTION: ${answer.questionText}

STUDENT ANSWER: ${answer.studentAnswer}

GRADING GUIDELINES:
- Score 0-10 (0 = completely wrong, 10 = perfect)
- Score >= 8 is considered correct
- Provide constructive feedback (encouraging + improvement tips)
- Be fair and educational, not just right/wrong

RESPONSE FORMAT (JSON only):
{
  "score": <number 0-10>,
  "feedback": "<constructive feedback>",
  "isCorrect": <boolean>
}

Respond with ONLY the JSON object, no additional text.`;
    }

    /**
     * Parse LLM response into structured result
     *
     * Extracts score, feedback, and correctness from LLM JSON response.
     *
     * @param response - Raw LLM response text
     * @returns Parsed validation result
     * @throws Error if response is malformed
     * @private
     */
    private parseLLMResponse(response: string): {
        score: number;
        feedback: string;
        isCorrect: boolean;
    } {
        try {
            // Extract JSON from response (LLM might add extra text)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in LLM response");
            }

            const parsed = JSON.parse(jsonMatch[0]);

            // Validate parsed data
            if (
                typeof parsed.score !== "number" ||
                parsed.score < 0 ||
                parsed.score > 10
            ) {
                throw new Error("Invalid score in LLM response");
            }

            if (
                typeof parsed.feedback !== "string" ||
                parsed.feedback.length === 0
            ) {
                throw new Error("Invalid feedback in LLM response");
            }

            if (typeof parsed.isCorrect !== "boolean") {
                throw new Error("Invalid isCorrect in LLM response");
            }

            return {
                score: parsed.score,
                feedback: parsed.feedback,
                isCorrect: parsed.isCorrect,
            };
        } catch (error) {
            console.error("❌ Failed to parse LLM response:", response);
            throw new Error(
                `Failed to parse LLM response: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Generate overall feedback summarizing performance
     *
     * Creates encouraging overall feedback based on percentage score and
     * question-level feedback patterns.
     *
     * @param questionResults - All question validation results
     * @param percentageScore - Overall percentage score
     * @returns Overall feedback message
     * @private
     */
    private async generateOverallFeedback(
        questionResults: QuestionValidationResult[],
        percentageScore: number
    ): Promise<string> {
        const correctCount = questionResults.filter((q) => q.isCorrect).length;
        const totalCount = questionResults.length;

        // Generate performance-based feedback
        let feedback = "";

        if (percentageScore >= 90) {
            feedback = `🎉 Excellent work! You scored ${percentageScore}% (${correctCount}/${totalCount} questions correct). `;
            feedback += `Your understanding is very strong. Keep up the great work!`;
        } else if (percentageScore >= 75) {
            feedback = `👍 Good job! You scored ${percentageScore}% (${correctCount}/${totalCount} questions correct). `;
            feedback += `You have a solid grasp of the material. Review the areas below for improvement.`;
        } else if (percentageScore >= 60) {
            feedback = `📚 Fair performance. You scored ${percentageScore}% (${correctCount}/${totalCount} questions correct). `;
            feedback += `You're on the right track, but need more practice in some areas. Focus on the improvement areas below.`;
        } else {
            feedback = `💪 Keep learning! You scored ${percentageScore}% (${correctCount}/${totalCount} questions correct). `;
            feedback += `Don't be discouraged—everyone learns at their own pace. Review the material and try again when ready.`;
        }

        return feedback;
    }

    /**
     * Analyze performance patterns to identify strengths and improvements
     *
     * Identifies topics/concepts where student excels (score >= 8) and
     * areas needing improvement (score < 6).
     *
     * @param questionResults - All question validation results
     * @returns Strengths and improvement areas
     * @private
     */
    private analyzePerformance(questionResults: QuestionValidationResult[]): {
        strengths: string[];
        areasForImprovement: string[];
    } {
        const strengths: string[] = [];
        const areasForImprovement: string[] = [];

        // Analyze each question
        for (const result of questionResults) {
            if (result.score >= 8) {
                // Identify strength
                const concept = this.extractConcept(result.questionText);
                if (concept && !strengths.includes(concept)) {
                    strengths.push(concept);
                }
            } else if (result.score < 6) {
                // Identify improvement area
                const concept = this.extractConcept(result.questionText);
                if (concept && !areasForImprovement.includes(concept)) {
                    areasForImprovement.push(concept);
                }
            }
        }

        // Ensure at least one item in each array
        if (
            strengths.length === 0 &&
            questionResults.some((q) => q.score >= 6)
        ) {
            strengths.push("Demonstrating effort and understanding");
        }

        if (
            areasForImprovement.length === 0 &&
            questionResults.some((q) => q.score < 8)
        ) {
            areasForImprovement.push("Continue practicing for mastery");
        }

        return { strengths, areasForImprovement };
    }

    /**
     * Extract key concept from question text
     *
     * Simple keyword extraction to identify mathematical operations or topics.
     *
     * @param questionText - Question text
     * @returns Identified concept or null
     * @private
     */
    private extractConcept(questionText: string): string | null {
        const lowerText = questionText.toLowerCase();

        // Math operations
        if (
            lowerText.includes("addition") ||
            lowerText.includes("+") ||
            lowerText.includes("add")
        ) {
            return "Addition operations";
        }
        if (
            lowerText.includes("subtraction") ||
            lowerText.includes("-") ||
            lowerText.includes("subtract")
        ) {
            return "Subtraction operations";
        }
        if (
            lowerText.includes("multiplication") ||
            lowerText.includes("×") ||
            lowerText.includes("multiply")
        ) {
            return "Multiplication operations";
        }
        if (
            lowerText.includes("division") ||
            lowerText.includes("÷") ||
            lowerText.includes("divide")
        ) {
            return "Division operations";
        }

        // Science concepts
        if (
            lowerText.includes("water cycle") ||
            lowerText.includes("evaporation")
        ) {
            return "Water cycle understanding";
        }

        // Generic fallback
        const words = questionText.split(" ");
        if (words.length > 3) {
            return `Understanding of ${words.slice(0, 3).join(" ")}`;
        }

        return null;
    }

    /**
     * Validate submission has required fields
     *
     * @param submission - Answer submission to validate
     * @throws Error if submission is invalid
     * @private
     */
    private validateSubmission(submission: AnswerSubmission): void {
        if (!submission.sessionId || submission.sessionId.trim() === "") {
            throw new Error("Session ID is required");
        }

        if (!submission.studentId || submission.studentId.trim() === "") {
            throw new Error("Student ID is required");
        }

        if (!submission.studentEmail || submission.studentEmail.trim() === "") {
            throw new Error("Student email is required");
        }

        if (!submission.answers || submission.answers.length === 0) {
            throw new Error("No answers provided in submission");
        }

        // Validate each answer
        for (const answer of submission.answers) {
            if (
                !answer.questionId ||
                !answer.questionText ||
                !answer.studentAnswer
            ) {
                throw new Error(
                    "Each answer must have questionId, questionText, and studentAnswer"
                );
            }
        }
    }
}
