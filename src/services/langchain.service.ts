import path from "path";
import dotenv from "dotenv";

dotenv.config();

export interface LlamaConfig {
    modelPath: string;
    numThreads: number;
    contextSize: number;
    batchSize: number;
}

export class LangChainService {
    private static instance: LangChainService;
    private llm: any | null = null; // Using any temporarily until we confirm the exact type
    private config: LlamaConfig;

    private constructor() {
        this.config = {
            modelPath:
                process.env.LLAMA_MODEL_PATH ||
                path.join(process.cwd(), "models", "model.gguf"),
            numThreads: parseInt(process.env.LLAMA_NUM_THREADS || "4"),
            contextSize: parseInt(process.env.LLAMA_CONTEXT_SIZE || "2048"),
            batchSize: parseInt(process.env.LLAMA_BATCH_SIZE || "512"),
        };
    }

    public static getInstance(): LangChainService {
        if (!LangChainService.instance) {
            LangChainService.instance = new LangChainService();
        }
        return LangChainService.instance;
    }

    public async initialize(): Promise<void> {
        if (!this.llm) {
            const { createLlama } = require("node-llama-cpp");
            this.llm = await createLlama({
                modelPath: this.config.modelPath,
                threads: this.config.numThreads,
                contextSize: this.config.contextSize,
                batchSize: this.config.batchSize,
            });
        }
    }

    public async generateMathQuestion(
        type: string,
        grade: number,
        difficulty: string
    ): Promise<string> {
        if (!this.llm) {
            throw new Error("LLM not initialized");
        }

        const prompt = this.buildQuestionPrompt(type, grade, difficulty);
        const response = await this.llm.completion({
            prompt,
            maxTokens: 200,
            temperature: 0.7,
            topP: 0.9,
            stopSequences: ["Question:", "Answer:"],
        });
        return this.parseResponse(response.text);
    }

    public async generateFeedback(
        question: string,
        studentAnswer: number,
        correctAnswer: number,
        grade: number
    ): Promise<string> {
        if (!this.llm) {
            throw new Error("LLM not initialized");
        }

        const prompt = this.buildFeedbackPrompt(
            question,
            studentAnswer,
            correctAnswer,
            grade
        );
        const response = await this.llm.completion({
            prompt,
            maxTokens: 150,
            temperature: 0.8,
            topP: 0.9,
            stopSequences: ["Student:", "Feedback:"],
        });
        return this.parseResponse(response.text);
    }

    private buildQuestionPrompt(
        type: string,
        grade: number,
        difficulty: string
    ): string {
        return `Generate a grade ${grade} ${difficulty} level math question of type ${type}.
        The question should be clear and appropriate for the grade level.
        Follow these rules:
        1. Use age-appropriate numbers and concepts
        2. Keep the language simple and clear
        3. Include the correct answer in your response
        4. Format: Question: [your question] Answer: [correct answer]`;
    }

    private buildFeedbackPrompt(
        question: string,
        studentAnswer: number,
        correctAnswer: number,
        grade: number
    ): string {
        return `For a grade ${grade} student who answered ${studentAnswer} to the question "${question}"
        where the correct answer is ${correctAnswer}, provide constructive feedback.
        The feedback should be:
        1. Age-appropriate and encouraging
        2. Explain why the answer is correct or incorrect
        3. If incorrect, provide a hint or strategy to solve similar problems
        4. Keep it concise (2-3 sentences)`;
    }

    private parseResponse(response: string): string {
        // Clean up and validate the response
        return response.trim();
    }
}

// Export a singleton instance
export const langChainService = LangChainService.getInstance();
