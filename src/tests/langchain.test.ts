import { LangChainService } from "../services/langchain.service";
import path from "path";

jest.mock("node-llama-cpp", () => ({
    createLlama: jest.fn().mockResolvedValue({
        completion: jest.fn().mockResolvedValue({
            text: "Question: What is 5 + 7? Answer: 12",
        }),
    }),
}));

describe("LangChainService", () => {
    let service: LangChainService;

    beforeEach(async () => {
        // Reset environment variables
        process.env.LLAMA_MODEL_PATH = path.join(__dirname, "test-model.gguf");
        process.env.LLAMA_NUM_THREADS = "4";
        process.env.LLAMA_CONTEXT_SIZE = "2048";
        process.env.LLAMA_BATCH_SIZE = "512";

        service = LangChainService.getInstance();
        await service.initialize();
    });

    describe("generateMathQuestion", () => {
        it("should generate a math question with specified parameters", async () => {
            const question = await service.generateMathQuestion(
                "addition",
                5,
                "medium"
            );
            expect(question).toContain("Question:");
            expect(question).toContain("Answer:");
        });

        it("should throw error if LLM is not initialized", async () => {
            // @ts-ignore - Accessing private property for testing
            service["llm"] = null;
            await expect(
                service.generateMathQuestion("addition", 5, "medium")
            ).rejects.toThrow("LLM not initialized");
        });
    });

    describe("generateFeedback", () => {
        it("should generate feedback for student answer", async () => {
            const feedback = await service.generateFeedback(
                "What is 5 + 7?",
                10,
                12,
                5
            );
            expect(feedback).toBeTruthy();
            expect(typeof feedback).toBe("string");
        });

        it("should throw error if LLM is not initialized", async () => {
            // @ts-ignore - Accessing private property for testing
            service["llm"] = null;
            await expect(
                service.generateFeedback("What is 5 + 7?", 10, 12, 5)
            ).rejects.toThrow("LLM not initialized");
        });
    });

    describe("prompt building", () => {
        it("should build a question prompt with correct format", () => {
            // @ts-ignore - Accessing private method for testing
            const prompt = service["buildQuestionPrompt"](
                "addition",
                5,
                "medium"
            );
            expect(prompt).toContain("grade 5");
            expect(prompt).toContain("medium");
            expect(prompt).toContain("addition");
            expect(prompt).toContain("Format: Question:");
        });

        it("should build a feedback prompt with correct format", () => {
            // @ts-ignore - Accessing private method for testing
            const prompt = service["buildFeedbackPrompt"](
                "What is 5 + 7?",
                10,
                12,
                5
            );
            expect(prompt).toContain("grade 5");
            expect(prompt).toContain("10");
            expect(prompt).toContain("12");
            expect(prompt).toContain("What is 5 + 7?");
        });
    });
});
