import { OllamaLanguageModel } from "../services/ollama-language.service.js";
import { jest } from "@jest/globals";

const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>;
global.fetch = mockFetch;

describe("OllamaLanguageModel", () => {
    let service: OllamaLanguageModel;

    beforeEach(() => {
        service = OllamaLanguageModel.getInstance();
        jest.clearAllMocks();

        // Default mock response for a successful fetch
        mockFetch.mockImplementation(
            async () =>
                ({
                    ok: true,
                    json: async () => ({}),
                    statusText: "OK",
                } as Response)
        );
    });

    describe("initialization", () => {
        it("should create singleton instance", () => {
            const instance1 = OllamaLanguageModel.getInstance();
            const instance2 = OllamaLanguageModel.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe("generateEmbedding", () => {
        it("should call Ollama API with correct parameters", async () => {
            // Arrange
            const mockEmbedding = new Array(1536).fill(0.1);
            mockFetch.mockImplementationOnce(
                async () =>
                    ({
                        ok: true,
                        json: async () => ({ embedding: mockEmbedding }),
                        statusText: "OK",
                    } as Response)
            );

            // Act
            const result = await service.generateEmbedding("test text");

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(
                "http://127.0.0.1:11434/api/embeddings",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama2",
                        prompt: "test text",
                    }),
                }
            );
            expect(result).toEqual(mockEmbedding);
        });

        it("should throw error when API call fails", async () => {
            // Arrange
            mockFetch.mockImplementationOnce(
                async () =>
                    ({
                        ok: false,
                        statusText: "Internal Server Error",
                    } as Response)
            );

            // Act & Assert
            await expect(
                service.generateEmbedding("test text")
            ).rejects.toThrow(
                "Failed to generate embedding: Internal Server Error"
            );
        });
    });

    describe("generateMathQuestion", () => {
        it("should call Ollama API with correct prompt", async () => {
            // Arrange
            const expectedResponse = "Question: What is 2+2? Answer: 4";
            mockFetch.mockImplementationOnce(
                async () =>
                    ({
                        ok: true,
                        json: async () => ({ response: expectedResponse }),
                        statusText: "OK",
                    } as Response)
            );

            // Act
            const result = await service.generateMathQuestion(
                "addition",
                3,
                "easy"
            );

            // Assert
            const expectedPrompt =
                "Generate a grade 3 easy difficulty addition math question.\nFormat: Question: [question] Answer: [numeric answer]";
            expect(mockFetch).toHaveBeenCalledWith(
                "http://127.0.0.1:11434/api/generate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama2",
                        prompt: expectedPrompt,
                        stream: false,
                    }),
                }
            );
            expect(result).toBe(expectedResponse);
        });
    });

    describe("generateFeedback", () => {
        it("should call Ollama API with correct prompt", async () => {
            // Arrange
            const expectedResponse = "Good try! The correct answer is 4.";
            mockFetch.mockImplementationOnce(
                async () =>
                    ({
                        ok: true,
                        json: async () => ({ response: expectedResponse }),
                        statusText: "OK",
                    } as Response)
            );

            // Act
            const result = await service.generateFeedback("2+2", 5, 4, 3);

            // Assert
            const expectedPrompt =
                'For a grade 3 student answering "2+2":\n- Student\'s answer: 5\n- Correct answer: 4\nProvide brief, encouraging feedback explaining why the answer is correct/incorrect.';
            expect(mockFetch).toHaveBeenCalledWith(
                "http://127.0.0.1:11434/api/generate",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama2",
                        prompt: expectedPrompt,
                        stream: false,
                    }),
                }
            );
            expect(result).toBe(expectedResponse);
        });
    });

    describe("error handling", () => {
        it("should throw error when API returns non-OK response", async () => {
            // Arrange
            mockFetch.mockImplementationOnce(
                async () =>
                    ({
                        ok: false,
                        statusText: "Bad Request",
                    } as Response)
            );

            // Act & Assert
            await expect(
                service.generateMathQuestion("addition", 3, "easy")
            ).rejects.toThrow("Failed to generate completion: Bad Request");
        });
    });

    describe("environment configuration", () => {
        const originalEnv = process.env;

        beforeEach(() => {
            process.env = { ...originalEnv };
            OllamaLanguageModel.resetInstance();
        });

        afterEach(() => {
            process.env = originalEnv;
            OllamaLanguageModel.resetInstance();
        });

        it("should use custom base URL from environment", async () => {
            // Arrange
            process.env.OLLAMA_BASE_URL = "http://custom-ollama:11434";
            const customService = OllamaLanguageModel.getInstance();
            mockFetch.mockImplementationOnce(
                async () =>
                    ({
                        ok: true,
                        json: async () => ({ embedding: [] }),
                        statusText: "OK",
                    } as Response)
            );

            // Act
            await customService.generateEmbedding("test");

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(
                `${process.env.OLLAMA_BASE_URL}/api/embeddings`,
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama2",
                        prompt: "test",
                    }),
                })
            );
        });

        it("should use custom model name from environment", async () => {
            // Arrange
            process.env.OLLAMA_MODEL_NAME = "llama2-uncensored";
            const customService = OllamaLanguageModel.getInstance();
            mockFetch.mockImplementationOnce(
                async () =>
                    ({
                        ok: true,
                        json: async () => ({ embedding: [] }),
                        statusText: "OK",
                    } as Response)
            );

            // Act
            await customService.generateEmbedding("test");

            // Assert
            expect(mockFetch).toHaveBeenCalledWith(
                "http://127.0.0.1:11434/api/embeddings",
                expect.objectContaining({
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: "llama2-uncensored",
                        prompt: "test",
                    }),
                })
            );
        });
    });
});
