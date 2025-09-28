import axios from "axios";

/**
 * Service for generating text embeddings using Ollama
 * Supports both single and batch embedding generation
 */
export class EmbeddingService {
    private readonly ollamaEndpoint: string;
    private readonly modelName: string;
    private readonly timeout: number;

    constructor(options?: {
        endpoint?: string;
        model?: string;
        timeout?: number;
    }) {
        this.ollamaEndpoint =
            options?.endpoint ||
            process.env.OLLAMA_ENDPOINT ||
            "http://localhost:11434";
        this.modelName =
            options?.model || process.env.EMBEDDING_MODEL || "nomic-embed-text";
        this.timeout = options?.timeout || 30000;
    }

    /**
     * Generate embedding for a single text input
     *
     * @param text - The text to generate embedding for
     * @returns Promise<number[]> - The embedding vector
     * @throws Error if embedding generation fails
     *
     * @example
     * ```typescript
     * const embedding = await embeddingService.generateEmbedding(
     *   'Calculate: 4,567 + 2,834. Addition problem requiring carrying.'
     * );
     * console.log(`Generated embedding with ${embedding.length} dimensions`);
     * ```
     */
    public async generateEmbedding(text: string): Promise<number[]> {
        try {
            // Handle empty text by using a default
            const inputText = text.trim() || "empty content";

            const response = await axios.post(
                `${this.ollamaEndpoint}/api/embeddings`,
                {
                    model: this.modelName,
                    prompt: inputText,
                },
                {
                    timeout: this.timeout,
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            if (!response.data?.embedding) {
                throw new Error(
                    "Invalid response format from embedding service"
                );
            }

            const embedding = response.data.embedding;

            // Validate embedding format
            if (!Array.isArray(embedding) || embedding.length === 0) {
                throw new Error("Invalid embedding format received");
            }

            // Ensure all values are numbers
            const validEmbedding = embedding.map((val: any) => {
                const num = parseFloat(val);
                if (isNaN(num)) {
                    throw new Error(`Invalid embedding value: ${val}`);
                }
                return num;
            });

            return validEmbedding;
        } catch (error: any) {
            if (error.code === "ECONNREFUSED") {
                throw new Error(
                    `Cannot connect to Ollama at ${this.ollamaEndpoint}. Please ensure Ollama is running.`
                );
            }
            if (error.response?.status === 404) {
                throw new Error(
                    `Model '${this.modelName}' not found. Please pull the model using: ollama pull ${this.modelName}`
                );
            }
            throw new Error(`Embedding generation failed: ${error.message}`);
        }
    }

    /**
     * Generate embeddings for multiple texts in batch
     * Processes texts in chunks to avoid overwhelming the service
     *
     * @param texts - Array of texts to generate embeddings for
     * @param chunkSize - Number of texts to process simultaneously (default: 5)
     * @returns Promise<number[][]> - Array of embedding vectors
     * @throws Error if batch processing fails
     *
     * @example
     * ```typescript
     * const texts = [
     *   'Addition problem: 123 + 456',
     *   'Subtraction problem: 789 - 234',
     *   'Multiplication problem: 12 × 34'
     * ];
     * const embeddings = await embeddingService.generateBatchEmbeddings(texts);
     * console.log(`Generated ${embeddings.length} embeddings`);
     * ```
     */
    public async generateBatchEmbeddings(
        texts: string[],
        chunkSize: number = 5
    ): Promise<number[][]> {
        if (texts.length === 0) {
            return [];
        }

        const results: number[][] = [];
        const errors: Array<{ index: number; error: string }> = [];

        // Process in chunks to avoid overwhelming the service
        for (let i = 0; i < texts.length; i += chunkSize) {
            const chunk = texts.slice(i, i + chunkSize);
            const chunkPromises = chunk.map(async (text, chunkIndex) => {
                const globalIndex = i + chunkIndex;
                try {
                    const embedding = await this.generateEmbedding(text);
                    return { index: globalIndex, embedding };
                } catch (error: any) {
                    errors.push({
                        index: globalIndex,
                        error: `Failed to generate embedding for text at index ${globalIndex}: ${error.message}`,
                    });
                    // Return a zero vector as fallback
                    return {
                        index: globalIndex,
                        embedding: new Array(1536).fill(0),
                    };
                }
            });

            const chunkResults = await Promise.all(chunkPromises);

            // Sort by index and extract embeddings
            chunkResults
                .sort((a, b) => a.index - b.index)
                .forEach((result) => {
                    results[result.index] = result.embedding;
                });

            // Add small delay between chunks to be respectful to the service
            if (i + chunkSize < texts.length) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }

        // Log errors if any occurred
        if (errors.length > 0) {
            console.warn(
                `Batch embedding generation completed with ${errors.length} errors:`,
                errors
            );
        }

        return results;
    }

    /**
     * Test connection to the embedding service
     *
     * @returns Promise<boolean> - True if connection successful
     *
     * @example
     * ```typescript
     * const isConnected = await embeddingService.testConnection();
     * if (isConnected) {
     *   console.log('Embedding service is ready');
     * } else {
     *   console.error('Cannot connect to embedding service');
     * }
     * ```
     */
    public async testConnection(): Promise<boolean> {
        try {
            // Test with a simple embedding request
            await this.generateEmbedding("test connection");
            return true;
        } catch (error: any) {
            console.error(
                "Embedding service connection test failed:",
                error.message
            );
            return false;
        }
    }

    /**
     * Get service information and capabilities
     *
     * @returns Promise<object> - Service information
     */
    public async getServiceInfo(): Promise<{
        endpoint: string;
        model: string;
        status: "connected" | "disconnected";
        modelInfo?: any;
    }> {
        try {
            // Try to get model information
            const response = await axios.get(
                `${this.ollamaEndpoint}/api/show`,
                {
                    params: { name: this.modelName },
                    timeout: 5000,
                }
            );

            return {
                endpoint: this.ollamaEndpoint,
                model: this.modelName,
                status: "connected",
                modelInfo: response.data,
            };
        } catch (error: any) {
            return {
                endpoint: this.ollamaEndpoint,
                model: this.modelName,
                status: "disconnected",
            };
        }
    }

    /**
     * Validate embedding dimensions match expected size
     *
     * @param embedding - The embedding to validate
     * @param expectedDimension - Expected dimension size (default: 1536)
     * @returns boolean - True if valid
     */
    public validateEmbedding(
        embedding: number[],
        expectedDimension: number = 1536
    ): boolean {
        return (
            Array.isArray(embedding) &&
            embedding.length === expectedDimension &&
            embedding.every((val) => typeof val === "number" && !isNaN(val))
        );
    }
}

// Create and export singleton instance
const embeddingService = new EmbeddingService();
export default embeddingService;
