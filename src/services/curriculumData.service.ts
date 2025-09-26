import { Client as OpenSearchClient } from "@opensearch-project/opensearch";
import { DifficultyLevel, QuestionType } from "../models/question.js";
import {
    CurriculumContent,
    CurriculumSearchOptions,
    CurriculumSearchResult,
} from "../models/curriculum.js";
import { LanguageModelFactory } from "./language-model.factory.js";
import { ILanguageModel } from "../interfaces/language-model.interface.js";

export class CurriculumDataService {
    private readonly indexName = "curriculum";
    private readonly langchainService: ILanguageModel;

    /**
     * Constructor for CurriculumDataService
     * @param client - OpenSearch client instance
     * @param langchainService - Optional language model service (uses factory default if not provided)
     */
    constructor(
        private readonly client: OpenSearchClient,
        langchainService?: ILanguageModel
    ) {
        this.langchainService =
            langchainService ||
            LanguageModelFactory.getInstance().createModel();
    }

    /**
     * Initialize the OpenSearch index with proper mappings
     */
    async initializeIndex(): Promise<void> {
        const indexExists = await this.client.indices.exists({
            index: this.indexName,
        });

        if (!indexExists.body) {
            await this.client.indices.create({
                index: this.indexName,
                body: {
                    mappings: {
                        properties: {
                            id: { type: "keyword" },
                            grade: { type: "integer" },
                            subject: { type: "keyword" },
                            topic: { type: "keyword" },
                            subtopic: { type: "keyword" },
                            difficulty: { type: "keyword" },
                            questionTypes: { type: "keyword" },
                            embedding: {
                                type: "knn_vector",
                                dimension: 1536,
                            },
                            createdAt: { type: "date" },
                            updatedAt: { type: "date" },
                            version: { type: "integer" },
                        },
                    },
                },
            });
        }
    }

    /**
     * Store new curriculum content
     */
    async storeCurriculumContent(content: CurriculumContent): Promise<string> {
        try {
            const embedding = await this.generateEmbedding(
                this.getContentDescription(content)
            );

            const response = await this.client.index({
                index: this.indexName,
                id: content.id,
                body: {
                    ...content,
                    embedding,
                },
            });

            return response.body._id;
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            throw new Error(
                "Failed to store curriculum content: " + errorMessage
            );
        }
    }

    /**
     * Search for similar curriculum content
     */
    async searchSimilarContent(
        query: string,
        options: CurriculumSearchOptions = {}
    ): Promise<CurriculumSearchResult[]> {
        const embedding = await this.generateEmbedding(query);
        const { grade, difficulty, questionType, limit = 5 } = options;

        const must: any[] = [];

        if (grade) must.push({ term: { grade } });
        if (difficulty) must.push({ term: { difficulty } });
        if (questionType) must.push({ term: { questionTypes: questionType } });

        // Add vector similarity search
        must.push({
            script_score: {
                query: { match_all: {} },
                script: {
                    source: "cosineSimilarity(params.query_vector, 'embedding') + 1.0",
                    params: { query_vector: embedding },
                },
            },
        });

        const response = await this.client.search({
            index: this.indexName,
            body: {
                query: {
                    bool: { must },
                },
                size: limit,
            },
        });

        return response.body.hits.hits.map((hit) => ({
            content: hit._source as CurriculumContent,
            score:
                typeof hit._score === "string"
                    ? parseFloat(hit._score)
                    : hit._score || 0,
        }));
    }

    /**
     * Delete curriculum content by ID
     */
    async deleteCurriculumContent(id: string): Promise<void> {
        try {
            await this.client.delete({
                index: this.indexName,
                id,
            });
        } catch (error) {
            throw new Error("Curriculum content not found");
        }
    }

    /**
     * Update existing curriculum content
     */
    async updateCurriculumContent(content: CurriculumContent): Promise<void> {
        try {
            const embedding = await this.generateEmbedding(
                this.getContentDescription(content)
            );

            await this.client.update({
                index: this.indexName,
                id: content.id,
                body: {
                    doc: {
                        ...content,
                        embedding,
                        updatedAt: new Date(),
                    },
                },
            });
        } catch (error) {
            throw new Error("Curriculum content not found");
        }
    }

    /**
     * Generate embedding for the content
     */
    private async generateEmbedding(text: string): Promise<number[]> {
        return await this.langchainService.generateEmbedding(text);
    }

    /**
     * Get a searchable description of the content
     */
    private getContentDescription(content: CurriculumContent): string {
        return [
            content.concept.description,
            content.concept.keywords.join(" "),
            content.sampleQuestions.map((q) => q.question).join(" "),
            content.learningObjectives.join(" "),
        ].join(" ");
    }
}
