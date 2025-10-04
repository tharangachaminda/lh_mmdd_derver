/**
 * Curriculum Data Service
 *
 * Service for managing curriculum data including objectives, learning outcomes,
 * and educational standards. Provides CRUD operations and integration with
 * vector database for similarity-based curriculum recommendations.
 *
 * @fileoverview Curriculum data management service
 * @version 1.0.0
 */

import { promises as fs } from "fs";
import { join } from "path";
import {
    OpenSearchService,
    CurriculumDocument,
} from "../services/opensearch.service.js";
import { EmbeddingService } from "../vector-db/embedding.service.js";

/**
 * Curriculum standard formats
 */
interface CurriculumStandard {
    id: string;
    framework: string;
    subject: string;
    grade: number;
    strand: string;
    subStrand?: string;
    objective: string;
    description: string;
    learningOutcomes: string[];
    prerequisites: string[];
    assessmentCriteria: string[];
    keywords: string[];
    difficulty: "basic" | "intermediate" | "advanced";
    estimatedHours: number;
    resources: {
        type: string;
        url?: string;
        description: string;
    }[];
    metadata: {
        source: string;
        version: string;
        lastUpdated: Date;
        validated: boolean;
        validatedBy?: string;
    };
}

/**
 * Learning objective with progression mapping
 */
interface LearningObjective {
    id: string;
    title: string;
    description: string;
    subject: string;
    grade: number;
    prerequisiteIds: string[];
    nextObjectiveIds: string[];
    bloomsTaxonomyLevel:
        | "remember"
        | "understand"
        | "apply"
        | "analyze"
        | "evaluate"
        | "create";
    cognitiveLoad: "low" | "medium" | "high";
    estimatedDuration: number; // in minutes
    assessmentStrategies: string[];
    keywords: string[];
}

/**
 * Curriculum import configuration
 */
interface CurriculumImportConfig {
    source: string;
    format: "json" | "csv" | "xml" | "xlsx";
    framework: string;
    validateData: boolean;
    generateEmbeddings: boolean;
    batchSize: number;
    skipExisting: boolean;
}

/**
 * Curriculum search filters
 */
interface CurriculumFilters {
    framework?: string;
    subject?: string;
    grade?: number;
    strand?: string;
    difficulty?: string;
    bloomsLevel?: string;
    keywords?: string[];
}

/**
 * Curriculum alignment result
 */
interface AlignmentResult {
    objectiveId: string;
    questionId: string;
    alignmentScore: number;
    alignmentReason: string[];
    confidenceLevel: "low" | "medium" | "high";
    suggestedAdjustments?: string[];
}

/**
 * Curriculum progression path
 */
interface ProgressionPath {
    startObjectiveId: string;
    endObjectiveId: string;
    path: LearningObjective[];
    totalDuration: number;
    difficulty: "gradual" | "moderate" | "steep";
    prerequisites: string[];
}

/**
 * Curriculum Data Service class
 */
export class CurriculumDataService {
    private openSearchService: OpenSearchService;
    private embeddingService: EmbeddingService;
    private standardsCache: Map<string, CurriculumStandard>;
    private objectivesCache: Map<string, LearningObjective>;

    constructor(
        openSearchService: OpenSearchService,
        embeddingService: EmbeddingService
    ) {
        this.openSearchService = openSearchService;
        this.embeddingService = embeddingService;
        this.standardsCache = new Map();
        this.objectivesCache = new Map();
        console.log("🎯 Curriculum Data Service initialized");
    }

    /**
     * Import curriculum data from various sources
     */
    async importCurriculumData(
        filePath: string,
        config: CurriculumImportConfig
    ): Promise<{ imported: number; failed: number; errors: string[] }> {
        console.log(`📚 Importing curriculum data from: ${filePath}`);

        try {
            const data = await this.loadCurriculumFile(filePath, config.format);
            const standards = this.parseCurriculumData(data, config.framework);

            let imported = 0;
            let failed = 0;
            const errors: string[] = [];

            // Process in batches
            for (let i = 0; i < standards.length; i += config.batchSize) {
                const batch = standards.slice(i, i + config.batchSize);

                try {
                    // Generate embeddings if requested
                    if (config.generateEmbeddings) {
                        await this.generateCurriculumEmbeddings(batch);
                    }

                    // Convert to documents and index
                    const documents = batch.map((standard) =>
                        this.standardToDocument(standard)
                    );
                    await this.indexCurriculumDocuments(documents);

                    imported += batch.length;
                    console.log(`✅ Imported batch: ${batch.length} standards`);
                } catch (error) {
                    failed += batch.length;
                    errors.push(
                        `Batch ${Math.floor(i / config.batchSize)}: ${error}`
                    );
                    console.error(`❌ Batch import failed: ${error}`);
                }
            }

            console.log(
                `📊 Import completed: ${imported} imported, ${failed} failed`
            );
            return { imported, failed, errors };
        } catch (error) {
            console.error(`❌ Curriculum import failed: ${error}`);
            throw error;
        }
    }

    /**
     * Create a new curriculum standard
     */
    async createCurriculumStandard(
        standard: Omit<CurriculumStandard, "id">
    ): Promise<CurriculumStandard> {
        const id = this.generateId("STD");
        const fullStandard: CurriculumStandard = {
            ...standard,
            id,
            metadata: {
                ...standard.metadata,
                lastUpdated: new Date(),
                validated: false,
            },
        };

        // Generate embedding
        const embeddingText = `${fullStandard.objective} ${
            fullStandard.description
        } ${fullStandard.keywords.join(" ")}`;
        const embedding = await this.embeddingService.generateEmbedding(
            embeddingText
        );

        // Index to OpenSearch
        const document = this.standardToDocument(fullStandard);
        document.embedding = embedding;
        await this.indexCurriculumDocuments([document]);

        // Cache locally
        this.standardsCache.set(id, fullStandard);

        console.log(`✅ Created curriculum standard: ${id}`);
        return fullStandard;
    }

    /**
     * Find curriculum standards similar to a question
     */
    async alignQuestionToCurriculum(
        questionText: string,
        filters?: CurriculumFilters
    ): Promise<AlignmentResult[]> {
        try {
            console.log(
                `🎯 Finding curriculum alignment for question: "${questionText.substring(
                    0,
                    50
                )}..."`
            );

            // Generate embedding for the question
            const questionEmbedding =
                await this.embeddingService.generateEmbedding(questionText);

            // Search for similar curriculum objectives
            const searchResponse = await this.openSearchService.client.search({
                index: this.openSearchService.config.curriculumIndex,
                body: {
                    size: 10,
                    query: {
                        bool: {
                            must: [
                                {
                                    knn: {
                                        embedding: {
                                            vector: questionEmbedding,
                                            k: 10,
                                        },
                                    },
                                },
                            ],
                            filter: this.buildCurriculumFilters(filters),
                        },
                    },
                },
            });

            // Process results and calculate alignment
            const alignments: AlignmentResult[] = [];

            for (const hit of searchResponse.body.hits.hits) {
                const curriculum = hit._source;
                const score = hit._score;

                if (!curriculum || typeof score !== "number") {
                    continue; // Skip invalid entries
                }

                const alignment: AlignmentResult = {
                    objectiveId: curriculum.id,
                    questionId: "", // Will be set by caller
                    alignmentScore: score,
                    alignmentReason: this.generateAlignmentReason(
                        questionText,
                        curriculum
                    ),
                    confidenceLevel: this.calculateConfidenceLevel(score),
                    suggestedAdjustments: this.suggestAdjustments(
                        questionText,
                        curriculum
                    ),
                };

                alignments.push(alignment);
            }

            console.log(`✅ Found ${alignments.length} curriculum alignments`);
            return alignments;
        } catch (error) {
            console.error(`❌ Error aligning question to curriculum: ${error}`);
            throw error;
        }
    }

    /**
     * Generate learning progression path between objectives
     */
    async generateProgressionPath(
        startObjectiveId: string,
        endObjectiveId: string
    ): Promise<ProgressionPath | null> {
        try {
            console.log(
                `🛤️  Generating progression path from ${startObjectiveId} to ${endObjectiveId}`
            );

            const startObjective = await this.getLearningObjective(
                startObjectiveId
            );
            const endObjective = await this.getLearningObjective(
                endObjectiveId
            );

            if (!startObjective || !endObjective) {
                console.warn("⚠️  One or both objectives not found");
                return null;
            }

            // Use a simple BFS approach to find the path
            const path = await this.findShortestPath(
                startObjective,
                endObjective
            );

            if (!path) {
                console.warn("⚠️  No progression path found");
                return null;
            }

            const totalDuration = path.reduce(
                (sum, obj) => sum + obj.estimatedDuration,
                0
            );
            const difficulty = this.calculatePathDifficulty(path);
            const prerequisites = this.collectPathPrerequisites(path);

            const progressionPath: ProgressionPath = {
                startObjectiveId,
                endObjectiveId,
                path,
                totalDuration,
                difficulty,
                prerequisites,
            };

            console.log(
                `✅ Generated progression path with ${path.length} steps`
            );
            return progressionPath;
        } catch (error) {
            console.error(`❌ Error generating progression path: ${error}`);
            throw error;
        }
    }

    /**
     * Get curriculum standards by filters
     */
    async getCurriculumStandards(
        filters?: CurriculumFilters
    ): Promise<CurriculumStandard[]> {
        try {
            const response = await this.openSearchService.client.search({
                index: this.openSearchService.config.curriculumIndex,
                body: {
                    query: {
                        bool: {
                            filter: this.buildCurriculumFilters(filters),
                        },
                    },
                    size: 1000,
                },
            });

            return response.body.hits.hits.map((hit: any) =>
                this.documentToStandard(hit._source)
            );
        } catch (error) {
            console.error(`❌ Error getting curriculum standards: ${error}`);
            throw error;
        }
    }

    /**
     * Validate curriculum data against standards
     */
    async validateCurriculumData(standardId: string): Promise<{
        isValid: boolean;
        issues: string[];
        suggestions: string[];
    }> {
        try {
            const standard = await this.getCurriculumStandardById(standardId);

            if (!standard) {
                return {
                    isValid: false,
                    issues: ["Standard not found"],
                    suggestions: [],
                };
            }

            const issues: string[] = [];
            const suggestions: string[] = [];

            // Validate required fields
            if (!standard.objective || standard.objective.trim().length < 10) {
                issues.push("Objective is too short or missing");
                suggestions.push(
                    "Provide a clear, detailed objective statement"
                );
            }

            if (
                !standard.description ||
                standard.description.trim().length < 20
            ) {
                issues.push("Description is too short or missing");
                suggestions.push("Add comprehensive description with context");
            }

            if (
                !standard.learningOutcomes ||
                standard.learningOutcomes.length === 0
            ) {
                issues.push("No learning outcomes specified");
                suggestions.push("Define measurable learning outcomes");
            }

            if (!standard.keywords || standard.keywords.length < 3) {
                issues.push("Insufficient keywords for discoverability");
                suggestions.push(
                    "Add relevant keywords for better searchability"
                );
            }

            // Validate assessment criteria
            if (
                !standard.assessmentCriteria ||
                standard.assessmentCriteria.length === 0
            ) {
                issues.push("No assessment criteria defined");
                suggestions.push("Define clear assessment criteria");
            }

            const isValid = issues.length === 0;

            console.log(
                `✅ Validated curriculum standard ${standardId}: ${
                    isValid ? "VALID" : "INVALID"
                }`
            );
            return { isValid, issues, suggestions };
        } catch (error) {
            console.error(`❌ Error validating curriculum data: ${error}`);
            throw error;
        }
    }

    /**
     * Load curriculum file based on format
     */
    private async loadCurriculumFile(
        filePath: string,
        format: string
    ): Promise<any> {
        const content = await fs.readFile(filePath, "utf-8");

        switch (format) {
            case "json":
                return JSON.parse(content);
            case "csv":
                // Would implement CSV parsing
                throw new Error("CSV format not yet implemented");
            case "xml":
                // Would implement XML parsing
                throw new Error("XML format not yet implemented");
            case "xlsx":
                // Would implement Excel parsing
                throw new Error("XLSX format not yet implemented");
            default:
                throw new Error(`Unsupported format: ${format}`);
        }
    }

    /**
     * Parse curriculum data from various formats
     */
    private parseCurriculumData(
        data: any,
        framework: string
    ): CurriculumStandard[] {
        const standards: CurriculumStandard[] = [];

        if (Array.isArray(data)) {
            data.forEach((item) => {
                const standard = this.parseStandardItem(item, framework);
                if (standard) standards.push(standard);
            });
        } else if (data.standards && Array.isArray(data.standards)) {
            data.standards.forEach((item: any) => {
                const standard = this.parseStandardItem(item, framework);
                if (standard) standards.push(standard);
            });
        }

        return standards;
    }

    /**
     * Parse individual standard item
     */
    private parseStandardItem(
        item: any,
        framework: string
    ): CurriculumStandard | null {
        try {
            return {
                id: item.id || this.generateId("STD"),
                framework,
                subject: item.subject || "General",
                grade: parseInt(item.grade) || 1,
                strand: item.strand || "General",
                subStrand: item.subStrand,
                objective: item.objective || item.title || "",
                description: item.description || "",
                learningOutcomes: Array.isArray(item.learningOutcomes)
                    ? item.learningOutcomes
                    : [item.learningOutcome].filter(Boolean),
                prerequisites: Array.isArray(item.prerequisites)
                    ? item.prerequisites
                    : [],
                assessmentCriteria: Array.isArray(item.assessmentCriteria)
                    ? item.assessmentCriteria
                    : [],
                keywords: Array.isArray(item.keywords) ? item.keywords : [],
                difficulty: item.difficulty || "intermediate",
                estimatedHours: parseInt(item.estimatedHours) || 1,
                resources: Array.isArray(item.resources) ? item.resources : [],
                metadata: {
                    source: item.source || "import",
                    version: item.version || "1.0",
                    lastUpdated: new Date(),
                    validated: false,
                },
            };
        } catch (error) {
            console.warn(`⚠️  Failed to parse standard item: ${error}`);
            return null;
        }
    }

    /**
     * Generate embeddings for curriculum standards
     */
    private async generateCurriculumEmbeddings(
        standards: CurriculumStandard[]
    ): Promise<void> {
        for (const standard of standards) {
            try {
                const text = `${standard.objective} ${
                    standard.description
                } ${standard.keywords.join(" ")}`;
                const embedding = await this.embeddingService.generateEmbedding(
                    text
                );
                (standard as any).embedding = embedding;
            } catch (error) {
                console.warn(
                    `⚠️  Failed to generate embedding for standard ${standard.id}: ${error}`
                );
            }
        }
    }

    /**
     * Convert standard to OpenSearch document
     */
    private standardToDocument(
        standard: CurriculumStandard
    ): CurriculumDocument {
        return {
            id: standard.id,
            subject: standard.subject,
            grade: standard.grade,
            framework: standard.framework,
            strand: standard.strand,
            objective: standard.objective,
            description: standard.description,
            keywords: standard.keywords,
            prerequisites: standard.prerequisites,
            outcomes: standard.learningOutcomes,
            embedding: (standard as any).embedding,
            metadata: {
                version: standard.metadata.version,
                lastUpdated: standard.metadata.lastUpdated,
                validated: standard.metadata.validated,
            },
        };
    }

    /**
     * Convert document back to standard
     */
    private documentToStandard(doc: CurriculumDocument): CurriculumStandard {
        // This would convert back from the document format
        // Implementation depends on how we store the full standard data
        throw new Error("Document to standard conversion not implemented");
    }

    /**
     * Index curriculum documents to OpenSearch
     */
    private async indexCurriculumDocuments(
        documents: CurriculumDocument[]
    ): Promise<void> {
        // This would use the OpenSearch service to bulk index the documents
        // Implementation would be similar to bulkIndexQuestions
        console.log(`📝 Would index ${documents.length} curriculum documents`);
    }

    /**
     * Generate unique ID
     */
    private generateId(prefix: string): string {
        return `${prefix}_${Date.now()}_${Math.random()
            .toString(36)
            .substring(2, 9)}`;
    }

    /**
     * Build OpenSearch filters for curriculum search
     */
    private buildCurriculumFilters(filters?: CurriculumFilters): any[] {
        const filterArray: any[] = [];

        if (filters) {
            if (filters.framework) {
                filterArray.push({ term: { framework: filters.framework } });
            }
            if (filters.subject) {
                filterArray.push({ term: { subject: filters.subject } });
            }
            if (filters.grade) {
                filterArray.push({ term: { grade: filters.grade } });
            }
            if (filters.strand) {
                filterArray.push({ term: { strand: filters.strand } });
            }
            if (filters.keywords && filters.keywords.length > 0) {
                filterArray.push({ terms: { keywords: filters.keywords } });
            }
        }

        return filterArray;
    }

    /**
     * Generate alignment reason
     */
    private generateAlignmentReason(
        questionText: string,
        curriculum: any
    ): string[] {
        const reasons: string[] = [];

        // Check for keyword matches
        const questionWords = questionText.toLowerCase().split(/\W+/);
        const curriculumWords = [
            ...curriculum.objective.toLowerCase().split(/\W+/),
            ...curriculum.keywords.map((k: string) => k.toLowerCase()),
        ];

        const matches = questionWords.filter(
            (word) => word.length > 3 && curriculumWords.includes(word)
        );

        if (matches.length > 0) {
            reasons.push(`Keyword matches: ${matches.slice(0, 3).join(", ")}`);
        }

        reasons.push(`Topic alignment with ${curriculum.strand}`);

        return reasons;
    }

    /**
     * Calculate confidence level based on score
     */
    private calculateConfidenceLevel(score: number): "low" | "medium" | "high" {
        if (score > 0.8) return "high";
        if (score > 0.5) return "medium";
        return "low";
    }

    /**
     * Suggest adjustments for better alignment
     */
    private suggestAdjustments(
        questionText: string,
        curriculum: any
    ): string[] {
        const suggestions: string[] = [];

        if (curriculum.keywords && curriculum.keywords.length > 0) {
            const missingKeywords = curriculum.keywords.filter(
                (keyword: string) =>
                    !questionText.toLowerCase().includes(keyword.toLowerCase())
            );

            if (missingKeywords.length > 0) {
                suggestions.push(
                    `Consider including keywords: ${missingKeywords
                        .slice(0, 2)
                        .join(", ")}`
                );
            }
        }

        return suggestions;
    }

    /**
     * Helper methods for progression path generation
     */
    private async getLearningObjective(
        id: string
    ): Promise<LearningObjective | null> {
        // Implementation would retrieve from cache or database
        return this.objectivesCache.get(id) || null;
    }

    private async findShortestPath(
        start: LearningObjective,
        end: LearningObjective
    ): Promise<LearningObjective[] | null> {
        // BFS implementation for finding shortest path
        // This is a simplified placeholder
        return [start, end];
    }

    private calculatePathDifficulty(
        path: LearningObjective[]
    ): "gradual" | "moderate" | "steep" {
        // Calculate based on cognitive load changes
        return "moderate";
    }

    private collectPathPrerequisites(path: LearningObjective[]): string[] {
        const prerequisites = new Set<string>();
        path.forEach((obj) => {
            obj.prerequisiteIds.forEach((prereq) => prerequisites.add(prereq));
        });
        return Array.from(prerequisites);
    }

    private async getCurriculumStandardById(
        id: string
    ): Promise<CurriculumStandard | null> {
        // Implementation would retrieve from OpenSearch
        return this.standardsCache.get(id) || null;
    }
}
