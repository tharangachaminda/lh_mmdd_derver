import { ILanguageModel } from "../interfaces/language-model.interface.js";

export class OllamaLanguageModel implements ILanguageModel {
    private static instance?: OllamaLanguageModel;
    private baseUrl: string;
    private modelName: string;

    protected constructor() {
        this.baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
        this.modelName = process.env.OLLAMA_MODEL_NAME || "llama2";
    }

    // For testing purposes only
    public static resetInstance(): void {
        OllamaLanguageModel.instance = undefined;
    }

    public async initialize(): Promise<void> {
        // No initialization needed for Ollama as it manages model loading
    }

    public async generateMathQuestion(
        type: string,
        grade: number,
        difficulty: string
    ): Promise<string> {
        const prompt = this.buildQuestionPrompt(type, grade, difficulty);
        const response = await this.generateCompletion(prompt);
        return response;
    }

    public async generateFeedback(
        question: string,
        studentAnswer: number,
        correctAnswer: number,
        grade: number
    ): Promise<string> {
        const prompt = this.buildFeedbackPrompt(
            question,
            studentAnswer,
            correctAnswer,
            grade
        );
        const response = await this.generateCompletion(prompt);
        return response;
    }

    public async generateEmbedding(text: string): Promise<number[]> {
        const response = await fetch(`${this.baseUrl}/api/embeddings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.modelName,
                prompt: text,
            }),
        });

        if (!response.ok) {
            throw new Error(
                `Failed to generate embedding: ${response.statusText}`
            );
        }

        const data = (await response.json()) as { embedding: number[] };
        return data.embedding;
    }

    public async cleanup(): Promise<void> {
        // No cleanup needed for Ollama as it manages resources
    }

    private async generateCompletion(prompt: string): Promise<string> {
        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.modelName,
                prompt: prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(
                `Failed to generate completion: ${response.statusText}`
            );
        }

        const data = (await response.json()) as { response: string };
        return data.response;
    }

    private buildQuestionPrompt(
        type: string,
        grade: number,
        difficulty: string
    ): string {
        return `Generate a grade ${grade} ${difficulty} difficulty ${type} math question.\nFormat: Question: [question] Answer: [numeric answer]`;
    }

    private buildFeedbackPrompt(
        question: string,
        studentAnswer: number,
        correctAnswer: number,
        grade: number
    ): string {
        return `For a grade ${grade} student answering "${question}":
- Student's answer: ${studentAnswer}
- Correct answer: ${correctAnswer}
Provide brief, encouraging feedback explaining why the answer is correct/incorrect.`;
    }

    public static getInstance(): OllamaLanguageModel {
        if (!OllamaLanguageModel.instance) {
            OllamaLanguageModel.instance = new OllamaLanguageModel();
        }
        return OllamaLanguageModel.instance;
    }
}
