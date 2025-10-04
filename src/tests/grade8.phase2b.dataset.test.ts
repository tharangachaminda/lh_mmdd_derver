/**
 * Grade 8 Phase 2B Dataset Tests - Perimeter, Area, and Volume
 *
 * RED phase: Write failing tests for Phase 2B dataset before implementation
 * Focus: Perimeter, area, volume calculations with missing lengths
 * Target: 30 questions (12 easy, 12 medium, 6 hard)
 *
 * @fileoverview Comprehensive test suite for PERIMETER_AREA_VOLUME questions
 * @author Learning Hub Development Team
 * @version 1.0.0
 */

import { describe, test, expect, beforeAll } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Grade 8 Phase 2B Dataset - Perimeter, Area, and Volume", () => {
    let dataset: any;
    let questions: any[];

    beforeAll(() => {
        const filePath = path.join(
            __dirname,
            "../../question_bank/grade8/grade8_perimeter_area_volume_questions.json"
        );

        // This will fail initially as the file doesn't exist yet (RED phase)
        expect(fs.existsSync(filePath)).toBe(true);

        const fileContent = fs.readFileSync(filePath, "utf8");
        dataset = JSON.parse(fileContent);
        questions = dataset.questions || [];
    });

    // ========================================
    // 1. DATASET STRUCTURE VALIDATION (4 tests)
    // ========================================

    test("should have proper dataset metadata structure", () => {
        expect(dataset).toHaveProperty("metadata");
        expect(dataset.metadata).toHaveProperty(
            "datasetId",
            "grade8-perimeter-area-volume-2025"
        );
        expect(dataset.metadata).toHaveProperty(
            "datasetName",
            "Grade 8 Perimeter, Area, and Volume Questions"
        );
        expect(dataset.metadata).toHaveProperty("grade", 8);
        expect(dataset.metadata).toHaveProperty("subject", "Mathematics");
        expect(dataset.metadata).toHaveProperty(
            "topic",
            "PERIMETER_AREA_VOLUME"
        );
    });

    test("should have exactly 31 questions total", () => {
        expect(questions).toHaveLength(31);
    });

    test("should have proper difficulty distribution", () => {
        const difficulties = questions.map((q) => q.difficulty);
        const easyCount = difficulties.filter((d) => d === "easy").length;
        const mediumCount = difficulties.filter((d) => d === "medium").length;
        const hardCount = difficulties.filter((d) => d === "hard").length;

        expect(easyCount).toBe(13);
        expect(mediumCount).toBe(12);
        expect(hardCount).toBe(6);
    });

    test("should have proper question structure for all questions", () => {
        questions.forEach((question, index) => {
            expect(question).toHaveProperty("id");
            expect(question).toHaveProperty("question");
            expect(question).toHaveProperty("answer");
            expect(question).toHaveProperty("explanation");
            expect(question).toHaveProperty("difficulty");
            expect(question).toHaveProperty("type", "PERIMETER_AREA_VOLUME");
            expect(question).toHaveProperty("grade", 8);
            expect(question).toHaveProperty("subject", "Mathematics");
            expect(question).toHaveProperty(
                "curriculumTopic",
                "Measurement and Applications"
            );
        });
    });

    // ========================================
    // 2. PERIMETER QUESTIONS (5 tests)
    // ========================================

    test("should include rectangle perimeter calculations", () => {
        const rectanglePerimeterQuestions = questions.filter(
            (q) => q.category === "perimeter" && q.subcategory === "rectangle"
        );
        expect(rectanglePerimeterQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include triangle perimeter calculations", () => {
        const trianglePerimeterQuestions = questions.filter(
            (q) => q.category === "perimeter" && q.subcategory === "triangle"
        );
        expect(trianglePerimeterQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include composite shape perimeter calculations", () => {
        const compositePerimeterQuestions = questions.filter(
            (q) => q.category === "perimeter" && q.subcategory === "composite"
        );
        expect(compositePerimeterQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should have perimeter questions with missing side lengths", () => {
        const missingSideQuestions = questions.filter(
            (q) =>
                q.category === "perimeter" && q.subcategory === "missing-side"
        );
        expect(missingSideQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include perimeter questions with real-world contexts", () => {
        const realWorldPerimeterQuestions = questions.filter(
            (q) => q.category === "perimeter" && q.subcategory === "real-world"
        );
        expect(realWorldPerimeterQuestions.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 3. AREA QUESTIONS (6 tests)
    // ========================================

    test("should include rectangle and square area calculations", () => {
        const rectangleAreaQuestions = questions.filter(
            (q) =>
                q.category === "area" &&
                (q.subcategory === "rectangle" || q.subcategory === "square")
        );
        expect(rectangleAreaQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include triangle area calculations", () => {
        const triangleAreaQuestions = questions.filter(
            (q) => q.category === "area" && q.subcategory === "triangle"
        );
        expect(triangleAreaQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include circle area calculations", () => {
        const circleAreaQuestions = questions.filter(
            (q) => q.category === "area" && q.subcategory === "circle"
        );
        expect(circleAreaQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include parallelogram or trapezoid area calculations", () => {
        const parallelogramQuestions = questions.filter(
            (q) =>
                q.category === "area" &&
                (q.subcategory === "parallelogram" ||
                    q.subcategory === "trapezoid-area")
        );
        expect(parallelogramQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should have area questions with missing dimensions", () => {
        const missingDimensionQuestions = questions.filter(
            (q) =>
                q.category === "area" && q.subcategory === "missing-dimension"
        );
        expect(missingDimensionQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include area questions with real-world applications", () => {
        const realWorldAreaQuestions = questions.filter(
            (q) => q.category === "area" && q.subcategory === "real-world"
        );
        expect(realWorldAreaQuestions.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 4. VOLUME QUESTIONS (6 tests)
    // ========================================

    test("should include rectangular prism volume calculations", () => {
        const prismVolumeQuestions = questions.filter(
            (q) =>
                q.category === "volume" && q.subcategory === "rectangular-prism"
        );
        expect(prismVolumeQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include cube volume calculations", () => {
        const cubeVolumeQuestions = questions.filter(
            (q) => q.category === "volume" && q.subcategory === "cube"
        );
        expect(cubeVolumeQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include cylinder volume calculations", () => {
        const cylinderVolumeQuestions = questions.filter(
            (q) => q.category === "volume" && q.subcategory === "cylinder"
        );
        expect(cylinderVolumeQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include pyramid or cone volume calculations", () => {
        const pyramidVolumeQuestions = questions.filter(
            (q) =>
                q.category === "volume" &&
                (q.subcategory === "pyramid" || q.subcategory === "cone-volume")
        );
        expect(pyramidVolumeQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should have volume questions with missing dimensions", () => {
        const missingVolumeQuestions = questions.filter(
            (q) =>
                q.category === "volume" && q.subcategory === "missing-dimension"
        );
        expect(missingVolumeQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include volume questions with real-world contexts", () => {
        const realWorldVolumeQuestions = questions.filter(
            (q) =>
                q.category === "volume" &&
                (q.subcategory === "real-world" ||
                    q.subcategory === "practical-application")
        );
        expect(realWorldVolumeQuestions.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 5. MISSING LENGTH QUESTIONS (4 tests)
    // ========================================

    test("should have questions requiring reverse calculation from perimeter", () => {
        const reversePerimeterQuestions = questions.filter(
            (q) => q.subcategory === "reverse-perimeter"
        );
        expect(reversePerimeterQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should have questions requiring reverse calculation from area", () => {
        const reverseAreaQuestions = questions.filter(
            (q) => q.subcategory === "reverse-area"
        );
        expect(reverseAreaQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should have questions requiring reverse calculation from volume", () => {
        const reverseVolumeQuestions = questions.filter(
            (q) => q.subcategory === "reverse-volume"
        );
        expect(reverseVolumeQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include composite shape problems with missing dimensions", () => {
        const compositeProblems = questions.filter(
            (q) => q.subcategory === "missing-dimensions"
        );
        expect(compositeProblems.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 6. QUESTION QUALITY STANDARDS (4 tests)
    // ========================================

    test("should have age-appropriate mathematical complexity", () => {
        questions.forEach((question) => {
            // Check for Grade 8 appropriate mathematical concepts including geometric descriptors
            expect(question.question.toLowerCase()).toMatch(
                /perimeter|area|volume|rectangle|triangle|circle|square|cube|cylinder|prism|rectangular|triangular|circular|cubic|cylindrical|spherical|conical|pyramidal/
            );

            // Ensure no overly advanced concepts for Grade 8
            expect(question.question.toLowerCase()).not.toMatch(
                /calculus|derivative|integral|trigonometry|logarithm|matrix/
            );
        });
    });

    test("should include proper units in answers and explanations", () => {
        questions.forEach((question) => {
            if (question.question.toLowerCase().includes("perimeter")) {
                expect(question.answer.toLowerCase()).toMatch(
                    /cm|m|mm|km|metre|meter|centimetre|\$/
                );
            }
            if (question.question.toLowerCase().includes("area")) {
                // For missing dimension questions, expect linear units; for area calculations, expect area units
                if (
                    question.subcategory === "missing-dimension" ||
                    question.question.toLowerCase().includes("width") ||
                    question.question.toLowerCase().includes("height") ||
                    question.question.toLowerCase().includes("length") ||
                    question.question.toLowerCase().includes("side") ||
                    question.question.toLowerCase().includes("radius")
                ) {
                    expect(question.answer.toLowerCase()).toMatch(
                        /cm|m|mm|km|metre|meter|centimetre|\$/
                    );
                } else {
                    expect(question.answer.toLowerCase()).toMatch(
                        /cm²|m²|mm²|km²|square|\$/
                    );
                }
            }
            if (question.question.toLowerCase().includes("volume")) {
                // For missing dimension questions, expect linear units; for volume calculations, expect volume units
                if (
                    question.subcategory === "missing-dimension" ||
                    question.question.toLowerCase().includes("width") ||
                    question.question.toLowerCase().includes("height") ||
                    question.question.toLowerCase().includes("length") ||
                    question.question.toLowerCase().includes("side") ||
                    question.question.toLowerCase().includes("radius") ||
                    question.question.toLowerCase().includes("edge")
                ) {
                    expect(question.answer.toLowerCase()).toMatch(
                        /cm|m|mm|km|metre|meter|centimetre|\$/
                    );
                } else {
                    expect(question.answer.toLowerCase()).toMatch(
                        /cm³|m³|mm³|litre|liter|cubic|\$/
                    );
                }
            }
        });
    });

    test("should have comprehensive explanations with formulas", () => {
        questions.forEach((question) => {
            expect(question.explanation).toBeTruthy();

            // Check for formula explanations based on question type
            if (
                question.question.toLowerCase().includes("area") &&
                question.question.toLowerCase().includes("rectangle")
            ) {
                expect(question.explanation.toLowerCase()).toMatch(
                    /length.*width|width.*length|l.*w|w.*l/
                );
            }
            if (
                question.question.toLowerCase().includes("volume") &&
                question.question.toLowerCase().includes("prism")
            ) {
                expect(question.explanation.toLowerCase()).toMatch(
                    /length.*width.*height|l.*w.*h/
                );
            }
        });
    });

    test("should have proper New Zealand curriculum alignment", () => {
        questions.forEach((question) => {
            expect(question.curriculumTopic).toBe(
                "Measurement and Applications"
            );
            expect(question.curriculumSubtopic).toMatch(
                /perimeter|area|volume|measurement|spatial/i
            );

            // Check for NZ-specific contexts where applicable
            const nzContexts =
                /new zealand|nz|maori|kiwi|auckland|wellington|christchurch/i;
            // Not required but good to have some NZ context
        });
    });
});

/**
 * Test file validation checklist:
 *
 * ✅ Dataset structure validation (4 tests)
 * ✅ Perimeter question validation (5 tests)
 * ✅ Area question validation (6 tests)
 * ✅ Volume question validation (6 tests)
 * ✅ Missing length question validation (4 tests)
 * ✅ Quality standards validation (4 tests)
 *
 * Total: 29 comprehensive tests covering all aspects of Phase 2B
 *
 * Expected Initial Status: All tests FAILING (RED phase)
 * Next Phase: Implement minimal dataset to make tests pass (GREEN phase)
 */
