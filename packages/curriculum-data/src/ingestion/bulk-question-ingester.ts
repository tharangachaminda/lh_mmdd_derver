/**
 * Bulk Question Ingester
 *
 * Centralized service for ingesting questions from various sources including
 * the existing scattered JSON files, CSV files, and other formats.
 * This consolidates all the existing ingestion scripts into a unified system.
 *
 * @fileoverview Unified bulk question ingestion service
 * @version 1.0.0
 */

import { promises as fs } from "fs";
import { join, resolve } from "path";
import { glob } from "glob";
import { v4 as uuidv4 } from "uuid";
import {
    OpenSearchService,
    QuestionDocument,
} from "../services/opensearch.service.js";
import { EmbeddingService } from "../vector-db/embedding.service.js";

/**
 * Source question format (matches existing JSON files)
 */
interface SourceQuestion {
    id?: string;
    subject?: string;
    grade?: number;
    topic?: string;
    subtopic?: string;
    question: string;
    answer: string | number;
    explanation?: string;
    difficulty?: string;
    format?: string;
    keywords?: string[];
    curriculumObjectives?: string[];
    metadata?: any;
    // Legacy fields from existing files
    type?: string;
    questionType?: string;
    mathType?: string;
    complexity?: string;
    level?: string;
}

/**
 * Ingestion job configuration
 */
interface IngestionConfig {
    sourceDirectory: string;
    filePatterns: string[];
    batchSize: number;
    generateEmbeddings: boolean;
    validateData: boolean;
    skipExisting: boolean;
    dryRun: boolean;
    defaultSubject?: string;
    defaultGrade?: number;
}

/**
 * Ingestion statistics
 */
interface IngestionStats {
    totalFiles: number;
    totalQuestions: number;
    processedQuestions: number;
    skippedQuestions: number;
    failedQuestions: number;
    duplicateQuestions: number;
    processingTime: number;
    errors: Array<{
        file: string;
        question?: string;
        error: string;
    }>;
}

/**
 * Bulk Question Ingester class
 */
export class BulkQuestionIngester {
    private openSearchService: OpenSearchService;
    private embeddingService: EmbeddingService;
    private stats: IngestionStats;

    constructor(
        openSearchService: OpenSearchService,
        embeddingService: EmbeddingService
    ) {
        this.openSearchService = openSearchService;
        this.embeddingService = embeddingService;
        this.stats = {
            totalFiles: 0,
            totalQuestions: 0,
            processedQuestions: 0,
            skippedQuestions: 0,
            failedQuestions: 0,
            duplicateQuestions: 0,
            processingTime: 0,
            errors: [],
        };
    }

    /**
     * Ingest questions from the existing scattered files in the project
     */
    async ingestExistingQuestions(
        config: Partial<IngestionConfig> = {}
    ): Promise<IngestionStats> {
        const finalConfig: IngestionConfig = {
            sourceDirectory: "../../..", // Go up to workspace root from packages/curriculum-data/dist
            filePatterns: [
                "grade*-questions*.json",
                "grade*-template.json",
                "curriculum-*.json",
                "sample-curriculum-*.json",
                "question_bank/**/*.json",
                "content/**/*.json",
            ],
            batchSize: 50,
            generateEmbeddings: true,
            validateData: true,
            skipExisting: false,
            dryRun: false,
            ...config,
        };

        console.log("📚 Starting bulk ingestion of existing questions...");
        console.log(`   📁 Source directory: ${finalConfig.sourceDirectory}`);
        console.log(
            `   📋 File patterns: ${finalConfig.filePatterns.join(", ")}`
        );
        console.log(`   📦 Batch size: ${finalConfig.batchSize}`);

        const startTime = Date.now();

        try {
            // Find all matching files
            const files = await this.findSourceFiles(finalConfig);
            this.stats.totalFiles = files.length;

            console.log(`📄 Found ${files.length} potential source files`);

            // Process each file
            const allQuestions: QuestionDocument[] = [];

            for (const file of files) {
                try {
                    const questions = await this.processFile(file, finalConfig);
                    allQuestions.push(...questions);
                    console.log(
                        `✅ Processed ${file}: ${questions.length} questions`
                    );
                } catch (error) {
                    console.error(`❌ Error processing ${file}: ${error}`);
                    this.stats.errors.push({
                        file,
                        error:
                            error instanceof Error
                                ? error.message
                                : String(error),
                    });
                }
            }

            this.stats.totalQuestions = allQuestions.length;
            console.log(`📊 Total questions collected: ${allQuestions.length}`);

            if (!finalConfig.dryRun && allQuestions.length > 0) {
                // Process in batches
                await this.processBatches(allQuestions, finalConfig);
            } else if (finalConfig.dryRun) {
                console.log("🔍 Dry run completed - no data was ingested");
                this.stats.processedQuestions = allQuestions.length;
            }

            this.stats.processingTime = Date.now() - startTime;

            console.log("🎉 Bulk ingestion completed!");
            this.printStats();

            return this.stats;
        } catch (error) {
            console.error(`❌ Bulk ingestion failed: ${error}`);
            throw error;
        }
    }

    /**
     * Find all source files matching the patterns
     */
    private async findSourceFiles(config: IngestionConfig): Promise<string[]> {
        const files: string[] = [];

        for (const pattern of config.filePatterns) {
            const matches = await glob(pattern, {
                cwd: resolve(config.sourceDirectory),
                absolute: true,
            });
            files.push(...matches);
        }

        // Remove duplicates and filter for existing files
        const uniqueFiles = [...new Set(files)];
        const existingFiles: string[] = [];

        for (const file of uniqueFiles) {
            try {
                await fs.access(file);
                existingFiles.push(file);
            } catch {
                // File doesn't exist or not accessible
                console.warn(`⚠️  File not accessible: ${file}`);
            }
        }

        return existingFiles;
    }

    /**
     * Process a single file and extract questions
     */
    private async processFile(
        filePath: string,
        config: IngestionConfig
    ): Promise<QuestionDocument[]> {
        try {
            const content = await fs.readFile(filePath, "utf-8");
            const data = JSON.parse(content);

            // Handle different file structures
            const questions = this.extractQuestions(data, filePath, config);

            return questions;
        } catch (error) {
            console.error(`❌ Error reading file ${filePath}: ${error}`);
            throw error;
        }
    }

    /**
     * Extract questions from various data formats
     */
    private extractQuestions(
        data: any,
        filePath: string,
        config: IngestionConfig
    ): QuestionDocument[] {
        const questions: QuestionDocument[] = [];

        // Handle array of questions
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                if (this.isQuestionLike(item)) {
                    const question = this.normalizeQuestion(
                        item,
                        filePath,
                        config
                    );
                    if (question) questions.push(question);
                }
            });
        }
        // Handle single question object
        else if (this.isQuestionLike(data)) {
            const question = this.normalizeQuestion(data, filePath, config);
            if (question) questions.push(question);
        }
        // Handle curriculum structure with sample questions
        else if (data.sampleQuestions && Array.isArray(data.sampleQuestions)) {
            data.sampleQuestions.forEach((item: any) => {
                const question = this.normalizeQuestion(
                    {
                        ...item,
                        subject: data.subject || config.defaultSubject,
                        grade: data.grade || config.defaultGrade,
                        topic: data.topic,
                        subtopic: data.subtopic,
                        difficulty: data.difficulty,
                    },
                    filePath,
                    config
                );
                if (question) questions.push(question);
            });
        }
        // Handle nested questions in various structures
        else if (typeof data === "object") {
            // Look for question-like properties at any level
            this.extractNestedQuestions(data, questions, filePath, config);
        }

        return questions;
    }

    /**
     * Extract questions from nested object structures
     */
    private extractNestedQuestions(
        obj: any,
        questions: QuestionDocument[],
        filePath: string,
        config: IngestionConfig
    ): void {
        if (typeof obj !== "object" || obj === null) return;

        for (const key in obj) {
            const value = obj[key];

            if (Array.isArray(value)) {
                value.forEach((item) => {
                    if (this.isQuestionLike(item)) {
                        const question = this.normalizeQuestion(
                            item,
                            filePath,
                            config
                        );
                        if (question) questions.push(question);
                    } else if (typeof item === "object") {
                        this.extractNestedQuestions(
                            item,
                            questions,
                            filePath,
                            config
                        );
                    }
                });
            } else if (typeof value === "object") {
                if (this.isQuestionLike(value)) {
                    const question = this.normalizeQuestion(
                        value,
                        filePath,
                        config
                    );
                    if (question) questions.push(question);
                } else {
                    this.extractNestedQuestions(
                        value,
                        questions,
                        filePath,
                        config
                    );
                }
            }
        }
    }

    /**
     * Check if an object looks like a question
     */
    private isQuestionLike(obj: any): boolean {
        return (
            obj &&
            typeof obj === "object" &&
            (obj.question || obj.questionText || obj.prompt) &&
            (obj.answer || obj.solution || obj.correctAnswer)
        );
    }

    /**
     * Normalize a question object to our standard format
     */
    private normalizeQuestion(
        source: SourceQuestion,
        filePath: string,
        config: IngestionConfig
    ): QuestionDocument | null {
        try {
            // Extract question text from various possible fields
            const questionText =
                source.question ||
                (source as any).questionText ||
                (source as any).prompt;

            // Extract answer from various possible fields
            const answerText = String(
                source.answer ||
                    (source as any).solution ||
                    (source as any).correctAnswer ||
                    ""
            );

            if (!questionText || !answerText) {
                console.warn(`⚠️  Skipping incomplete question in ${filePath}`);
                return null;
            }

            // Normalize subject
            let subject =
                source.subject || config.defaultSubject || "Mathematics";
            if (subject.toLowerCase().includes("math")) {
                subject = "Mathematics";
            }

            // Normalize difficulty
            let difficulty =
                source.difficulty ||
                source.complexity ||
                source.level ||
                "medium";
            if (
                difficulty.toLowerCase().includes("easy") ||
                difficulty.toLowerCase().includes("simple")
            ) {
                difficulty = "easy";
            } else if (
                difficulty.toLowerCase().includes("hard") ||
                difficulty.toLowerCase().includes("difficult") ||
                difficulty.toLowerCase().includes("challenging")
            ) {
                difficulty = "hard";
            } else {
                difficulty = "medium";
            }

            // Normalize format
            let format =
                source.format ||
                source.type ||
                source.questionType ||
                "multiple_choice";
            if (
                format.toLowerCase().includes("calculation") ||
                format.toLowerCase().includes("numeric")
            ) {
                format = "calculation";
            } else if (
                format.toLowerCase().includes("short") ||
                format.toLowerCase().includes("brief")
            ) {
                format = "short_answer";
            } else if (
                format.toLowerCase().includes("essay") ||
                format.toLowerCase().includes("long")
            ) {
                format = "essay";
            }

            const question: QuestionDocument = {
                id: source.id || uuidv4(),
                subject,
                grade: source.grade || config.defaultGrade || 5,
                topic: source.topic || source.mathType || "general",
                subtopic: source.subtopic,
                question: questionText,
                answer: answerText,
                explanation: source.explanation,
                difficulty,
                format,
                keywords: source.keywords || [],
                curriculumObjectives: source.curriculumObjectives || [],
                metadata: {
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    source: filePath,
                    validated: config.validateData,
                    ...(source.metadata || {}),
                },
            };

            return question;
        } catch (error) {
            console.error(`❌ Error normalizing question: ${error}`);
            return null;
        }
    }

    /**
     * Process questions in batches
     */
    private async processBatches(
        questions: QuestionDocument[],
        config: IngestionConfig
    ): Promise<void> {
        console.log(
            `📦 Processing ${questions.length} questions in batches of ${config.batchSize}...`
        );

        for (let i = 0; i < questions.length; i += config.batchSize) {
            const batch = questions.slice(i, i + config.batchSize);

            console.log(
                `📝 Processing batch ${
                    Math.floor(i / config.batchSize) + 1
                }/${Math.ceil(questions.length / config.batchSize)}...`
            );

            try {
                // Generate embeddings if requested
                if (config.generateEmbeddings) {
                    await this.generateEmbeddings(batch);
                }

                // Index to OpenSearch
                const result = await this.openSearchService.bulkIndexQuestions(
                    batch
                );

                this.stats.processedQuestions += result.success;
                this.stats.failedQuestions += result.failed;

                if (result.errors.length > 0) {
                    result.errors.forEach((error) => {
                        this.stats.errors.push({
                            file: "bulk_processing",
                            error: JSON.stringify(error),
                        });
                    });
                }

                console.log(
                    `✅ Batch completed: ${result.success} indexed, ${result.failed} failed`
                );
            } catch (error) {
                console.error(`❌ Batch processing error: ${error}`);
                this.stats.failedQuestions += batch.length;
                this.stats.errors.push({
                    file: "bulk_processing",
                    error:
                        error instanceof Error ? error.message : String(error),
                });
            }
        }
    }

    /**
     * Generate embeddings for a batch of questions
     */
    private async generateEmbeddings(
        questions: QuestionDocument[]
    ): Promise<void> {
        for (const question of questions) {
            try {
                const text = `${question.question} ${question.answer} ${
                    question.explanation || ""
                }`;
                const embedding = await this.embeddingService.generateEmbedding(
                    text
                );
                question.embedding = embedding;
            } catch (error) {
                console.warn(
                    `⚠️  Failed to generate embedding for question ${question.id}: ${error}`
                );
            }
        }
    }

    /**
     * Print ingestion statistics
     */
    private printStats(): void {
        console.log("\n📊 INGESTION STATISTICS");
        console.log("=".repeat(50));
        console.log(`📄 Total files processed: ${this.stats.totalFiles}`);
        console.log(`📝 Total questions found: ${this.stats.totalQuestions}`);
        console.log(
            `✅ Successfully processed: ${this.stats.processedQuestions}`
        );
        console.log(`⏭️  Skipped questions: ${this.stats.skippedQuestions}`);
        console.log(`❌ Failed questions: ${this.stats.failedQuestions}`);
        console.log(`🔄 Duplicate questions: ${this.stats.duplicateQuestions}`);
        console.log(`⏱️  Processing time: ${this.stats.processingTime}ms`);
        console.log(
            `🎯 Success rate: ${(
                (this.stats.processedQuestions / this.stats.totalQuestions) *
                100
            ).toFixed(1)}%`
        );

        if (this.stats.errors.length > 0) {
            console.log(`\n❌ ERRORS (${this.stats.errors.length}):`);
            this.stats.errors.slice(0, 10).forEach((error, index) => {
                console.log(`${index + 1}. ${error.file}: ${error.error}`);
            });
            if (this.stats.errors.length > 10) {
                console.log(
                    `... and ${this.stats.errors.length - 10} more errors`
                );
            }
        }
        console.log("=".repeat(50));
    }

    /**
     * Get current ingestion statistics
     */
    getStats(): IngestionStats {
        return { ...this.stats };
    }
}
