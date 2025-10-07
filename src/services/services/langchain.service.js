import { getLlama } from "node-llama-cpp";
export class LangChainService {
    constructor() {
        this.model = null;
        this.context = null;
    }
    async initialize() {
        await this.initializeModel();
    }
    async generateMathQuestion(type, grade, difficulty) {
        await this.initializeModel();
        if (!this.model) {
            throw new Error("LLM not initialized");
        }
        const prompt = this.buildQuestionPrompt(type, grade, difficulty);
        const { text } = await this.model.completion(prompt);
        return text;
    }
    async generateFeedback(question, studentAnswer, correctAnswer, grade) {
        await this.initializeModel();
        if (!this.model) {
            throw new Error("LLM not initialized");
        }
        const prompt = this.buildFeedbackPrompt(question, studentAnswer, correctAnswer, grade);
        const { text } = await this.model.completion(prompt);
        return text;
    }
    buildQuestionPrompt(type, grade, difficulty) {
        return `Generate a grade ${grade} ${difficulty} difficulty ${type} math question.\nFormat: Question: [question] Answer: [numeric answer]`;
    }
    buildFeedbackPrompt(question, studentAnswer, correctAnswer, grade) {
        return `For a grade ${grade} student answering "${question}":
- Student's answer: ${studentAnswer}
- Correct answer: ${correctAnswer}
Provide brief, encouraging feedback explaining why the answer is correct/incorrect.`;
    }
    static getInstance() {
        if (!LangChainService.instance) {
            LangChainService.instance = new LangChainService();
        }
        return LangChainService.instance;
    }
    async initializeModel() {
        if (!this.model) {
            const llama = await getLlama();
            this.model = await llama.loadModel({
                modelPath: process.env.LLAMA_MODEL_PATH,
                gpuLayers: 0,
            });
            this.context = await this.model.createEmbeddingContext();
        }
    }
    async generateEmbedding(text) {
        await this.initializeModel();
        const result = await this.context.getEmbeddingFor(text);
        return Array.from(result.vector);
    }
    async cleanup() {
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
