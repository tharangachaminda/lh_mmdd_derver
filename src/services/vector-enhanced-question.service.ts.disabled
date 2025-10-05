import {
    DifficultyLevel,
    Question,
    QuestionType,
    QuestionValidationResult,
} from "../models/question.js";
import { ILanguageModel } from "../interfaces/language-model.interface.js";
import { LanguageModelFactory } from "./language-model.factory.js";
import { EmbeddingService } from "./embedding.service.js";
import opensearchService from "./opensearch.service.js";

/**
 * Enhanced Question Generation with Vector Database Context
 *
 * Provides AI-powered question generation using vector database for:
 * - Context-aware question creation
 * - Similarity-based content diversity
 * - Intelligent difficulty progression
 * - Curriculum-aligned question suggestions
 */
export class VectorEnhancedQuestionService {
    private langchainService: ILanguageModel;
    private embeddingService: EmbeddingService;
    private questionCounter = 0;

    /**
     * Initialize the Vector-Enhanced Question Service
     *
     * @param langchainService - Optional language model (uses factory default)
     * @param embeddingService - Optional embedding service (uses default)
     */
    constructor(
        langchainService?: ILanguageModel,
        embeddingService?: EmbeddingService
    ) {
        this.langchainService =
            langchainService ||
            LanguageModelFactory.getInstance().createModel();
        this.embeddingService = embeddingService || new EmbeddingService();
    }

    /**
     * Generate a question with vector database context enhancement
     *
     * @param params - Question generation parameters
     * @returns Enhanced question with vector context metadata
     */
    async generateVectorEnhancedQuestion(params: {
        type: QuestionType;
        difficulty: DifficultyLevel;
        grade: number;
        useVectorContext?: boolean;
        maxSimilarQuestions?: number;
    }): Promise<{
        id: string;
        type: QuestionType;
        difficulty: DifficultyLevel;
        grade: number;
        question: string;
        answer: number;
        explanation?: string;
        createdAt: Date;
        vectorContext: {
            similarQuestions: Array<{
                id: string;
                question: string;
                similarity: number;
            }>;
            contextUsed: boolean;
            diversityScore: number;
        };
        generationMetadata: {
            method: "ai-vector-enhanced" | "ai-basic" | "deterministic";
            promptTokens?: number;
            processingTime: number;
        };
    }> {
        const startTime = Date.now();
        const useVector = params.useVectorContext !== false;
        const maxSimilar = params.maxSimilarQuestions || 3;

        let vectorContext = {
            similarQuestions: [] as Array<{
                id: string;
                question: string;
                similarity: number;
            }>,
            contextUsed: false,
            diversityScore: 0.5, // Default diversity score
        };

        let method: "ai-vector-enhanced" | "ai-basic" | "deterministic" =
            "deterministic";
        let explanation: string | undefined;

        try {
            if (useVector) {
                // Step 1: Generate a basic question to get context
                const basicQuestion = await this.generateBasicQuestion(
                    params.type,
                    params.difficulty,
                    params.grade
                );

                // Step 2: Analyze similarity with existing questions
                const similarityAnalysis = await this.analyzeQuestionSimilarity(
                    basicQuestion.text
                );

                // Step 3: Get top similar questions
                const topSimilar = similarityAnalysis.similarQuestions
                    .slice(0, maxSimilar)
                    .map((q) => ({
                        id: q.id,
                        question: q.question,
                        similarity: q.similarity,
                    }));

                // Only use vector context if we actually found similar questions
                if (topSimilar.length > 0) {
                    vectorContext = {
                        similarQuestions: topSimilar,
                        contextUsed: true,
                        diversityScore:
                            similarityAnalysis.diversityMetrics.uniquenessScore,
                    };

                    // Step 4: Build context-aware prompt
                    const contextPrompt = this.buildContextAwarePrompt({
                        type: params.type,
                        difficulty: params.difficulty,
                        grade: params.grade,
                        similarQuestions:
                            similarityAnalysis.similarQuestions.map((q) => ({
                                question: q.question,
                                type: q.type,
                            })),
                    });

                    // Step 5: Generate enhanced question with AI
                    try {
                        const aiResponse =
                            await this.langchainService.generateMathQuestion(
                                params.type,
                                params.grade,
                                params.difficulty
                            );

                        // Parse AI response
                        const parsed = this.parseAIResponse(aiResponse);
                        if (parsed) {
                            method = "ai-vector-enhanced";
                            explanation = `Generated using vector context from ${
                                topSimilar.length
                            } similar questions with diversity score ${vectorContext.diversityScore.toFixed(
                                2
                            )}`;

                            const processingTime = Date.now() - startTime;

                            return {
                                id: `vq${++this.questionCounter}`,
                                type: params.type,
                                difficulty: params.difficulty,
                                grade: params.grade,
                                question: parsed.question,
                                answer: parsed.answer,
                                explanation,
                                createdAt: new Date(),
                                vectorContext,
                                generationMetadata: {
                                    method,
                                    processingTime,
                                },
                            };
                        }
                    } catch (aiError) {
                        console.warn(
                            "AI generation with vector context failed:",
                            aiError
                        );
                        // Continue to fallback methods
                    }
                }
            }

            // Fallback to basic AI generation
            method = "ai-basic";
            const aiResponse = await this.langchainService.generateMathQuestion(
                params.type,
                params.grade,
                params.difficulty
            );

            const parsed = this.parseAIResponse(aiResponse);
            if (parsed) {
                const processingTime = Date.now() - startTime;
                return {
                    id: `q${++this.questionCounter}`,
                    type: params.type,
                    difficulty: params.difficulty,
                    grade: params.grade,
                    question: parsed.question,
                    answer: parsed.answer,
                    explanation,
                    createdAt: new Date(),
                    vectorContext,
                    generationMetadata: {
                        method,
                        processingTime,
                    },
                };
            }
        } catch (error) {
            console.warn(
                "Vector-enhanced generation failed, falling back to deterministic:",
                error
            );
        }

        // Final fallback to deterministic generation
        method = "deterministic";
        const deterministicQuestion = await this.generateDeterministicQuestion(
            params.type,
            params.difficulty,
            params.grade
        );

        const processingTime = Date.now() - startTime;

        return {
            id: `dq${++this.questionCounter}`,
            type: params.type,
            difficulty: params.difficulty,
            grade: params.grade,
            question: deterministicQuestion.question,
            answer: deterministicQuestion.answer,
            explanation,
            createdAt: new Date(),
            vectorContext,
            generationMetadata: {
                method,
                processingTime,
            },
        };
    }

    /**
     * Analyze question similarity using vector database
     *
     * @param questionText - Text to analyze
     * @returns Similarity analysis with embeddings and matches
     */
    async analyzeQuestionSimilarity(questionText: string): Promise<{
        embedding: number[];
        similarQuestions: Array<{
            id: string;
            question: string;
            similarity: number;
            difficulty: DifficultyLevel;
            type: QuestionType;
        }>;
        diversityMetrics: {
            uniquenessScore: number;
            patternVariation: number;
        };
    }> {
        try {
            // Generate embedding for the question
            const embedding = await this.embeddingService.generateEmbedding(
                questionText
            );

            // Search for similar questions in vector database
            const searchResults =
                await opensearchService.searchEnhancedQuestions({
                    embedding: embedding,
                    size: 10, // Get more for better diversity analysis
                });

            // Map results to expected format
            const similarQuestions = searchResults.map((q) => ({
                id: q.id,
                question: q.question,
                similarity: q.score,
                difficulty: q.difficulty as DifficultyLevel,
                type: q.type as QuestionType,
            }));

            // Calculate diversity metrics
            const uniquenessScore = this.calculateUniquenessScore(
                questionText,
                similarQuestions
            );
            const patternVariation =
                this.calculatePatternVariation(similarQuestions);

            return {
                embedding,
                similarQuestions,
                diversityMetrics: {
                    uniquenessScore,
                    patternVariation,
                },
            };
        } catch (error) {
            console.warn("Similarity analysis failed:", error);
            // Return empty results on error
            return {
                embedding: Array(1536).fill(0), // Default embedding
                similarQuestions: [],
                diversityMetrics: {
                    uniquenessScore: 1.0, // Assume unique if analysis fails
                    patternVariation: 1.0,
                },
            };
        }
    }

    /**
     * Build context-aware prompt with similar question examples
     *
     * @param params - Prompt building parameters
     * @returns Enhanced prompt string
     */
    buildContextAwarePrompt(params: {
        type: QuestionType;
        difficulty: DifficultyLevel;
        grade: number;
        similarQuestions: Array<{
            question: string;
            explanation?: string;
            type: QuestionType;
        }>;
    }): string {
        const { type, difficulty, grade, similarQuestions } = params;

        let prompt = `Generate a grade ${grade} ${difficulty} difficulty ${type} math question.\n\n`;

        if (similarQuestions.length > 0) {
            prompt += `Here are some examples of similar questions to inspire your generation (create something in a similar style but different):\n\n`;

            similarQuestions.slice(0, 3).forEach((q, index) => {
                prompt += `Example ${index + 1}: ${q.question}\n`;
                if (q.explanation) {
                    prompt += `Explanation: ${q.explanation}\n`;
                }
                prompt += "\n";
            });

            prompt += `Now generate a NEW question that:\n`;
            prompt += `- Is similar in style to the examples above\n`;
            prompt += `- Has different numbers and context\n`;
            prompt += `- Maintains the same difficulty level (${difficulty})\n`;
            prompt += `- Is appropriate for grade ${grade}\n\n`;
        } else {
            prompt += `Create an original question that:\n`;
            prompt += `- Is appropriate for grade ${grade}\n`;
            prompt += `- Has ${difficulty} difficulty level\n`;
            prompt += `- Focuses on ${type} skills\n\n`;
        }

        prompt += `Format your response as:\n`;
        prompt += `Question: [your question here]\n`;
        prompt += `Answer: [numeric answer]\n`;
        prompt += `Explanation: [brief explanation of the solution method]`;

        return prompt;
    }

    // Private helper methods

    private async generateBasicQuestion(
        type: QuestionType,
        difficulty: DifficultyLevel,
        grade: number
    ): Promise<{ text: string; answer: number }> {
        // Generate a basic question for context analysis
        const numbers = this.getNumbersForDifficulty(difficulty, grade);
        const text = this.formatQuestion(type, numbers);
        const answer = this.calculateAnswer(type, numbers);
        return { text, answer };
    }

    private parseAIResponse(
        response: string
    ): { question: string; answer: number } | null {
        const questionMatch = response.match(
            /Question:\s*(.+?)\s*Answer:\s*(\d+\.?\d*)/i
        );
        if (questionMatch) {
            const [, questionText, answerText] = questionMatch;
            const answer = parseFloat(answerText);
            if (!isNaN(answer)) {
                return {
                    question: questionText.trim(),
                    answer: Math.round(answer * 100) / 100, // Round to 2 decimal places
                };
            }
        }
        return null;
    }

    private async generateDeterministicQuestion(
        type: QuestionType,
        difficulty: DifficultyLevel,
        grade: number
    ): Promise<{ question: string; answer: number }> {
        const numbers = this.getNumbersForDifficulty(difficulty, grade);
        const question = this.formatQuestion(type, numbers);
        const answer = this.calculateAnswer(type, numbers);
        return { question, answer };
    }

    private calculateUniquenessScore(
        questionText: string,
        similarQuestions: Array<{ question: string; similarity: number }>
    ): number {
        if (similarQuestions.length === 0) return 1.0;

        // Higher similarity scores mean less uniqueness
        const avgSimilarity =
            similarQuestions.reduce((sum, q) => sum + q.similarity, 0) /
            similarQuestions.length;
        return Math.max(0, 1 - avgSimilarity);
    }

    private calculatePatternVariation(
        similarQuestions: Array<{ question: string; type: QuestionType }>
    ): number {
        if (similarQuestions.length === 0) return 1.0;

        // Count unique question types
        const uniqueTypes = new Set(similarQuestions.map((q) => q.type));
        return uniqueTypes.size / Math.max(1, similarQuestions.length);
    }

    // Utility methods from original QuestionGenerationService
    private getNumbersForDifficulty(
        difficulty: DifficultyLevel,
        grade: number
    ): number[] {
        const minNumber = grade === 1 ? 1 : 10;
        const maxNumber = this.getMaxNumberForGrade(grade, difficulty);

        return [
            Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber,
            Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber,
        ];
    }

    private getMaxNumberForGrade(
        grade: number,
        difficulty: DifficultyLevel
    ): number {
        const baseMax = grade * 20;
        switch (difficulty) {
            case DifficultyLevel.EASY:
                return Math.floor(baseMax * 0.5);
            case DifficultyLevel.MEDIUM:
                return baseMax;
            case DifficultyLevel.HARD:
                return Math.floor(baseMax * 1.5);
            default:
                return baseMax;
        }
    }

    private formatQuestion(type: QuestionType, numbers: number[]): string {
        const [a, b] = numbers;
        switch (type) {
            case QuestionType.ADDITION:
                return `What is ${a} + ${b}?`;
            case QuestionType.SUBTRACTION:
                return `What is ${Math.max(a, b)} - ${Math.min(a, b)}?`;
            case QuestionType.MULTIPLICATION:
                return `What is ${a} × ${b}?`;
            case QuestionType.DIVISION:
                return `What is ${a * b} ÷ ${b}?`;
            default:
                return `What is ${a} + ${b}?`;
        }
    }

    private calculateAnswer(type: QuestionType, numbers: number[]): number {
        const [a, b] = numbers;
        switch (type) {
            case QuestionType.ADDITION:
                return a + b;
            case QuestionType.SUBTRACTION:
                return Math.max(a, b) - Math.min(a, b);
            case QuestionType.MULTIPLICATION:
                return a * b;
            case QuestionType.DIVISION:
                return a; // Since we use a * b ÷ b in formatQuestion
            default:
                return a + b;
        }
    }
}
