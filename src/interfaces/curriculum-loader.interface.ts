import { CurriculumContent } from "../models/curriculum.js";

/**
 * Options for curriculum data validation
 */
export interface CurriculumValidationOptions {
    /** Whether to require sample questions (default: false) */
    requireSampleQuestions?: boolean;
    /** Whether to require learning objectives (default: false) */
    requireLearningObjectives?: boolean;
    /** Whether to require prerequisites (default: false) */
    requirePrerequisites?: boolean;
    /** Minimum number of keywords required (default: 0) */
    minKeywords?: number;
}

/**
 * Result of curriculum data validation
 */
export interface CurriculumValidationResult {
    /** Whether the curriculum data is valid */
    isValid: boolean;
    /** Array of validation errors if any */
    errors: string[];
    /** Array of validation warnings if any */
    warnings: string[];
}

/**
 * Options for batch curriculum processing
 */
export interface CurriculumBatchOptions {
    /** Whether to stop processing on first error (default: false) */
    stopOnError?: boolean;
    /** Whether to skip invalid items (default: true) */
    skipInvalid?: boolean;
    /** Maximum number of items to process (default: unlimited) */
    maxItems?: number;
    /** Validation options for each item */
    validationOptions?: CurriculumValidationOptions;
}

/**
 * Result of batch curriculum processing
 */
export interface CurriculumBatchResult {
    /** Array of successfully processed curriculum IDs */
    processedIds: string[];
    /** Array of skipped/invalid curriculum IDs */
    skippedIds: string[];
    /** Array of processing errors */
    errors: Array<{
        itemId?: string;
        error: string;
    }>;
    /** Total number of items in the batch */
    totalItems: number;
}

/**
 * Interface for curriculum data loading and processing utilities
 */
export interface ICurriculumLoader {
    /**
     * Load curriculum data from a JSON file
     */
    loadCurriculumFromJSON(filePath: string): Promise<CurriculumContent>;

    /**
     * Validate curriculum data structure with detailed feedback
     */
    validateCurriculumDataDetailed(
        filePath: string,
        options?: CurriculumValidationOptions
    ): Promise<CurriculumValidationResult>;

    /**
     * Process multiple curriculum items from a JSON array file
     */
    processCurriculumBatchDetailed(
        filePath: string,
        options?: CurriculumBatchOptions
    ): Promise<CurriculumBatchResult>;
}
