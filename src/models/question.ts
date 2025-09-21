export enum QuestionType {
    ADDITION = "addition",
    SUBTRACTION = "subtraction",
    MULTIPLICATION = "multiplication",
    DIVISION = "division",
    PATTERN = "pattern",
    FRACTION_ADDITION = "fraction_addition",
    FRACTION_SUBTRACTION = "fraction_subtraction",
    FRACTION_MULTIPLICATION = "fraction_multiplication",
    FRACTION_DIVISION = "fraction_division",
}

export enum DifficultyLevel {
    EASY = "easy",
    MEDIUM = "medium",
    HARD = "hard",
}

export interface Question {
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

// Curriculum-related interfaces have been moved to curriculum.ts
