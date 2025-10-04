/**
 * Embedding Service
 *
 * Service for generating vector embeddings for questions and curriculum content.
 * Integrates with various embedding providers including Ollama, OpenAI, and HuggingFace.
 *
 * @fileoverview Vector embedding generation service
 * @version 1.0.0
 */

import { createHash } from "crypto";

/**
 * Embedding provider configuration
 */
interface EmbeddingConfig {
    provider: "ollama" | "openai" | "huggingface";
    model: string;
    dimensions: number;
    baseUrl?: string;
    apiKey?: string;
    maxTokens?: number;
    batchSize?: number;
}

/**
 * Embedding result
 */
interface EmbeddingResult {
    embedding: number[];
    tokens: number;
    model: string;
    hash: string;
}

/**
 * Batch embedding result
 */
interface BatchEmbeddingResult {
    embeddings: EmbeddingResult[];
    totalTokens: number;
    processingTime: number;
    errors: Array<{
        index: number;
        text: string;
        error: string;
    }>;
}

/**
 * Embedding cache entry
 */
interface CacheEntry {
    embedding: number[];
    model: string;
    timestamp: number;
    hash: string;
}

/**
 * Embedding Service class
 */
export class EmbeddingService {
    private config: EmbeddingConfig;
    private cache: Map<string, CacheEntry>;
    private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

    constructor(config: Partial<EmbeddingConfig> = {}) {
        this.config = {
            provider: "ollama",
            model: "nomic-embed-text",
            dimensions: 768,
            baseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
            apiKey: process.env.OPENAI_API_KEY,
            maxTokens: 8192,
            batchSize: 10,
            ...config,
        };

        this.cache = new Map();
        console.log(
            `🔧 Embedding service initialized with ${this.config.provider}:${this.config.model}`
        );
    }

    /**
     * Generate embedding for a single text
     */
    async generateEmbedding(text: string): Promise<number[]> {
        const hash = this.generateTextHash(text);

        // Check cache first
        const cached = this.getCachedEmbedding(hash);
        if (cached) {
            console.log(
                `📋 Using cached embedding for text hash: ${hash.substring(
                    0,
                    8
                )}...`
            );
            return cached.embedding;
        }

        try {
            const result = await this.generateSingleEmbedding(text, hash);

            // Cache the result
            this.cacheEmbedding(hash, result);

            return result.embedding;
        } catch (error) {
            console.error(`❌ Failed to generate embedding: ${error}`);
            throw error;
        }
    }

    /**
     * Generate embeddings for multiple texts in batch
     */
    async generateBatchEmbeddings(
        texts: string[]
    ): Promise<BatchEmbeddingResult> {
        const startTime = Date.now();
        const results: EmbeddingResult[] = [];
        const errors: Array<{ index: number; text: string; error: string }> =
            [];
        let totalTokens = 0;

        console.log(
            `📦 Generating embeddings for ${texts.length} texts in batches of ${this.config.batchSize}...`
        );

        // Process in batches
        for (let i = 0; i < texts.length; i += this.config.batchSize!) {
            const batch = texts.slice(i, i + this.config.batchSize!);
            const batchStartIndex = i;

            console.log(
                `📝 Processing batch ${
                    Math.floor(i / this.config.batchSize!) + 1
                }/${Math.ceil(texts.length / this.config.batchSize!)}...`
            );

            // Process batch items individually (some providers don't support true batch processing)
            for (let j = 0; j < batch.length; j++) {
                const textIndex = batchStartIndex + j;
                const text = batch[j];

                try {
                    const embedding = await this.generateEmbedding(text);
                    results[textIndex] = {
                        embedding,
                        tokens: this.estimateTokens(text),
                        model: this.config.model,
                        hash: this.generateTextHash(text),
                    };
                    totalTokens += results[textIndex].tokens;
                } catch (error) {
                    console.error(
                        `❌ Error generating embedding for text ${textIndex}: ${error}`
                    );
                    errors.push({
                        index: textIndex,
                        text: text.substring(0, 100) + "...",
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                }
            }

            // Add small delay between batches to avoid rate limiting
            if (i + this.config.batchSize! < texts.length) {
                await new Promise((resolve) => setTimeout(resolve, 100));
            }
        }

        const processingTime = Date.now() - startTime;

        console.log(
            `✅ Batch embedding completed: ${results.length} successful, ${errors.length} failed, ${processingTime}ms`
        );

        return {
            embeddings: results,
            totalTokens,
            processingTime,
            errors,
        };
    }

    /**
     * Generate embedding for question content (combines question, answer, explanation)
     */
    async generateQuestionEmbedding(
        question: string,
        answer: string,
        explanation?: string,
        keywords?: string[]
    ): Promise<number[]> {
        // Combine all relevant text for embedding
        const combinedText = [
            question,
            answer,
            explanation || "",
            keywords ? keywords.join(" ") : "",
        ]
            .filter((text) => text.trim())
            .join(" ");

        return this.generateEmbedding(combinedText);
    }

    /**
     * Generate single embedding based on provider
     */
    private async generateSingleEmbedding(
        text: string,
        hash: string
    ): Promise<EmbeddingResult> {
        switch (this.config.provider) {
            case "ollama":
                return this.generateOllamaEmbedding(text, hash);
            case "openai":
                return this.generateOpenAIEmbedding(text, hash);
            case "huggingface":
                return this.generateHuggingFaceEmbedding(text, hash);
            default:
                throw new Error(
                    `Unsupported embedding provider: ${this.config.provider}`
                );
        }
    }

    /**
     * Generate embedding using Ollama
     */
    private async generateOllamaEmbedding(
        text: string,
        hash: string
    ): Promise<EmbeddingResult> {
        const response = await fetch(`${this.config.baseUrl}/api/embeddings`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: this.config.model,
                prompt: text,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `Ollama embedding failed: ${response.status} - ${errorText}`
            );
        }

        const data = await response.json();

        if (!data.embedding || !Array.isArray(data.embedding)) {
            throw new Error("Invalid embedding response from Ollama");
        }

        return {
            embedding: data.embedding,
            tokens: this.estimateTokens(text),
            model: this.config.model,
            hash,
        };
    }

    /**
     * Generate embedding using OpenAI
     */
    private async generateOpenAIEmbedding(
        text: string,
        hash: string
    ): Promise<EmbeddingResult> {
        if (!this.config.apiKey) {
            throw new Error("OpenAI API key is required for OpenAI embeddings");
        }

        const response = await fetch("https://api.openai.com/v1/embeddings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${this.config.apiKey}`,
            },
            body: JSON.stringify({
                model: this.config.model,
                input: text,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `OpenAI embedding failed: ${response.status} - ${errorText}`
            );
        }

        const data = await response.json();

        if (!data.data || !data.data[0] || !data.data[0].embedding) {
            throw new Error("Invalid embedding response from OpenAI");
        }

        return {
            embedding: data.data[0].embedding,
            tokens: data.usage?.total_tokens || this.estimateTokens(text),
            model: this.config.model,
            hash,
        };
    }

    /**
     * Generate embedding using HuggingFace
     */
    private async generateHuggingFaceEmbedding(
        text: string,
        hash: string
    ): Promise<EmbeddingResult> {
        if (!this.config.apiKey) {
            throw new Error(
                "HuggingFace API key is required for HuggingFace embeddings"
            );
        }

        const response = await fetch(
            `https://api-inference.huggingface.co/pipeline/feature-extraction/${this.config.model}`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.config.apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    inputs: text,
                    options: {
                        wait_for_model: true,
                    },
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `HuggingFace embedding failed: ${response.status} - ${errorText}`
            );
        }

        const embedding = await response.json();

        if (!Array.isArray(embedding)) {
            throw new Error("Invalid embedding response from HuggingFace");
        }

        return {
            embedding,
            tokens: this.estimateTokens(text),
            model: this.config.model,
            hash,
        };
    }

    /**
     * Generate hash for text content
     */
    private generateTextHash(text: string): string {
        return createHash("sha256")
            .update(text + this.config.model)
            .digest("hex");
    }

    /**
     * Estimate token count for text
     */
    private estimateTokens(text: string): number {
        // Rough estimation: ~4 characters per token
        return Math.ceil(text.length / 4);
    }

    /**
     * Get cached embedding if available and not expired
     */
    private getCachedEmbedding(hash: string): CacheEntry | null {
        const entry = this.cache.get(hash);

        if (!entry) {
            return null;
        }

        // Check if cache entry is expired
        if (Date.now() - entry.timestamp > this.CACHE_TTL) {
            this.cache.delete(hash);
            return null;
        }

        // Check if model matches
        if (entry.model !== this.config.model) {
            this.cache.delete(hash);
            return null;
        }

        return entry;
    }

    /**
     * Cache embedding result
     */
    private cacheEmbedding(hash: string, result: EmbeddingResult): void {
        const entry: CacheEntry = {
            embedding: result.embedding,
            model: result.model,
            timestamp: Date.now(),
            hash: result.hash,
        };

        this.cache.set(hash, entry);

        // Clean up old cache entries periodically
        if (this.cache.size > 10000) {
            this.cleanupCache();
        }
    }

    /**
     * Clean up expired cache entries
     */
    private cleanupCache(): void {
        const now = Date.now();
        let cleaned = 0;

        for (const [hash, entry] of this.cache.entries()) {
            if (now - entry.timestamp > this.CACHE_TTL) {
                this.cache.delete(hash);
                cleaned++;
            }
        }

        console.log(`🧹 Cleaned up ${cleaned} expired cache entries`);
    }

    /**
     * Get cache statistics
     */
    getCacheStats(): { size: number; hitRate: number; model: string } {
        return {
            size: this.cache.size,
            hitRate: 0, // Would need to track hits/misses to calculate
            model: this.config.model,
        };
    }

    /**
     * Clear embedding cache
     */
    clearCache(): void {
        this.cache.clear();
        console.log("🗑️  Embedding cache cleared");
    }

    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<EmbeddingConfig>): void {
        const oldModel = this.config.model;
        this.config = { ...this.config, ...newConfig };

        // Clear cache if model changed
        if (oldModel !== this.config.model) {
            this.clearCache();
            console.log(
                `🔄 Model changed from ${oldModel} to ${this.config.model}, cache cleared`
            );
        }
    }
}
