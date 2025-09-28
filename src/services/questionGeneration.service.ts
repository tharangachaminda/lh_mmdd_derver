import {
    DifficultyLevel,
    Question,
    QuestionType,
    QuestionValidationResult,
} from "../models/question.js";
import { LanguageModelFactory } from "./language-model.factory.js";
import { ILanguageModel } from "../interfaces/language-model.interface.js";

export class QuestionGenerationService {
    private langchainService: ILanguageModel;
    private questionCounter = 0;

    /**
     * Constructor for QuestionGenerationService
     * @param langchainService - Optional language model service (uses factory default if not provided)
     */
    constructor(langchainService?: ILanguageModel) {
        this.langchainService =
            langchainService ||
            LanguageModelFactory.getInstance().createModel();
    }
    async generateQuestion(
        type: QuestionType,
        difficulty: DifficultyLevel,
        grade?: number
    ): Promise<Question> {
        const effectiveGrade = grade || 1;

        try {
            // Get AI-generated question
            const aiResponse = await this.langchainService.generateMathQuestion(
                type,
                effectiveGrade,
                difficulty
            );

            // Parse the AI response
            const questionMatch = aiResponse.match(
                /Question:\s*(.+?)\s*Answer:\s*(\d+)/i
            );
            if (!questionMatch) {
                // Fallback to deterministic generation if AI response is invalid
                const numbers = this.getNumbersForDifficulty(
                    difficulty,
                    effectiveGrade
                );
                const question = this.formatQuestion(type, numbers);
                const answer = this.calculateAnswer(type, numbers);
                const remainder = this.calculateRemainder(type, numbers);
                return {
                    id: `q${++this.questionCounter}`,
                    type,
                    difficulty,
                    grade: effectiveGrade,
                    question,
                    answer,
                    remainder,
                    createdAt: new Date(),
                };
            }

            const [, questionText, answerText] = questionMatch;
            const answer = parseInt(answerText, 10);

            return {
                id: `q${++this.questionCounter}`,
                type,
                difficulty,
                grade: effectiveGrade,
                question: questionText.trim(),
                answer,
                createdAt: new Date(),
            };
        } catch (error) {
            // Fallback to deterministic generation on error
            const numbers = this.getNumbersForDifficulty(
                difficulty,
                effectiveGrade
            );
            const question = this.formatQuestion(type, numbers);
            const answer = this.calculateAnswer(type, numbers);
            const remainder = this.calculateRemainder(type, numbers);
            return {
                id: `q${++this.questionCounter}`,
                type,
                difficulty,
                grade: effectiveGrade,
                question,
                answer,
                remainder,
                createdAt: new Date(),
            };
        }
    }

    async validateAnswer(
        question: Question,
        studentAnswer: number
    ): Promise<QuestionValidationResult> {
        const correct = studentAnswer === question.answer;

        try {
            // Generate personalized feedback using LangChain
            const feedback = await this.langchainService.generateFeedback(
                question.question,
                studentAnswer,
                question.answer,
                question.grade
            );

            return {
                correct,
                feedback: feedback.trim(),
                nextQuestionSuggestion: this.getNextQuestionSuggestion(
                    question,
                    correct
                ),
            };
        } catch (error) {
            // Fallback to default feedback on error
            const defaultFeedback = correct
                ? "Great job! You got it right!"
                : `Try again. Think about how you can break down the problem into smaller steps.`;

            return {
                correct,
                feedback: defaultFeedback,
                nextQuestionSuggestion: this.getNextQuestionSuggestion(
                    question,
                    correct
                ),
            };
        }
    }

    private getNumbersForDifficulty(
        difficulty: DifficultyLevel,
        grade?: number
    ): number[] {
        const effectiveGrade = grade || 1;
        const minNumber = effectiveGrade === 1 ? 1 : 10;
        const maxNumber = this.getMaxNumberForGrade(effectiveGrade, difficulty);

        return [
            Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber,
            Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber,
        ];
    }

    private getMaxNumberForGrade(
        grade: number,
        difficulty: DifficultyLevel
    ): number {
        // For grade 1, keep numbers simple
        if (grade === 1) {
            switch (difficulty) {
                case DifficultyLevel.EASY:
                    return 9;
                case DifficultyLevel.MEDIUM:
                    return 15;
                case DifficultyLevel.HARD:
                    return 20;
            }
        }

        // For higher grades, scale linearly to maintain reasonable ranges
        const baseMax = 10 + (grade - 1) * 15; // Increases by 15 per grade

        switch (difficulty) {
            case DifficultyLevel.EASY:
                return baseMax;
            case DifficultyLevel.MEDIUM:
                return Math.min(100, baseMax * 1.5);
            case DifficultyLevel.HARD:
                return Math.min(100, baseMax * 2);
            default:
                return baseMax;
        }
    }

    private formatQuestion(type: QuestionType, numbers: number[]): string {
        const [a, b] = numbers;
        switch (type) {
            case QuestionType.ADDITION:
                return `What is ${a} + ${b}?`;
            case QuestionType.SUBTRACTION:
                return `What is ${a} - ${b}?`;
            case QuestionType.MULTIPLICATION:
                return `What is ${a} × ${b}?`;
            case QuestionType.DIVISION:
                return `What is ${a} ÷ ${b}?`;
            case QuestionType.WHOLE_NUMBER_DIVISION:
                return `What is ${a} ÷ ${b}? (Give your answer as a whole number and remainder)`;
            case QuestionType.DIVISION_WITH_REMAINDERS:
                return `Divide ${a} by ${b}. What is the quotient and remainder?`;
            case QuestionType.LONG_DIVISION:
                return `Use long division to find ${a} ÷ ${b}. Show quotient and remainder.`;
            case QuestionType.DECIMAL_DIVISION_EXACT:
                return `What is ${a} ÷ ${b}? (Express as a decimal)`;
            default:
                throw new Error(`Question type ${type} not implemented`);
        }
    }

    private calculateAnswer(type: QuestionType, numbers: number[]): number {
        const [a, b] = numbers;
        switch (type) {
            case QuestionType.ADDITION:
                return a + b;
            case QuestionType.SUBTRACTION:
                return a - b;
            case QuestionType.MULTIPLICATION:
                return a * b;
            case QuestionType.DIVISION:
                return Math.round((a / b) * 100) / 100; // Round to 2 decimal places
            case QuestionType.WHOLE_NUMBER_DIVISION:
            case QuestionType.DIVISION_WITH_REMAINDERS:
            case QuestionType.LONG_DIVISION:
                return Math.floor(a / b); // Return quotient for remainder-based division
            case QuestionType.DECIMAL_DIVISION_EXACT:
                return Math.round((a / b) * 100) / 100; // Round to 2 decimal places
            default:
                throw new Error(`Question type ${type} not implemented`);
        }
    }

    /**
     * Calculate remainder for division questions
     */
    private calculateRemainder(
        type: QuestionType,
        numbers: number[]
    ): number | undefined {
        const [a, b] = numbers;
        switch (type) {
            case QuestionType.WHOLE_NUMBER_DIVISION:
            case QuestionType.DIVISION_WITH_REMAINDERS:
            case QuestionType.LONG_DIVISION:
                return a % b; // Return remainder
            default:
                return undefined; // No remainder for non-division questions
        }
    }

    private getNextQuestionSuggestion(
        currentQuestion: Question,
        wasCorrect: boolean
    ): { type: QuestionType; difficulty: DifficultyLevel } {
        if (wasCorrect) {
            // If correct, maybe increase difficulty or try a different type
            return {
                type: this.getNextQuestionType(currentQuestion.type),
                difficulty: this.getNextDifficulty(currentQuestion.difficulty),
            };
        }

        // If incorrect, maybe decrease difficulty or stay at same level
        return {
            type: currentQuestion.type,
            difficulty: this.getPreviousDifficulty(currentQuestion.difficulty),
        };
    }

    private getNextQuestionType(currentType: QuestionType): QuestionType {
        // Rotate through implemented question types only
        const implementedTypes = [
            QuestionType.ADDITION,
            QuestionType.SUBTRACTION,
            QuestionType.MULTIPLICATION,
            QuestionType.DIVISION,
        ];
        const currentIndex = implementedTypes.indexOf(currentType);
        return implementedTypes[(currentIndex + 1) % implementedTypes.length];
    }

    private getNextDifficulty(current: DifficultyLevel): DifficultyLevel {
        switch (current) {
            case DifficultyLevel.EASY:
                return DifficultyLevel.MEDIUM;
            case DifficultyLevel.MEDIUM:
                return DifficultyLevel.HARD;
            default:
                return DifficultyLevel.HARD;
        }
    }

    private getPreviousDifficulty(current: DifficultyLevel): DifficultyLevel {
        switch (current) {
            case DifficultyLevel.HARD:
                return DifficultyLevel.MEDIUM;
            case DifficultyLevel.MEDIUM:
                return DifficultyLevel.EASY;
            default:
                return DifficultyLevel.EASY;
        }
    }
}
