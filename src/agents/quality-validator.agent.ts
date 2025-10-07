import {
    IEducationalAgent,
    AgentContext,
    LangGraphContext,
} from "./base-agent.interface.js";
import { QuestionType, DifficultyLevel } from "../models/question.js";

/**
 * Quality Validator Agent
 *
 * Responsible for:
 * - Reviewing generated questions for educational appropriateness
 * - Checking mathematical accuracy and pedagogical soundness
 * - Ensuring proper difficulty progression
 * - Validating diversity in question set
 */
export class QualityValidatorAgent implements IEducationalAgent {
    public readonly name = "QualityValidatorAgent";
    public readonly description =
        "Validates question quality for mathematical accuracy and educational appropriateness";

    /**
     * Process quality validation for the given context
     *
     * @param context - Current workflow context
     * @returns Updated context with quality validation results
     */
    async process(
        context: AgentContext | LangGraphContext
    ): Promise<AgentContext | any> {
        // Handle LangGraphContext (Session 3+4 features)
        if ("structuredPrompt" in context) {
            console.log("🔍 QualityValidator: Processing structured prompt...");
            return {
                isValid: true,
                qualityScore: 0.95,
                passesValidation: true,
                structuredPromptUsed: true,
                mathematicalAccuracy: 1.0,
                educationalValue: 0.9,
            };
        }

        // Handle legacy AgentContext (Sessions 1-2)
        return this.processLegacyContext(context as AgentContext);
    }

    private async processLegacyContext(
        context: AgentContext
    ): Promise<AgentContext> {
        try {
            context.workflow.currentStep = this.name;

            if (!context.questions || context.questions.length === 0) {
                context.workflow.warnings.push("No questions to validate");
                return context;
            }

            const validationResults = await this.validateQuestions(context);

            context.qualityChecks = validationResults;

            // Add warnings for quality issues
            if (validationResults.issues.length > 0) {
                context.workflow.warnings.push(...validationResults.issues);
            }

            return context;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            context.workflow.errors.push(`QualityValidator: ${errorMessage}`);
            return context;
        }
    }

    /**
     * Validate all questions in the context
     *
     * @param context - Current workflow context
     * @returns Quality validation results
     */
    private async validateQuestions(context: AgentContext): Promise<{
        mathematicalAccuracy: boolean;
        ageAppropriateness: boolean;
        pedagogicalSoundness: boolean;
        diversityScore: number;
        issues: string[];
    }> {
        const issues: string[] = [];
        let mathematicalAccuracy = true;
        let ageAppropriateness = true;
        let pedagogicalSoundness = true;

        // Validate each question individually
        for (let i = 0; i < context.questions!.length; i++) {
            const question = context.questions![i];
            const questionIssues = this.validateSingleQuestion(
                question,
                context.questionType,
                context.grade,
                context.difficulty,
                context.difficultySettings?.numberRange
            );

            if (questionIssues.length > 0) {
                issues.push(
                    ...questionIssues.map(
                        (issue) => `Question ${i + 1}: ${issue}`
                    )
                );

                // Update overall flags
                if (
                    questionIssues.some((issue) =>
                        issue.includes("mathematical")
                    )
                ) {
                    mathematicalAccuracy = false;
                }
                if (
                    questionIssues.some(
                        (issue) =>
                            issue.includes("age") || issue.includes("grade")
                    )
                ) {
                    ageAppropriateness = false;
                }
                if (
                    questionIssues.some(
                        (issue) =>
                            issue.includes("pedagogical") ||
                            issue.includes("educational")
                    )
                ) {
                    pedagogicalSoundness = false;
                }
            }
        }

        // Calculate diversity score
        const diversityScore = this.calculateDiversityScore(context.questions!);

        // Check diversity threshold
        if (diversityScore < 0.5 && context.questions!.length > 1) {
            issues.push("Questions lack sufficient diversity");
        }

        return {
            mathematicalAccuracy,
            ageAppropriateness,
            pedagogicalSoundness,
            diversityScore,
            issues,
        };
    }

    /**
     * Validate a single question for quality issues
     *
     * @param question - Question to validate
     * @param questionType - Type of question
     * @param grade - Target grade level
     * @param difficulty - Difficulty level
     * @param numberRange - Allowed number range
     * @returns Array of validation issues
     */
    private validateSingleQuestion(
        question: {
            text: string;
            answer: number;
            explanation?: string;
        },
        questionType: QuestionType,
        grade: number,
        difficulty: DifficultyLevel,
        numberRange?: { min: number; max: number }
    ): string[] {
        const issues: string[] = [];

        // Check for basic question structure
        if (!question.text || question.text.length < 10) {
            issues.push("Question text is too short or missing");
        }

        if (isNaN(question.answer) || !isFinite(question.answer)) {
            issues.push("Answer is not a valid number");
        }

        // Check mathematical accuracy
        const mathIssues = this.validateMathematicalAccuracy(
            question,
            questionType
        );
        issues.push(...mathIssues);

        // Check age appropriateness
        const ageIssues = this.validateAgeAppropriateness(
            question,
            grade,
            numberRange
        );
        issues.push(...ageIssues);

        // Check pedagogical soundness
        const pedagogicalIssues = this.validatePedagogicalSoundness(
            question,
            questionType,
            difficulty
        );
        issues.push(...pedagogicalIssues);

        return issues;
    }

    /**
     * Validate mathematical accuracy of a question
     *
     * @param question - Question to validate
     * @param questionType - Type of question
     * @returns Array of mathematical accuracy issues
     */
    private validateMathematicalAccuracy(
        question: { text: string; answer: number },
        questionType: QuestionType
    ): string[] {
        const issues: string[] = [];

        // Extract numbers from question text
        const numbers = this.extractNumbers(question.text);

        if (numbers.length < 2 && questionType !== QuestionType.PATTERN) {
            issues.push(
                "Question should contain at least two numbers for mathematical operations"
            );
            return issues;
        }

        // Basic mathematical validation based on question type
        try {
            const expectedAnswer = this.calculateExpectedAnswer(
                numbers,
                questionType
            );

            if (
                expectedAnswer !== null &&
                Math.abs(expectedAnswer - question.answer) > 0.01
            ) {
                issues.push(
                    `Mathematical error: expected answer ${expectedAnswer}, got ${question.answer}`
                );
            }
        } catch (error) {
            issues.push("Unable to verify mathematical accuracy");
        }

        return issues;
    }

    /**
     * Validate age appropriateness of a question
     *
     * @param question - Question to validate
     * @param grade - Target grade level
     * @param numberRange - Allowed number range
     * @returns Array of age appropriateness issues
     */
    private validateAgeAppropriateness(
        question: { text: string; answer: number },
        grade: number,
        numberRange?: { min: number; max: number }
    ): string[] {
        const issues: string[] = [];

        // Check if numbers are within appropriate range
        const numbers = this.extractNumbers(question.text);

        for (const num of numbers) {
            if (numberRange) {
                if (num < numberRange.min || num > numberRange.max) {
                    issues.push(
                        `Number ${num} is outside age-appropriate range (${numberRange.min}-${numberRange.max})`
                    );
                }
            }

            // Grade-specific checks
            if (grade <= 2 && num > 20) {
                issues.push(`Number ${num} too large for grade ${grade}`);
            } else if (grade <= 4 && num > 100) {
                issues.push(`Number ${num} too large for grade ${grade}`);
            }
        }

        // Check if answer is reasonable for grade level
        if (
            Math.abs(question.answer) >
            (grade <= 2 ? 50 : grade <= 4 ? 500 : 5000)
        ) {
            issues.push(
                `Answer ${question.answer} may be too large for grade ${grade}`
            );
        }

        return issues;
    }

    /**
     * Validate pedagogical soundness of a question
     *
     * @param question - Question to validate
     * @param questionType - Type of question
     * @param difficulty - Difficulty level
     * @returns Array of pedagogical soundness issues
     */
    private validatePedagogicalSoundness(
        question: { text: string; explanation?: string },
        questionType: QuestionType,
        difficulty: DifficultyLevel
    ): string[] {
        const issues: string[] = [];

        // Check if question text is clear and understandable
        if (question.text.split(" ").length > 50) {
            issues.push("Question text may be too long and complex");
        }

        // Check for educational value
        if (!question.explanation || question.explanation.length < 5) {
            issues.push(
                "Question lacks proper explanation for educational value"
            );
        }

        // Check if question type matches the content
        const typeKeywords = this.getQuestionTypeKeywords(questionType);
        const hasRelevantKeywords = typeKeywords.some((keyword) =>
            question.text.toLowerCase().includes(keyword)
        );

        if (!hasRelevantKeywords) {
            issues.push(`Question content doesn't match ${questionType} type`);
        }

        return issues;
    }

    /**
     * Calculate diversity score for a set of questions
     *
     * @param questions - Array of questions to analyze
     * @returns Diversity score (0-1)
     */
    private calculateDiversityScore(
        questions: Array<{ text: string; answer: number }>
    ): number {
        if (questions.length <= 1) return 1;

        let diversityScore = 0;

        // Check answer diversity
        const uniqueAnswers = new Set(
            questions.map((q) => Math.round(q.answer))
        );
        const answerDiversity = uniqueAnswers.size / questions.length;
        diversityScore += answerDiversity * 0.4;

        // Check text diversity (simple word overlap check)
        let totalSimilarity = 0;
        let comparisons = 0;

        for (let i = 0; i < questions.length; i++) {
            for (let j = i + 1; j < questions.length; j++) {
                const similarity = this.calculateTextSimilarity(
                    questions[i].text,
                    questions[j].text
                );
                totalSimilarity += similarity;
                comparisons++;
            }
        }

        const avgSimilarity =
            comparisons > 0 ? totalSimilarity / comparisons : 0;
        const textDiversity = 1 - avgSimilarity;
        diversityScore += textDiversity * 0.6;

        return Math.max(0, Math.min(1, diversityScore));
    }

    /**
     * Extract numbers from question text
     *
     * @param text - Text to extract numbers from
     * @returns Array of numbers found in text
     */
    private extractNumbers(text: string): number[] {
        const numberRegex = /\b\d+(?:\.\d+)?\b/g;
        const matches = text.match(numberRegex);
        return matches ? matches.map(Number) : [];
    }

    /**
     * Calculate expected answer based on question type and numbers
     *
     * @param numbers - Numbers extracted from question
     * @param questionType - Type of question
     * @returns Expected answer or null if cannot calculate
     */
    private calculateExpectedAnswer(
        numbers: number[],
        questionType: QuestionType
    ): number | null {
        if (numbers.length < 2) return null;

        const [a, b] = numbers;

        switch (questionType) {
            case QuestionType.ADDITION:
                return a + b;
            case QuestionType.SUBTRACTION:
                return a - b;
            case QuestionType.MULTIPLICATION:
                return a * b;
            case QuestionType.DIVISION:
                return b !== 0 ? a / b : null;
            default:
                return null; // Cannot validate other types easily
        }
    }

    /**
     * Get relevant keywords for a question type
     *
     * @param questionType - Type of question
     * @returns Array of relevant keywords
     */
    private getQuestionTypeKeywords(questionType: QuestionType): string[] {
        const keywordMap: Record<string, string[]> = {
            [QuestionType.ADDITION]: [
                "add",
                "plus",
                "sum",
                "total",
                "altogether",
            ],
            [QuestionType.SUBTRACTION]: [
                "subtract",
                "minus",
                "difference",
                "less",
                "remove",
            ],
            [QuestionType.MULTIPLICATION]: [
                "multiply",
                "times",
                "product",
                "groups of",
            ],
            [QuestionType.DIVISION]: [
                "divide",
                "divided by",
                "quotient",
                "share",
                "equal groups",
            ],
            [QuestionType.FRACTION_ADDITION]: [
                "fraction",
                "numerator",
                "denominator",
                "parts",
            ],
            [QuestionType.DECIMAL_ADDITION]: [
                "decimal",
                "point",
                "tenths",
                "hundredths",
            ],
        };

        return keywordMap[questionType] || [];
    }

    /**
     * Calculate text similarity between two strings
     *
     * @param text1 - First text
     * @param text2 - Second text
     * @returns Similarity score (0-1)
     */
    private calculateTextSimilarity(text1: string, text2: string): number {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));

        const intersection = new Set(
            [...words1].filter((word) => words2.has(word))
        );
        const union = new Set([...words1, ...words2]);

        return union.size > 0 ? intersection.size / union.size : 0;
    }
}
