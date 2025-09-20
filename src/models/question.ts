export enum QuestionType {
    ADDITION = "addition",
    SUBTRACTION = "subtraction",
    MULTIPLICATION = "multiplication",
    DIVISION = "division",
    PATTERN = "pattern",
}

export enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
}

export interface MathQuestion {
    id: string;
    type: QuestionType;
    difficulty: DifficultyLevel;
    grade: number;
    question: string;
    answer: number;
    context?: string;
    hints?: string[];
    createdAt: Date;
}

export interface QuestionValidationResult {
    correct: boolean;
    feedback: string;
    nextQuestionSuggestion?: {
        type: QuestionType;
        difficulty: DifficultyLevel;
    };
}
