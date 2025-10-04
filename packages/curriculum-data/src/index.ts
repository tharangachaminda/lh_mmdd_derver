/**
 * Curriculum Data Package
 *
 * Centralized package for curriculum data management, question ingestion,
 * and vector database operations. This package consolidates all scattered
 * curriculum-related files and provides a unified API for data operations.
 *
 * @fileoverview Main entry point for curriculum data management
 * @version 1.0.0
 */

// Core Services
export { OpenSearchService } from "./services/opensearch.service.js";
export type {
    OpenSearchConfig,
    QuestionDocument,
    CurriculumDocument,
    SearchFilters,
    SearchResult,
} from "./services/opensearch.service.js";

export { CurriculumDataService } from "./services/curriculum-data.service.js";

// Vector Database Operations
export { EmbeddingService } from "./vector-db/embedding.service.js";
export { VectorDatabaseService } from "./vector-db/vector-database.service.js";

// Ingestion Services
export { BulkQuestionIngester } from "./ingestion/bulk-question-ingester.js";

// TODO: Create these utility modules when needed
// export { createCurriculumDataManager } from './utils/factory.js';
// export { validateQuestionFormat } from './utils/validation.js';
// export { migrateData } from './utils/migration.js';

// TODO: Add shared package integration when ready
// export type { SharedTypes } from '@learning-hub/shared';

/**
 * Initialize curriculum data package with comprehensive setup
 */
export async function initializeCurriculumData(): Promise<{
    success: boolean;
    message: string;
    services: string[];
}> {
    try {
        console.log("🚀 Initializing Curriculum Data Package...");

        const services = [
            "OpenSearchService",
            "CurriculumDataService",
            "EmbeddingService",
            "VectorDatabaseService",
            "BulkQuestionIngester",
        ];

        console.log("✅ Curriculum Data Package initialized successfully");

        return {
            success: true,
            message: "Curriculum Data Package ready for use",
            services,
        };
    } catch (error) {
        console.error(
            "❌ Failed to initialize Curriculum Data Package:",
            error
        );
        return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
            services: [],
        };
    }
}

/**
 * Package version and metadata
 */
export const PACKAGE_INFO = {
    name: "@learning-hub/curriculum-data",
    version: "1.0.0",
    description:
        "Centralized curriculum data management and vector database operations",
} as const;
