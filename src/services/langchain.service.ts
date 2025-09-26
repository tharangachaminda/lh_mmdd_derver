import { getLlama } from "node-llama-cpp";
import { ILanguageModel } from "../interfaces/language-model.interface.js";

export class LangChainService implements ILanguageModel {
    private static instance: LangChainService;
    private model: any = null;
    private context: any = null;

    protected constructor() {}

    public async initialize(): Promise<void> {
        await this.initializeModel();
    }

    public async generateMathQuestion(
        type: string,
        grade: number,
        difficulty: string
    ): Promise<string> {
        await this.initializeModel();
        if (!this.model) {
            throw new Error("LLM not initialized");
        }

        const prompt = this.buildQuestionPrompt(type, grade, difficulty);
        const { text } = await this.model.completion(prompt);
        return text;
    }

    public async generateFeedback(
        question: string,
        studentAnswer: number,
        correctAnswer: number,
        grade: number
    ): Promise<string> {
        await this.initializeModel();
        if (!this.model) {
            throw new Error("LLM not initialized");
        }

        const prompt = this.buildFeedbackPrompt(
            question,
            studentAnswer,
            correctAnswer,
            grade
        );
        const { text } = await this.model.completion(prompt);
        return text;
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

    public static getInstance(): LangChainService {
        if (!LangChainService.instance) {
            LangChainService.instance = new LangChainService();
        }
        return LangChainService.instance;
    }

    private async initializeModel() {
        if (!this.model) {
            const llama = await getLlama();
            this.model = await llama.loadModel({
                modelPath: process.env.LLAMA_MODEL_PATH!,
                gpuLayers: 0,
            });

            this.context = await this.model.createEmbeddingContext();
        }
    }

    public async generateEmbedding(text: string): Promise<number[]> {
        await this.initializeModel();
        const result = await this.context.getEmbeddingFor(text);
        return Array.from(result.vector);
    }

    public async cleanup(): Promise<void> {
        if (this.context) {
            await this.context.free();
            this.context = null;
        }
        if (this.model) {
            await this.model.free();
            this.model = null;
        }
    }
}
