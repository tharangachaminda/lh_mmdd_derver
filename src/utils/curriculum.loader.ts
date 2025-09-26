import fs from "fs/promises";
import { CurriculumContent } from "../models/curriculum.js";
import {
    CurriculumValidationOptions,
    CurriculumValidationResult,
    CurriculumBatchOptions,
    CurriculumBatchResult,
} from "../interfaces/curriculum-loader.interface.js";

/**
 * Loads curriculum data from a JSON file
 * @param filePath - Absolute path to the JSON file
 * @returns Promise resolving to CurriculumContent object
 */
export async function loadCurriculumFromJSON(
    filePath: string
): Promise<CurriculumContent> {
    try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(fileContent);

        // Convert date strings to Date objects if they exist
        if (jsonData.createdAt) {
            jsonData.createdAt = new Date(jsonData.createdAt);
        }
        if (jsonData.updatedAt) {
            jsonData.updatedAt = new Date(jsonData.updatedAt);
        }

        return jsonData as CurriculumContent;
    } catch (error) {
        if (
            error instanceof Error &&
            (error.message.includes("ENOENT") ||
                (error as any).code === "ENOENT")
        ) {
            throw new Error("File not found or invalid JSON");
        }
        throw new Error(
            `Failed to load curriculum JSON: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

/**
 * Validates that a JSON file contains valid curriculum data structure
 * @param filePath - Absolute path to the JSON file to validate
 * @returns Promise resolving to true if valid, false otherwise
 */
export async function validateCurriculumData(
    filePath: string
): Promise<boolean> {
    try {
        const data = await loadCurriculumFromJSON(filePath);

        // Basic structure validation
        const requiredFields = [
            "id",
            "grade",
            "subject",
            "topic",
            "concept",
            "difficulty",
            "questionTypes",
        ];
        const hasAllRequired = requiredFields.every(
            (field) =>
                field in data && data[field as keyof CurriculumContent] != null
        );

        if (!hasAllRequired) {
            return false;
        }

        // Validate concept structure
        if (
            !data.concept ||
            !data.concept.id ||
            !data.concept.name ||
            !data.concept.description
        ) {
            return false;
        }

        // Validate sample questions if they exist
        if (data.sampleQuestions && Array.isArray(data.sampleQuestions)) {
            for (const question of data.sampleQuestions) {
                if (
                    !question.id ||
                    !question.question ||
                    question.answer === undefined ||
                    !question.type
                ) {
                    return false;
                }
            }
        }

        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Validates curriculum data structure with detailed feedback
 * @param filePath - Absolute path to the JSON file to validate
 * @param options - Validation options
 * @returns Promise resolving to detailed validation result
 */
export async function validateCurriculumDataDetailed(
    filePath: string,
    options: CurriculumValidationOptions = {}
): Promise<CurriculumValidationResult> {
    const result: CurriculumValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
    };

    try {
        const data = await loadCurriculumFromJSON(filePath);

        // Basic structure validation
        const requiredFields = [
            "id",
            "grade",
            "subject",
            "topic",
            "concept",
            "difficulty",
            "questionTypes",
        ];
        for (const field of requiredFields) {
            if (
                !(field in data) ||
                data[field as keyof CurriculumContent] == null
            ) {
                result.errors.push(`Missing required field: ${field}`);
                result.isValid = false;
            }
        }

        // Validate concept structure
        if (!data.concept) {
            result.errors.push("Missing concept object");
            result.isValid = false;
        } else {
            if (!data.concept.id) result.errors.push("Missing concept.id");
            if (!data.concept.name) result.errors.push("Missing concept.name");
            if (!data.concept.description)
                result.errors.push("Missing concept.description");

            if (
                !data.concept.id ||
                !data.concept.name ||
                !data.concept.description
            ) {
                result.isValid = false;
            }

            // Check keywords
            const keywordCount = data.concept.keywords?.length || 0;
            if (options.minKeywords && keywordCount < options.minKeywords) {
                result.errors.push(
                    `Concept must have at least ${options.minKeywords} keywords, found ${keywordCount}`
                );
                result.isValid = false;
            }
        }

        // Validate sample questions
        if (
            options.requireSampleQuestions &&
            (!data.sampleQuestions || data.sampleQuestions.length === 0)
        ) {
            result.errors.push("Sample questions are required but missing");
            result.isValid = false;
        }

        if (data.sampleQuestions && Array.isArray(data.sampleQuestions)) {
            for (const [index, question] of data.sampleQuestions.entries()) {
                if (!question.id)
                    result.errors.push(
                        `Sample question ${index + 1} missing id`
                    );
                if (!question.question)
                    result.errors.push(
                        `Sample question ${index + 1} missing question text`
                    );
                if (question.answer === undefined)
                    result.errors.push(
                        `Sample question ${index + 1} missing answer`
                    );
                if (!question.type)
                    result.errors.push(
                        `Sample question ${index + 1} missing type`
                    );

                if (
                    !question.id ||
                    !question.question ||
                    question.answer === undefined ||
                    !question.type
                ) {
                    result.isValid = false;
                }
            }
        }

        // Validate learning objectives
        if (
            options.requireLearningObjectives &&
            (!data.learningObjectives || data.learningObjectives.length === 0)
        ) {
            result.errors.push("Learning objectives are required but missing");
            result.isValid = false;
        }

        // Validate prerequisites
        if (
            options.requirePrerequisites &&
            (!data.prerequisites || data.prerequisites.length === 0)
        ) {
            result.errors.push("Prerequisites are required but missing");
            result.isValid = false;
        }

        // Add warnings for missing optional fields
        if (!data.sampleQuestions || data.sampleQuestions.length === 0) {
            result.warnings.push("No sample questions provided");
        }
        if (!data.learningObjectives || data.learningObjectives.length === 0) {
            result.warnings.push("No learning objectives provided");
        }
        if (!data.prerequisites || data.prerequisites.length === 0) {
            result.warnings.push("No prerequisites specified");
        }

        return result;
    } catch (error) {
        result.isValid = false;
        result.errors.push(
            `Failed to load or parse curriculum data: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
        return result;
    }
}

/**
 * Processes multiple curriculum items from a JSON array file
 * @param filePath - Absolute path to JSON file containing array of curriculum items
 * @returns Promise resolving to array of curriculum IDs that were processed
 */
export async function processCurriculumBatch(
    filePath: string
): Promise<string[]> {
    try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(fileContent);

        if (!Array.isArray(jsonData)) {
            throw new Error(
                "JSON file must contain an array of curriculum items"
            );
        }

        const processedIds: string[] = [];

        for (const item of jsonData) {
            // Convert date strings to Date objects
            if (item.createdAt) {
                item.createdAt = new Date(item.createdAt);
            }
            if (item.updatedAt) {
                item.updatedAt = new Date(item.updatedAt);
            }

            // Validate each item
            const isValid = await validateCurriculumItem(item);
            if (isValid) {
                processedIds.push(item.id);
            } else {
                console.warn(
                    `Skipping invalid curriculum item with ID: ${
                        item.id || "unknown"
                    }`
                );
            }
        }

        return processedIds;
    } catch (error) {
        // Check for file not found errors
        const isFileNotFound =
            error instanceof Error &&
            (error.message.includes("ENOENT") ||
                (error as any).code === "ENOENT" ||
                error.message.includes("no such file or directory"));

        if (isFileNotFound) {
            throw new Error("File not found or invalid JSON");
        }
        throw new Error(
            `Failed to process curriculum batch: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
    }
}

/**
 * Validates a single curriculum item object
 * @param item - The curriculum item to validate
 * @returns boolean indicating if the item is valid
 */
async function validateCurriculumItem(item: any): Promise<boolean> {
    try {
        const requiredFields = [
            "id",
            "grade",
            "subject",
            "topic",
            "concept",
            "difficulty",
            "questionTypes",
        ];
        const hasAllRequired = requiredFields.every(
            (field) => field in item && item[field] != null
        );

        if (!hasAllRequired) {
            return false;
        }

        // Validate concept structure
        if (
            !item.concept ||
            !item.concept.id ||
            !item.concept.name ||
            !item.concept.description
        ) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * Enhanced batch processing with detailed results and options
 * @param filePath - Absolute path to JSON file containing array of curriculum items
 * @param options - Batch processing options
 * @returns Promise resolving to detailed batch processing result
 */
export async function processCurriculumBatchDetailed(
    filePath: string,
    options: CurriculumBatchOptions = {}
): Promise<CurriculumBatchResult> {
    const result: CurriculumBatchResult = {
        processedIds: [],
        skippedIds: [],
        errors: [],
        totalItems: 0,
    };

    try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const jsonData = JSON.parse(fileContent);

        if (!Array.isArray(jsonData)) {
            result.errors.push({
                error: "JSON file must contain an array of curriculum items",
            });
            return result;
        }

        result.totalItems = jsonData.length;
        const maxItems = options.maxItems || jsonData.length;
        const itemsToProcess = jsonData.slice(0, maxItems);

        for (const [index, item] of itemsToProcess.entries()) {
            try {
                // Convert date strings to Date objects
                if (item.createdAt) {
                    item.createdAt = new Date(item.createdAt);
                }
                if (item.updatedAt) {
                    item.updatedAt = new Date(item.updatedAt);
                }

                // Validate each item with detailed validation if options provided
                let isValid = false;
                if (options.validationOptions) {
                    // Use detailed validation to get better error reporting
                    const validationResult =
                        await validateCurriculumItemDetailed(
                            item,
                            options.validationOptions
                        );
                    isValid = validationResult.isValid;

                    if (!isValid && validationResult.errors.length > 0) {
                        result.errors.push({
                            itemId: item.id || `item-${index + 1}`,
                            error: `Validation failed: ${validationResult.errors.join(
                                ", "
                            )}`,
                        });
                    }
                } else {
                    // Use simple validation
                    isValid = await validateCurriculumItem(item);
                }

                if (isValid) {
                    result.processedIds.push(item.id);
                } else {
                    if (options.skipInvalid !== false) {
                        result.skippedIds.push(
                            item.id || `unknown-${index + 1}`
                        );
                    }

                    if (options.stopOnError) {
                        break;
                    }
                }
            } catch (itemError) {
                const error = {
                    itemId: item?.id || `item-${index + 1}`,
                    error: `Processing error: ${
                        itemError instanceof Error
                            ? itemError.message
                            : "Unknown error"
                    }`,
                };
                result.errors.push(error);

                if (options.stopOnError) {
                    break;
                }
            }
        }

        return result;
    } catch (error) {
        result.errors.push({
            error:
                error instanceof Error &&
                (error.message.includes("ENOENT") ||
                    (error as any).code === "ENOENT" ||
                    error.message.includes("no such file or directory"))
                    ? "File not found or invalid JSON"
                    : `Failed to process curriculum batch: ${
                          error instanceof Error
                              ? error.message
                              : "Unknown error"
                      }`,
        });
        return result;
    }
}

/**
 * Validates a single curriculum item with detailed feedback
 */
async function validateCurriculumItemDetailed(
    item: any,
    options: CurriculumValidationOptions = {}
): Promise<CurriculumValidationResult> {
    const result: CurriculumValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
    };

    try {
        // Basic structure validation
        const requiredFields = [
            "id",
            "grade",
            "subject",
            "topic",
            "concept",
            "difficulty",
            "questionTypes",
        ];
        for (const field of requiredFields) {
            if (!(field in item) || item[field] == null) {
                result.errors.push(`Missing required field: ${field}`);
                result.isValid = false;
            }
        }

        // Validate concept structure (same logic as detailed validation)
        if (!item.concept) {
            result.errors.push("Missing concept object");
            result.isValid = false;
        } else {
            if (!item.concept.id) result.errors.push("Missing concept.id");
            if (!item.concept.name) result.errors.push("Missing concept.name");
            if (!item.concept.description)
                result.errors.push("Missing concept.description");

            if (
                !item.concept.id ||
                !item.concept.name ||
                !item.concept.description
            ) {
                result.isValid = false;
            }

            // Check keywords requirement
            const keywordCount = item.concept.keywords?.length || 0;
            if (options.minKeywords && keywordCount < options.minKeywords) {
                result.errors.push(
                    `Concept must have at least ${options.minKeywords} keywords, found ${keywordCount}`
                );
                result.isValid = false;
            }
        }

        return result;
    } catch (error) {
        result.isValid = false;
        result.errors.push(
            `Validation error: ${
                error instanceof Error ? error.message : "Unknown error"
            }`
        );
        return result;
    }
}
