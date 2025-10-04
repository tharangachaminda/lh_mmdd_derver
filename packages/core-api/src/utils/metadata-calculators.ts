/**
 * Metadata Calculation Utilities
 *
 * Optimized utility functions for calculating metadata, relevance scores,
 * and performance metrics across educational content generation services.
 *
 * @fileoverview Performance-optimized metadata calculations
 * @version 2.0.0 - Refactored and optimized
 */

import {
    MathematicsQuestionResult,
    VectorContext,
    VectorRetrievalMetrics,
} from "../types/service-interfaces.js";

/**
 * High-performance metadata calculator with caching and optimization
 */
export class MetadataCalculator {
    // Cache for repeated calculations
    private static calculationCache = new Map<string, number>();

    /**
     * Calculate average quality score with optimized caching
     */
    static calculateAverageQualityScore(
        questions: MathematicsQuestionResult[]
    ): number {
        if (questions.length === 0) return 0;

        const cacheKey = `quality_${questions
            .map((q) => q.metadata.qualityScore)
            .join("_")}`;

        if (this.calculationCache.has(cacheKey)) {
            return this.calculationCache.get(cacheKey)!;
        }

        const sum = questions.reduce(
            (acc, q) => acc + q.metadata.qualityScore,
            0
        );
        const average = Number((sum / questions.length).toFixed(3));

        this.calculationCache.set(cacheKey, average);
        return average;
    }

    /**
     * Calculate average relevance score with null safety
     */
    static calculateAverageRelevanceScore(
        questions: MathematicsQuestionResult[]
    ): number {
        const relevanceScores = questions
            .map((q) => q.metadata.relevanceScore)
            .filter((score): score is number => score !== undefined);

        if (relevanceScores.length === 0) return 0;

        const sum = relevanceScores.reduce((acc, score) => acc + score, 0);
        return Number((sum / relevanceScores.length).toFixed(3));
    }

    /**
     * Calculate average generation time with performance optimization
     */
    static calculateAverageGenerationTime(
        questions: MathematicsQuestionResult[]
    ): number {
        if (questions.length === 0) return 0;

        const sum = questions.reduce(
            (acc, q) => acc + q.metadata.generationTime,
            0
        );
        return Math.round(sum / questions.length);
    }

    /**
     * Extract unique services used with deduplication
     */
    static getUniqueServicesUsed(
        questions: MathematicsQuestionResult[]
    ): string[] {
        const services = new Set(questions.map((q) => q.metadata.serviceUsed));
        return Array.from(services);
    }

    /**
     * Extract and aggregate enhanced vector context with comprehensive metrics
     */
    static extractEnhancedVectorContext(
        questions: MathematicsQuestionResult[]
    ): VectorContext {
        if (questions.length === 0) {
            return {
                used: false,
                similarQuestionsFound: 0,
                curriculumAlignment: false,
            };
        }

        const firstContext = questions[0]?.metadata.vectorContext;
        if (!firstContext?.used) {
            return {
                used: false,
                similarQuestionsFound: 0,
                curriculumAlignment: false,
            };
        }

        // Optimized aggregation with single pass
        const aggregationResult = questions.reduce(
            (acc, question) => {
                const context = question.metadata.vectorContext;
                if (!context) return acc;

                acc.totalSimilarQuestions += context.similarQuestionsFound || 0;

                if (context.averageRelevanceScore !== undefined) {
                    acc.relevanceScores.push(context.averageRelevanceScore);
                }

                if (context.topRelevanceScore !== undefined) {
                    acc.topScores.push(context.topRelevanceScore);
                }

                if (context.retrievalMetrics) {
                    acc.metrics.push(context.retrievalMetrics);
                }

                return acc;
            },
            {
                totalSimilarQuestions: 0,
                relevanceScores: [] as number[],
                topScores: [] as number[],
                metrics: [] as VectorRetrievalMetrics[],
            }
        );

        return {
            used: true,
            similarQuestionsFound: aggregationResult.totalSimilarQuestions,
            curriculumAlignment: firstContext.curriculumAlignment,

            averageRelevanceScore:
                aggregationResult.relevanceScores.length > 0
                    ? Number(
                          (
                              aggregationResult.relevanceScores.reduce(
                                  (sum, score) => sum + score,
                                  0
                              ) / aggregationResult.relevanceScores.length
                          ).toFixed(3)
                      )
                    : undefined,

            topRelevanceScore:
                aggregationResult.topScores.length > 0
                    ? Math.max(...aggregationResult.topScores)
                    : undefined,

            retrievalMetrics: this.aggregateRetrievalMetrics(
                aggregationResult.metrics,
                firstContext.retrievalMetrics
            ),
        };
    }

    /**
     * Aggregate retrieval metrics with performance optimization
     */
    private static aggregateRetrievalMetrics(
        allMetrics: VectorRetrievalMetrics[],
        firstMetrics?: VectorRetrievalMetrics
    ): VectorRetrievalMetrics | undefined {
        if (allMetrics.length === 0 || !firstMetrics) return firstMetrics;

        // Single pass aggregation for performance
        const totals = allMetrics.reduce(
            (acc, metrics) => {
                acc.totalRetrieved += metrics.totalRetrieved || 0;
                acc.aboveThreshold += metrics.aboveThreshold || 0;
                acc.retrievalTime += metrics.retrievalTime || 0;

                if (metrics.contextSources) {
                    acc.allSources.push(...metrics.contextSources);
                }

                return acc;
            },
            {
                totalRetrieved: 0,
                aboveThreshold: 0,
                retrievalTime: 0,
                allSources: [] as string[],
            }
        );

        return {
            totalRetrieved: totals.totalRetrieved,
            aboveThreshold: totals.aboveThreshold,
            relevanceThreshold: firstMetrics.relevanceThreshold,
            retrievalTime: totals.retrievalTime,
            contextSources: [...new Set(totals.allSources)], // Deduplicate efficiently
        };
    }

    /**
     * Calculate performance metrics for service monitoring
     */
    static calculatePerformanceMetrics(
        questions: MathematicsQuestionResult[]
    ): {
        averageGenerationTime: number;
        questionsPerSecond: number;
        serviceDistribution: Record<string, number>;
        qualityDistribution: { high: number; medium: number; low: number };
        relevanceDistribution: { high: number; medium: number; low: number };
    } {
        if (questions.length === 0) {
            return {
                averageGenerationTime: 0,
                questionsPerSecond: 0,
                serviceDistribution: {},
                qualityDistribution: { high: 0, medium: 0, low: 0 },
                relevanceDistribution: { high: 0, medium: 0, low: 0 },
            };
        }

        const avgGenTime = this.calculateAverageGenerationTime(questions);
        const questionsPerSecond =
            avgGenTime > 0 ? Number((1000 / avgGenTime).toFixed(2)) : 0;

        // Service distribution
        const serviceDistribution: Record<string, number> = {};
        questions.forEach((q) => {
            const service = q.metadata.serviceUsed;
            serviceDistribution[service] =
                (serviceDistribution[service] || 0) + 1;
        });

        // Quality distribution
        const qualityDistribution = { high: 0, medium: 0, low: 0 };
        questions.forEach((q) => {
            const score = q.metadata.qualityScore;
            if (score >= 0.8) qualityDistribution.high++;
            else if (score >= 0.6) qualityDistribution.medium++;
            else qualityDistribution.low++;
        });

        // Relevance distribution
        const relevanceDistribution = { high: 0, medium: 0, low: 0 };
        questions.forEach((q) => {
            const score = q.metadata.relevanceScore;
            if (score === undefined) return;
            if (score >= 0.8) relevanceDistribution.high++;
            else if (score >= 0.6) relevanceDistribution.medium++;
            else relevanceDistribution.low++;
        });

        return {
            averageGenerationTime: avgGenTime,
            questionsPerSecond,
            serviceDistribution,
            qualityDistribution,
            relevanceDistribution,
        };
    }

    /**
     * Clear calculation cache for memory management
     */
    static clearCache(): void {
        this.calculationCache.clear();
    }

    /**
     * Get cache statistics for monitoring
     */
    static getCacheStats(): { size: number; hitRate: number } {
        return {
            size: this.calculationCache.size,
            hitRate: 0, // Could be enhanced with hit tracking
        };
    }
}

/**
 * Formula extraction utility for mathematics questions
 */
export class FormulaExtractor {
    private static readonly FORMULA_PATTERNS: Record<string, string> = {
        "×": "a × b = c",
        "+": "a + b = c",
        "-": "a - b = c",
        "÷": "a ÷ b = c",
        area: "l × w = A",
        perimeter: "2(l + w) = P",
        volume: "l × w × h = V",
    };

    /**
     * Extract mathematical formula from question text
     */
    static extractFromQuestion(question: string): string {
        const lowerQuestion = question.toLowerCase();

        // Check for specific mathematical concepts first
        for (const [pattern, formula] of Object.entries(
            this.FORMULA_PATTERNS
        )) {
            if (question.includes(pattern) || lowerQuestion.includes(pattern)) {
                return formula;
            }
        }

        return "Mathematical formula";
    }
}

/**
 * Validation utilities for educational content
 */
export class ValidationUtils {
    /**
     * Validate question quality based on multiple criteria
     */
    static validateQuestionQuality(question: MathematicsQuestionResult): {
        isValid: boolean;
        issues: string[];
        qualityScore: number;
    } {
        const issues: string[] = [];
        let qualityScore = 1.0;

        // Check question text
        if (!question.question || question.question.length < 10) {
            issues.push("Question text too short");
            qualityScore -= 0.3;
        }

        // Check answer
        if (!question.answer) {
            issues.push("Missing answer");
            qualityScore -= 0.4;
        }

        // Check metadata completeness
        if (!question.metadata.serviceUsed) {
            issues.push("Missing service information");
            qualityScore -= 0.1;
        }

        // Check relevance score if vector context is used
        if (
            question.metadata.vectorContext?.used &&
            !question.metadata.relevanceScore
        ) {
            issues.push("Missing relevance score for vector-enhanced question");
            qualityScore -= 0.2;
        }

        return {
            isValid: issues.length === 0,
            issues,
            qualityScore: Math.max(0, Number(qualityScore.toFixed(3))),
        };
    }
}
