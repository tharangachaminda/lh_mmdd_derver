/**
 * Grade 7 Phase 1C - Algebraic Foundations Dataset Test
 *
 * TDD RED Phase: This test MUST fail initially to enforce proper TDD methodology.
 * Tests the creation and validation of Grade 7 algebraic foundations questions covering:
 * - Variable substitution and evaluation
 * - Pattern recognition and rules
 * - Simple equation solving
 * - Basic coordinate systems
 * - Expression simplification
 *
 * Expected to fail until:
 * 1. ALGEBRAIC_FOUNDATIONS enum is added to QuestionType
 * 2. grade7_algebraic_foundations_questions.json dataset is created
 * 3. All 30 questions are properly structured and validated
 */

import { QuestionType } from "../models/question.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Grade 7 Phase 1C - Algebraic Foundations Dataset", () => {
    const datasetPath = path.join(
        __dirname,
        "../../question_bank/grade7/grade7_algebraic_foundations_questions.json"
    );

    beforeAll(() => {
        // Verify TDD RED phase - test should fail initially
        console.log(
            "🔴 TDD RED PHASE: Testing Grade 7 Phase 1C implementation"
        );
        console.log(
            "Expected: This test should FAIL until ALGEBRAIC_FOUNDATIONS is implemented"
        );
    });

    describe("ALGEBRAIC_FOUNDATIONS Question Type", () => {
        test("should have ALGEBRAIC_FOUNDATIONS enum defined", () => {
            // This will fail until enum is added
            expect(QuestionType.ALGEBRAIC_FOUNDATIONS).toBeDefined();
            expect(typeof QuestionType.ALGEBRAIC_FOUNDATIONS).toBe("string");
            expect(QuestionType.ALGEBRAIC_FOUNDATIONS).toBe(
                "algebraic_foundations"
            );
        });
    });

    describe("Dataset File Existence and Structure", () => {
        test("should have grade7_algebraic_foundations_questions.json file", () => {
            // This will fail until dataset file is created
            expect(fs.existsSync(datasetPath)).toBe(true);
        });

        test("should have valid JSON structure", () => {
            // This will fail until valid JSON is created
            const rawData = fs.readFileSync(datasetPath, "utf8");
            const dataset = JSON.parse(rawData);

            expect(dataset).toHaveProperty("metadata");
            expect(dataset).toHaveProperty("questions");
            expect(Array.isArray(dataset.questions)).toBe(true);
        });
    });

    describe("Metadata Validation", () => {
        let dataset: any;

        beforeAll(() => {
            const rawData = fs.readFileSync(datasetPath, "utf8");
            dataset = JSON.parse(rawData);
        });

        test("should have correct metadata structure", () => {
            const { metadata } = dataset;

            expect(metadata.datasetId).toBe(
                "grade7-algebraic-foundations-2025"
            );
            expect(metadata.datasetName).toBe(
                "Grade 7 Algebraic Foundations Questions"
            );
            expect(metadata.grade).toBe(7);
            expect(metadata.subject).toBe("Mathematics");
            expect(metadata.curriculumTopic).toBe("Number and Algebra");
            expect(metadata.curriculumSubtopic).toContain("algebraic");
            expect(metadata.totalQuestions).toBe(30);
            expect(metadata.questionTypes).toContain("ALGEBRAIC_FOUNDATIONS");
            expect(metadata.verified).toBe(true);
            expect(metadata.curriculumAligned).toBe(true);
        });

        test("should have correct difficulty distribution", () => {
            const { difficultyDistribution } = dataset.metadata;

            expect(difficultyDistribution.easy).toBe(12);
            expect(difficultyDistribution.medium).toBe(12);
            expect(difficultyDistribution.hard).toBe(6);
        });
    });

    describe("Questions Content Validation", () => {
        let dataset: any;

        beforeAll(() => {
            const rawData = fs.readFileSync(datasetPath, "utf8");
            dataset = JSON.parse(rawData);
        });

        test("should have exactly 30 questions", () => {
            expect(dataset.questions).toHaveLength(30);
        });

        test("should have correct difficulty distribution in questions", () => {
            const easyQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "easy"
            );
            const mediumQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "medium"
            );
            const hardQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "hard"
            );

            expect(easyQuestions).toHaveLength(12);
            expect(mediumQuestions).toHaveLength(12);
            expect(hardQuestions).toHaveLength(6);
        });

        test("should have all questions with ALGEBRAIC_FOUNDATIONS type", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.type).toBe("ALGEBRAIC_FOUNDATIONS");
            });
        });

        test("should have comprehensive algebraic content coverage", () => {
            const keywords = dataset.questions.flatMap((q: any) => q.keywords);

            // Should cover key algebraic concepts
            expect(keywords.some((k: string) => k.includes("variable"))).toBe(
                true
            );
            expect(
                keywords.some((k: string) => k.includes("substitution"))
            ).toBe(true);
            expect(keywords.some((k: string) => k.includes("equation"))).toBe(
                true
            );
            expect(keywords.some((k: string) => k.includes("pattern"))).toBe(
                true
            );
            expect(keywords.some((k: string) => k.includes("coordinate"))).toBe(
                true
            );
            expect(keywords.some((k: string) => k.includes("expression"))).toBe(
                true
            );
        });

        test("should have proper question structure for each question", () => {
            dataset.questions.forEach((question: any, index: number) => {
                // Required fields
                expect(question).toHaveProperty("id");
                expect(question).toHaveProperty("question");
                expect(question).toHaveProperty("answer");
                expect(question).toHaveProperty("explanation");
                expect(question).toHaveProperty("type");
                expect(question).toHaveProperty("difficulty");
                expect(question).toHaveProperty("grade");
                expect(question).toHaveProperty("subject");
                expect(question).toHaveProperty("curriculumTopic");
                expect(question).toHaveProperty("curriculumSubtopic");
                expect(question).toHaveProperty("keywords");
                expect(question).toHaveProperty("contentForEmbedding");

                // Validate values
                expect(question.grade).toBe(7);
                expect(question.subject).toBe("Mathematics");
                expect(question.curriculumTopic).toBe("Number and Algebra");
                expect(["easy", "medium", "hard"]).toContain(
                    question.difficulty
                );
                expect(Array.isArray(question.keywords)).toBe(true);
                expect(question.keywords.length).toBeGreaterThan(0);

                // ID format validation
                expect(question.id).toMatch(
                    /^g7-ALGEBRAIC_FOUNDATIONS-(easy|medium|hard)-\d{3}$/
                );
            });
        });
    });

    describe("Algebraic Content Quality", () => {
        let dataset: any;

        beforeAll(() => {
            const rawData = fs.readFileSync(datasetPath, "utf8");
            dataset = JSON.parse(rawData);
        });

        test("should include variable substitution questions", () => {
            const substitutionQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("substitute") ||
                    q.question.toLowerCase().includes("when") ||
                    q.keywords.some((k: string) => k.includes("substitution"))
            );
            expect(substitutionQuestions.length).toBeGreaterThan(0);
        });

        test("should include pattern recognition questions", () => {
            const patternQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("pattern") ||
                    q.question.toLowerCase().includes("sequence") ||
                    q.keywords.some((k: string) => k.includes("pattern"))
            );
            expect(patternQuestions.length).toBeGreaterThan(0);
        });

        test("should include simple equation solving questions", () => {
            const equationQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("solve") ||
                    q.question.toLowerCase().includes("x =") ||
                    q.keywords.some((k: string) => k.includes("equation"))
            );
            expect(equationQuestions.length).toBeGreaterThan(0);
        });

        test("should include coordinate system questions", () => {
            const coordinateQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("coordinate") ||
                    q.question.toLowerCase().includes("plot") ||
                    q.question.toLowerCase().includes("graph") ||
                    q.keywords.some((k: string) => k.includes("coordinate"))
            );
            expect(coordinateQuestions.length).toBeGreaterThan(0);
        });
    });

    describe("NZ Year 7 Curriculum Alignment", () => {
        let dataset: any;

        beforeAll(() => {
            const rawData = fs.readFileSync(datasetPath, "utf8");
            dataset = JSON.parse(rawData);
        });

        test("should align with NZ algebra curriculum objectives", () => {
            const questions = dataset.questions;

            // Variables and substitution (w + 12 when w = 4)
            const variableQuestions = questions.filter(
                (q: any) =>
                    q.curriculumSubtopic.toLowerCase().includes("variable") ||
                    q.question.toLowerCase().includes("when") ||
                    q.question.match(/[a-z]\s*[+\-*/]\s*\d+/)
            );
            expect(variableQuestions.length).toBeGreaterThan(0);

            // Coordinate systems
            const coordinateQuestions = questions.filter(
                (q: any) =>
                    q.curriculumSubtopic.toLowerCase().includes("coordinate") ||
                    q.keywords.some((k: string) => k.includes("coordinate"))
            );
            expect(coordinateQuestions.length).toBeGreaterThan(0);
        });

        test("should use NZ curriculum vocabulary", () => {
            const allText = dataset.questions
                .map(
                    (q: any) =>
                        `${q.question} ${q.explanation} ${q.keywords.join(" ")}`
                )
                .join(" ")
                .toLowerCase();

            // Key vocabulary from curriculum
            const expectedTerms = [
                "variable",
                "expression",
                "coordinate",
                "coefficient",
                "pattern",
                "rule",
                "substitute",
                "solve",
            ];

            expectedTerms.forEach((term) => {
                expect(allText).toContain(term);
            });
        });
    });
});
