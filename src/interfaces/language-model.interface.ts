export interface ILanguageModel {
    initialize(): Promise<void>;
    generateMathQuestion(
        type: string,
        grade: number,
        difficulty: string
    ): Promise<string>;
    generateFeedback(
        question: string,
        studentAnswer: number,
        correctAnswer: number,
        grade: number
    ): Promise<string>;
    generateEmbedding(text: string): Promise<number[]>;
    cleanup(): Promise<void>;
}
