import {
    DifficultyLevel,
    MathQuestion,
    QuestionType,
    QuestionValidationResult,
} from "../models/question";

export class QuestionGenerationService {
    private questionCounter = 0;
    async generateQuestion(
        type: QuestionType,
        difficulty: DifficultyLevel,
        grade?: number
    ): Promise<MathQuestion> {
        // This is a placeholder implementation
        // TODO: Implement LangChain integration for dynamic question generation
        const numbers = this.getNumbersForDifficulty(difficulty, grade);
        const question = this.formatQuestion(type, numbers);
        const answer = this.calculateAnswer(type, numbers);

        return {
            id: `q${++this.questionCounter}`,
            type,
            difficulty,
            grade: grade || 1,
            question,
            answer,
            createdAt: new Date(),
        };
    }

    async validateAnswer(
        question: MathQuestion,
        studentAnswer: number
    ): Promise<QuestionValidationResult> {
        const correct = studentAnswer === question.answer;

        // TODO: Use LangChain to generate personalized feedback
        const feedback = correct
            ? "Great job! You got it right!"
            : `Try again. Think about how you can break down the problem into smaller steps.`;

        return {
            correct,
            feedback,
            nextQuestionSuggestion: this.getNextQuestionSuggestion(
                question,
                correct
            ),
        };
    }

    private getNumbersForDifficulty(
        difficulty: DifficultyLevel,
        grade?: number
    ): number[] {
        // Adjust number ranges based on grade and difficulty
        const maxNumber = this.getMaxNumberForGrade(grade || 1, difficulty);

        return [
            Math.floor(Math.random() * maxNumber) + 1,
            Math.floor(Math.random() * maxNumber) + 1,
        ];
    }

    private getMaxNumberForGrade(
        grade: number,
        difficulty: DifficultyLevel
    ): number {
        const baseMax = grade * 10;
        switch (difficulty) {
            case DifficultyLevel.EASY:
                return Math.min(baseMax, 10);
            case DifficultyLevel.MEDIUM:
                return baseMax;
            case DifficultyLevel.HARD:
                return baseMax * 2;
            default:
                return 10;
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
            default:
                throw new Error(`Question type ${type} not implemented`);
        }
    }

    private getNextQuestionSuggestion(
        currentQuestion: MathQuestion,
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
        // Rotate through question types
        const types = Object.values(QuestionType);
        const currentIndex = types.indexOf(currentType);
        return types[(currentIndex + 1) % types.length];
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
