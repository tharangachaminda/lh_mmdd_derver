import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import path from "path";
import {
    validateCurriculumDataDetailed,
    processCurriculumBatchDetailed,
} from "../utils/curriculum.loader.js";
import {
    CurriculumValidationOptions,
    CurriculumBatchOptions,
} from "../interfaces/curriculum-loader.interface.js";

describe("Enhanced Curriculum Utilities", () => {
    describe("validateCurriculumDataDetailed", () => {
        it("should provide detailed validation feedback", async () => {
            const jsonPath = path.join(
                process.cwd(),
                "sample-curriculum-data.json"
            );

            const result = await validateCurriculumDataDetailed(jsonPath);

            expect(result).toBeDefined();
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
            expect(result.warnings).toBeDefined();
        });

        it("should validate with custom options", async () => {
            const jsonPath = path.join(
                process.cwd(),
                "sample-curriculum-data.json"
            );
            const options: CurriculumValidationOptions = {
                requireSampleQuestions: true,
                requireLearningObjectives: true,
                requirePrerequisites: true,
                minKeywords: 3,
            };

            const result = await validateCurriculumDataDetailed(
                jsonPath,
                options
            );

            expect(result).toBeDefined();
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should fail validation with strict requirements on insufficient data", async () => {
            const jsonPath = path.join(
                process.cwd(),
                "sample-curriculum-data.json"
            );
            const options: CurriculumValidationOptions = {
                minKeywords: 10, // This should fail since sample data has fewer keywords
            };

            const result = await validateCurriculumDataDetailed(
                jsonPath,
                options
            );

            expect(result).toBeDefined();
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain(
                "must have at least 10 keywords"
            );
        });

        it("should handle missing files gracefully", async () => {
            const invalidPath = "non-existent-file.json";

            const result = await validateCurriculumDataDetailed(invalidPath);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain(
                "Failed to load or parse curriculum data"
            );
        });
    });

    describe("processCurriculumBatchDetailed", () => {
        it("should process batch with detailed results", async () => {
            const jsonPath = path.join(
                process.cwd(),
                "curriculum-batch-sample.json"
            );

            const result = await processCurriculumBatchDetailed(jsonPath);

            expect(result).toBeDefined();
            expect(result.totalItems).toBe(3);
            expect(result.processedIds).toHaveLength(3);
            expect(result.skippedIds).toHaveLength(0);
            expect(result.errors).toHaveLength(0);
        });

        it("should limit processing with maxItems option", async () => {
            const jsonPath = path.join(
                process.cwd(),
                "curriculum-batch-sample.json"
            );
            const options: CurriculumBatchOptions = {
                maxItems: 2,
            };

            const result = await processCurriculumBatchDetailed(
                jsonPath,
                options
            );

            expect(result.totalItems).toBe(3);
            expect(result.processedIds).toHaveLength(2);
        });

        it("should handle validation options", async () => {
            const jsonPath = path.join(
                process.cwd(),
                "curriculum-batch-sample.json"
            );
            const options: CurriculumBatchOptions = {
                validationOptions: {
                    requireSampleQuestions: true,
                    requireLearningObjectives: true,
                },
            };

            const result = await processCurriculumBatchDetailed(
                jsonPath,
                options
            );

            expect(result.processedIds).toHaveLength(3);
            expect(result.errors).toHaveLength(0);
        });

        it("should stop on error when configured", async () => {
            const jsonPath = path.join(
                process.cwd(),
                "curriculum-batch-sample.json"
            );
            const options: CurriculumBatchOptions = {
                stopOnError: true,
                validationOptions: {
                    minKeywords: 100, // This will cause all items to fail validation
                },
            };

            const result = await processCurriculumBatchDetailed(
                jsonPath,
                options
            );

            expect(result.processedIds).toHaveLength(0);
            expect(result.errors.length).toBeGreaterThan(0);
            // Should stop after first error
            expect(result.errors).toHaveLength(1);
        });

        it("should handle file not found errors", async () => {
            const invalidPath = "non-existent-batch-file.json";
            
            const result = await processCurriculumBatchDetailed(invalidPath);
            
            expect(result.processedIds).toHaveLength(0);
            expect(result.errors).toHaveLength(1);
            

            
            expect(result.errors[0].error).toMatch(
                /File not found|Failed to process curriculum batch/
            );
        });
    });
});
