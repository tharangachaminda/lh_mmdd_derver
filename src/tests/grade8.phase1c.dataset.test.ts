/**
 * Grade 8 Phase 1C Dataset Tests: Fraction, Decimal, Percentage
 *
 * TDD RED Phase: This test MUST fail initially to enforce proper TDD methodology.
 * 
 * Tests for NZ Curriculum-aligned Grade 8 mathematics questions focusing on:
 * - Converting between fractions, decimals, and percentages
 * - Operations with different denominators
 * - Real-world applications with fractions/decimals/percentages
 * - NZ-specific contexts (GST, shopping, financial literacy)
 *
 * Target: 25 questions with difficulty distribution:
 * - Easy: 10 questions (basic conversions, simple fractions)
 * - Medium: 10 questions (complex conversions, operations)
 * - Hard: 5 questions (multi-step applications, financial scenarios)
 */

import { describe, test, expect, beforeAll } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface Question {
    id: string;
    question: string;
    answer: string;
    explanation: string;
    type: string;
    difficulty: "easy" | "medium" | "hard";
    grade: number;
    subject: string;
    curriculumTopic: string;
    curriculumSubtopic: string;
    keywords: string[];
    createdAt: string;
    version: string;
    verified: boolean;
    documentType: string;
    contentForEmbedding: string;
}

interface Dataset {
    metadata: {
        datasetId: string;
        datasetName: string;
        grade: number;
        subject: string;
        curriculumTopic: string;
        curriculumSubtopic: string;
        totalQuestions: number;
        questionTypes: string[];
        difficultyDistribution: {
            easy: number;
            medium: number;
            hard: number;
        };
        verified: boolean;
        curriculumAligned: boolean;
        version: string;
        createdAt: string;
    };
    questions: Question[];
}

describe("Grade 8 Phase 1C: Fraction, Decimal, Percentage Dataset", () => {
    let dataset: Dataset;
    const expectedFilePath = path.join(
        __dirname,
        "../../question_bank/grade8/grade8_fraction_decimal_percentage_questions.json"
    );

    beforeAll(() => {
        // This test will FAIL initially (RED phase) - dataset file doesn't exist yet
        expect(fs.existsSync(expectedFilePath)).toBe(true);

        const fileContent = fs.readFileSync(expectedFilePath, "utf-8");
        dataset = JSON.parse(fileContent);
    });

    describe("Dataset Metadata Validation", () => {
        test("should have correct NZ curriculum-aligned metadata structure", () => {
            expect(dataset.metadata).toBeDefined();
            expect(dataset.metadata.datasetId).toBe(
                "grade8-fraction-decimal-percentage-2025"
            );
            expect(dataset.metadata.datasetName).toBe(
                "Grade 8 Fraction, Decimal, and Percentage Questions"
            );
            expect(dataset.metadata.grade).toBe(8);
            expect(dataset.metadata.subject).toBe("Mathematics");
            expect(dataset.metadata.curriculumTopic).toBe("Number and Algebra");
            expect(dataset.metadata.curriculumSubtopic).toBe(
                "Converting between fractions, decimals, and percentages with real-world applications"
            );
            expect(dataset.metadata.totalQuestions).toBe(25);
            expect(dataset.metadata.questionTypes).toEqual([
                "FRACTION_DECIMAL_PERCENTAGE",
            ]);
        });

        test("should have correct difficulty distribution for Grade 8 level", () => {
            expect(dataset.metadata.difficultyDistribution).toEqual({
                easy: 10,
                medium: 10,
                hard: 5,
            });
        });

        test("should be verified and curriculum aligned", () => {
            expect(dataset.metadata.verified).toBe(true);
            expect(dataset.metadata.curriculumAligned).toBe(true);
        });
    });

    describe("Questions Structure Validation", () => {
        test("should have exactly 25 questions", () => {
            expect(dataset.questions).toBeDefined();
            expect(dataset.questions.length).toBe(25);
        });

        test("should have correct difficulty distribution in questions", () => {
            const difficultyCount = dataset.questions.reduce((acc, q) => {
                acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            expect(difficultyCount.easy).toBe(10);
            expect(difficultyCount.medium).toBe(10);
            expect(difficultyCount.hard).toBe(5);
        });

        test("should have consistent Grade 8 metadata in all questions", () => {
            dataset.questions.forEach((question) => {
                expect(question.grade).toBe(8);
                expect(question.subject).toBe("Mathematics");
                expect(question.type).toBe("FRACTION_DECIMAL_PERCENTAGE");
                expect(question.curriculumTopic).toBe("Number and Algebra");
                expect(question.verified).toBe(true);
                expect(question.documentType).toBe("question");
            });
        });
    });

    describe("NZ Curriculum Content Validation", () => {
        test("should include fraction to decimal conversion questions", () => {
            const conversionQuestions = dataset.questions.filter(
                (q) =>
                    (q.question.toLowerCase().includes("convert") &&
                        q.question.toLowerCase().includes("fraction") &&
                        q.question.toLowerCase().includes("decimal")) ||
                    q.keywords.some((k) => k.toLowerCase().includes("fraction conversion"))
            );
            expect(conversionQuestions.length).toBeGreaterThanOrEqual(5);
        });

        test("should include decimal to percentage conversion questions", () => {
            const percentageQuestions = dataset.questions.filter(
                (q) =>
                    (q.question.toLowerCase().includes("decimal") &&
                        q.question.toLowerCase().includes("percentage")) ||
                    (q.question.includes("%") || q.answer.includes("%"))
            );
            expect(percentageQuestions.length).toBeGreaterThanOrEqual(5);
        });

        test("should include real-world application questions", () => {
            const realWorldContexts = [
                "shopping", "gst", "discount", "sale", "price", 
                "cooking", "recipe", "sport", "school", "money"
            ];
            const applicationQuestions = dataset.questions.filter((q) => {
                const content = (q.question + " " + q.explanation).toLowerCase();
                return realWorldContexts.some(context => content.includes(context));
            });
            expect(applicationQuestions.length).toBeGreaterThanOrEqual(8);
        });

        test("should use NZ curriculum vocabulary for fractions/decimals/percentages", () => {
            const vocabularyTerms = [
                "benchmark fraction",
                "equivalent fraction", 
                "decimal place",
                "percentage increase",
                "percentage decrease",
                "common denominator",
                "mixed number"
            ];
            let vocabularyFound = 0;

            dataset.questions.forEach((question) => {
                const questionText = (
                    question.question +
                    " " +
                    question.explanation +
                    " " +
                    question.keywords.join(" ")
                ).toLowerCase();
                vocabularyTerms.forEach((term) => {
                    if (questionText.includes(term)) {
                        vocabularyFound++;
                    }
                });
            });

            expect(vocabularyFound).toBeGreaterThanOrEqual(12); // Should use curriculum vocabulary extensively
        });

        test("should include NZ-specific contexts (GST, shopping, Kiwi scenarios)", () => {
            const nzContexts = ["gst", "15%", "new zealand", "kiwi", "dollar", "cents"];
            const nzQuestions = dataset.questions.filter((q) => {
                const content = (q.question + " " + q.explanation).toLowerCase();
                return nzContexts.some(context => content.includes(context));
            });
            expect(nzQuestions.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe("Question Quality Validation", () => {
        test("should have comprehensive explanations for all questions", () => {
            dataset.questions.forEach((question) => {
                expect(question.explanation.length).toBeGreaterThanOrEqual(100);
                expect(question.explanation).toMatch(/Step \d+:/); // Should have step-by-step explanations
            });
        });

        test("should have appropriate keywords for searchability", () => {
            dataset.questions.forEach((question) => {
                expect(question.keywords.length).toBeGreaterThanOrEqual(4);
                expect(question.keywords).toContain("grade 8");
                expect(
                    question.keywords.some((k) =>
                        [
                            "fraction",
                            "decimal", 
                            "percentage",
                            "conversion",
                            "equivalent"
                        ].some((term) => k.toLowerCase().includes(term))
                    )
                ).toBe(true);
            });
        });

        test("should have unique question IDs following Grade 8 convention", () => {
            const ids = dataset.questions.map((q) => q.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(dataset.questions.length);

            // Check ID format: g8-FRACTION_DECIMAL_PERCENTAGE-{difficulty}-{number}
            dataset.questions.forEach((question) => {
                expect(question.id).toMatch(
                    /^g8-FRACTION_DECIMAL_PERCENTAGE-(easy|medium|hard)-\d{3}$/
                );
            });
        });
    });

    describe("Difficulty Progression Validation", () => {
        test("should have appropriate easy question complexity", () => {
            const easyQuestions = dataset.questions.filter(q => q.difficulty === "easy");
            
            // Easy questions should focus on basic conversions
            const basicConversions = easyQuestions.filter((q) =>
                q.question.toLowerCase().includes("convert") &&
                (q.question.includes("1/2") || 
                 q.question.includes("1/4") || 
                 q.question.includes("0.5") ||
                 q.question.includes("50%"))
            );
            expect(basicConversions.length).toBeGreaterThanOrEqual(3);
        });

        test("should have appropriate medium question complexity", () => {
            const mediumQuestions = dataset.questions.filter(q => q.difficulty === "medium");
            
            // Medium questions should involve multi-step conversions or operations
            const multiStep = mediumQuestions.filter((q) =>
                q.explanation.toLowerCase().includes("step 2") ||
                q.question.toLowerCase().includes("then") ||
                q.question.toLowerCase().includes("and")
            );
            expect(multiStep.length).toBeGreaterThanOrEqual(4);
        });

        test("should have appropriate hard question complexity", () => {
            const hardQuestions = dataset.questions.filter(q => q.difficulty === "hard");
            
            // Hard questions should involve complex scenarios or financial literacy
            const complexScenarios = hardQuestions.filter((q) =>
                q.explanation.toLowerCase().includes("multiple") ||
                q.explanation.toLowerCase().includes("analyze") ||
                q.question.toLowerCase().includes("discount") ||
                q.question.toLowerCase().includes("gst") ||
                q.question.toLowerCase().includes("increase")
            );
            expect(complexScenarios.length).toBeGreaterThanOrEqual(3);
        });

        test("should align with Grade 8 NZ curriculum learning outcomes", () => {
            // Test that questions address core Grade 8 fraction/decimal/percentage concepts
            const curriculumAreas = [
                "fraction",
                "decimal", 
                "percentage",
                "conversion",
                "equivalent"
            ];

            curriculumAreas.forEach((area) => {
                const relevantQuestions = dataset.questions.filter((q) => {
                    const content = (
                        q.question +
                        " " +
                        q.explanation +
                        " " +
                        q.curriculumSubtopic +
                        " " +
                        q.keywords.join(" ")
                    ).toLowerCase();
                    return content.includes(area.toLowerCase());
                });
                expect(relevantQuestions.length).toBeGreaterThanOrEqual(3);
            });
        });
    });
});