/**
 * Grade 8 Phase 2D Dataset Tests - Ratios and Proportions
 *
 * RED phase: Write failing tests for Phase 2D dataset before implementation
 * Focus: Ratios, proportions, scale factors, unit rates
 * Target: 30 questions (12 easy, 12 medium, 6 hard)
 *
 * @fileoverview Comprehensive test suite for RATIOS_AND_PROPORTIONS questions
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

describe("Grade 8 Phase 2D Dataset - Ratios and Proportions", () => {
    let dataset: any;
    let questions: any[];

    beforeAll(() => {
        const filePath = path.join(
            __dirname,
            "../../question_bank/grade8/grade8_ratios_proportions_questions.json"
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
            "grade8-ratios-proportions-2025"
        );
        expect(dataset.metadata).toHaveProperty(
            "datasetName",
            "Grade 8 Ratios and Proportions Questions"
        );
        expect(dataset.metadata).toHaveProperty("grade", 8);
        expect(dataset.metadata).toHaveProperty("subject", "Mathematics");
        expect(dataset.metadata).toHaveProperty(
            "topic",
            "RATIOS_AND_PROPORTIONS"
        );
    });

    test("should have exactly 30 questions total", () => {
        expect(questions).toHaveLength(30);
    });

    test("should have proper difficulty distribution", () => {
        const difficulties = questions.map((q) => q.difficulty);
        const easyCount = difficulties.filter((d) => d === "easy").length;
        const mediumCount = difficulties.filter((d) => d === "medium").length;
        const hardCount = difficulties.filter((d) => d === "hard").length;

        expect(easyCount).toBe(12);
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
            expect(question).toHaveProperty("type", "RATIOS_AND_PROPORTIONS");
            expect(question).toHaveProperty("grade", 8);
            expect(question).toHaveProperty("subject", "Mathematics");
            expect(question).toHaveProperty(
                "curriculumTopic",
                "Number and Algebra"
            );
        });
    });

    // ========================================
    // 2. BASIC RATIO QUESTIONS (5 tests)
    // ========================================

    test("should include simple ratio calculations", () => {
        const simpleRatioQuestions = questions.filter(
            (q) => q.category === "ratio" && q.subcategory === "simple-ratio"
        );
        expect(simpleRatioQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include equivalent ratio problems", () => {
        const equivalentRatioQuestions = questions.filter(
            (q) =>
                q.category === "ratio" && q.subcategory === "equivalent-ratio"
        );
        expect(equivalentRatioQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include ratio simplification problems", () => {
        const simplificationQuestions = questions.filter(
            (q) => q.category === "ratio" && q.subcategory === "simplification"
        );
        expect(simplificationQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include ratio comparison problems", () => {
        const comparisonQuestions = questions.filter(
            (q) => q.category === "ratio" && q.subcategory === "comparison"
        );
        expect(comparisonQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include three-part ratio problems", () => {
        const threePartQuestions = questions.filter(
            (q) => q.category === "ratio" && q.subcategory === "three-part"
        );
        expect(threePartQuestions.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 3. PROPORTION QUESTIONS (6 tests)
    // ========================================

    test("should include basic proportion solving", () => {
        const basicProportionQuestions = questions.filter(
            (q) =>
                q.category === "proportion" && q.subcategory === "basic-solving"
        );
        expect(basicProportionQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include cross-multiplication problems", () => {
        const crossMultiplicationQuestions = questions.filter(
            (q) =>
                q.category === "proportion" &&
                q.subcategory === "cross-multiplication"
        );
        expect(crossMultiplicationQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include direct proportion problems", () => {
        const directProportionQuestions = questions.filter(
            (q) =>
                q.category === "proportion" &&
                q.subcategory === "direct-proportion"
        );
        expect(directProportionQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include inverse proportion problems", () => {
        const inverseProportionQuestions = questions.filter(
            (q) =>
                q.category === "proportion" &&
                q.subcategory === "inverse-proportion"
        );
        expect(inverseProportionQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include proportion word problems", () => {
        const wordProblemQuestions = questions.filter(
            (q) =>
                q.category === "proportion" && q.subcategory === "word-problems"
        );
        expect(wordProblemQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include missing value in proportion problems", () => {
        const missingValueQuestions = questions.filter(
            (q) =>
                q.category === "proportion" && q.subcategory === "missing-value"
        );
        expect(missingValueQuestions.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 4. UNIT RATE QUESTIONS (5 tests)
    // ========================================

    test("should include basic unit rate calculations", () => {
        const unitRateQuestions = questions.filter(
            (q) =>
                q.category === "unit-rate" &&
                q.subcategory === "basic-calculation"
        );
        expect(unitRateQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include best value comparison problems", () => {
        const bestValueQuestions = questions.filter(
            (q) => q.category === "unit-rate" && q.subcategory === "best-value"
        );
        expect(bestValueQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include speed rate problems", () => {
        const speedRateQuestions = questions.filter(
            (q) => q.category === "unit-rate" && q.subcategory === "speed-rate"
        );
        expect(speedRateQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include price per unit problems", () => {
        const pricePerUnitQuestions = questions.filter(
            (q) =>
                q.category === "unit-rate" && q.subcategory === "price-per-unit"
        );
        expect(pricePerUnitQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include unit rate conversion problems", () => {
        const conversionQuestions = questions.filter(
            (q) => q.category === "unit-rate" && q.subcategory === "conversion"
        );
        expect(conversionQuestions.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 5. SCALE FACTOR QUESTIONS (5 tests)
    // ========================================

    test("should include basic scale factor problems", () => {
        const scaleFactorQuestions = questions.filter(
            (q) => q.category === "scale" && q.subcategory === "basic-scale"
        );
        expect(scaleFactorQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include map scale problems", () => {
        const mapScaleQuestions = questions.filter(
            (q) => q.category === "scale" && q.subcategory === "map-scale"
        );
        expect(mapScaleQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include similar figures scale problems", () => {
        const similarFiguresQuestions = questions.filter(
            (q) => q.category === "scale" && q.subcategory === "similar-figures"
        );
        expect(similarFiguresQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include scale drawing problems", () => {
        const scaleDrawingQuestions = questions.filter(
            (q) => q.category === "scale" && q.subcategory === "scale-drawing"
        );
        expect(scaleDrawingQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include enlargement and reduction problems", () => {
        const enlargementQuestions = questions.filter(
            (q) =>
                q.category === "scale" &&
                q.subcategory === "enlargement-reduction"
        );
        expect(enlargementQuestions.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 6. REAL-WORLD APPLICATION QUESTIONS (4 tests)
    // ========================================

    test("should include cooking and recipe ratio problems", () => {
        const cookingQuestions = questions.filter(
            (q) =>
                q.category === "real-world" &&
                q.subcategory === "cooking-recipes"
        );
        expect(cookingQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include business and finance ratio problems", () => {
        const businessQuestions = questions.filter(
            (q) =>
                q.category === "real-world" &&
                q.subcategory === "business-finance"
        );
        expect(businessQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include mixture and solution problems", () => {
        const mixtureQuestions = questions.filter(
            (q) =>
                q.category === "real-world" &&
                q.subcategory === "mixture-solution"
        );
        expect(mixtureQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include construction and design ratio problems", () => {
        const constructionQuestions = questions.filter(
            (q) =>
                q.category === "real-world" &&
                q.subcategory === "construction-design"
        );
        expect(constructionQuestions.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 7. QUESTION QUALITY STANDARDS (4 tests)
    // ========================================

    test("should have age-appropriate mathematical complexity", () => {
        questions.forEach((question) => {
            // Check for Grade 8 appropriate mathematical concepts
            expect(question.question.toLowerCase()).toMatch(
                /ratio|proportion|rate|scale|equivalent|simplify|cross|multiply|compare|per|unit|factor|similar|enlarge|reduce/
            );

            // Ensure no overly advanced concepts for Grade 8
            expect(question.question.toLowerCase()).not.toMatch(
                /calculus|derivative|integral|complex|logarithm|matrix|trigonometry/
            );
        });
    });

    test("should include proper ratio notation and units", () => {
        questions.forEach((question) => {
            // Check for proper ratio notation or unit expressions
            const hasRatioNotation =
                question.question.includes(":") ||
                question.answer.includes(":") ||
                question.explanation.includes(":");

            const hasUnitExpression =
                /per|\/|\$|km\/h|m\/s|cents|dollars|grams|litres/.test(
                    question.question.toLowerCase() +
                        " " +
                        question.answer.toLowerCase()
                );

            const hasProportionFormat = /=|equals|proportional|proportion/.test(
                question.question.toLowerCase() +
                    " " +
                    question.explanation.toLowerCase()
            );

            expect(
                hasRatioNotation || hasUnitExpression || hasProportionFormat
            ).toBe(true);
        });
    });

    test("should have comprehensive explanations with mathematical reasoning", () => {
        questions.forEach((question) => {
            expect(question.explanation).toBeTruthy();
            expect(question.explanation.length).toBeGreaterThan(20);

            // Check for mathematical reasoning indicators
            const hasReasoning =
                /because|since|therefore|so|thus|multiply|divide|cross|equivalent|simplify|reduce/.test(
                    question.explanation.toLowerCase()
                );

            expect(hasReasoning).toBe(true);
        });
    });

    test("should have proper New Zealand curriculum alignment", () => {
        questions.forEach((question) => {
            expect(question.curriculumTopic).toBe("Number and Algebra");
            expect(question.curriculumSubtopic).toMatch(
                /ratio|proportion|rate|scale|number|algebra/i
            );

            // Check for appropriate mathematical vocabulary
            const hasAppropriateVocab =
                /ratio|proportion|rate|scale|equivalent|factor|per|unit/.test(
                    question.question.toLowerCase() +
                        " " +
                        question.explanation.toLowerCase()
                );

            expect(hasAppropriateVocab).toBe(true);
        });
    });
});

/**
 * Test file validation checklist:
 *
 * ✅ Dataset structure validation (4 tests)
 * ✅ Basic ratio question validation (5 tests)
 * ✅ Proportion question validation (6 tests)
 * ✅ Unit rate question validation (5 tests)
 * ✅ Scale factor question validation (5 tests)
 * ✅ Real-world application validation (4 tests)
 * ✅ Quality standards validation (4 tests)
 *
 * Total: 33 comprehensive tests covering all aspects of Phase 2D
 *
 * Expected Initial Status: All tests FAILING (RED phase)
 * Next Phase: Implement minimal dataset to make tests pass (GREEN phase)
 */
