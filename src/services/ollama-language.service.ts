import { ILanguageModel } from "../interfaces/language-model.interface.js";

export class OllamaLanguageModel implements ILanguageModel {
    private static instance?: OllamaLanguageModel;
    private baseUrl: string;
    private modelName: string;
    private alternativeModel: string;

    protected constructor() {
        this.baseUrl = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
        this.modelName = process.env.OLLAMA_MODEL_NAME || "llama3.1:latest";
        this.alternativeModel =
            process.env.OLLAMA_ALTERNATIVE_MODEL || "qwen3:14b";
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
        // Use complex model for hard/medium questions, simple for easy questions
        const complexity = difficulty === "easy" ? "simple" : "complex";
        const response = await this.generateCompletion(prompt, complexity);
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

    /**
     * Intelligently selects the appropriate model based on task complexity
     * @param complexity - Simple tasks use primary model, complex tasks use alternative model
     * @returns The model name to use for the request
     */
    private selectModel(complexity: "simple" | "complex" = "simple"): string {
        // Use alternative model (qwen3:14b) for complex reasoning tasks
        // Use primary model (llama3.1) for simple, fast tasks
        return complexity === "complex" &&
            this.alternativeModel !== this.modelName
            ? this.alternativeModel
            : this.modelName;
    }

    /**
     * Generate completion with automatic model selection based on complexity
     * @param prompt - The prompt to send to the model
     * @param complexity - Whether to use simple or complex model
     * @returns Generated text response
     */
    private async generateCompletion(
        prompt: string,
        complexity: "simple" | "complex" = "simple"
    ): Promise<string> {
        const selectedModel = this.selectModel(complexity);

        const response = await fetch(`${this.baseUrl}/api/generate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: selectedModel,
                prompt: prompt,
                stream: false,
            }),
        });

        if (!response.ok) {
            throw new Error(
                `Failed to generate completion with ${selectedModel}: ${response.statusText}`
            );
        }

        const data = (await response.json()) as { response: string };
        return data.response;
    }

    private async generateCompletionLegacy(prompt: string): Promise<string> {
        // Legacy method - always uses primary model for backward compatibility
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
