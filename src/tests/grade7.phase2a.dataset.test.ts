/**
 * Grade 7 Phase 2A Dataset Tests - Multi-Unit Conversions & Applications
 *
 * RED phase: Write failing tests for Phase 2A dataset before implementation
 *
 * Testing Strategy:
 * - Validate file structure and metadata
 * - Ensure 25 questions with proper distribution (10/10/5)
 * - Verify MULTI_UNIT_CONVERSIONS question type
 * - Test curriculum alignment for measurement concepts
 * - Validate content quality for unit conversions and rates
 */

import { readFileSync } from "fs";
import { QuestionType } from "../models/question.js";

describe("Grade 7 Phase 2A Dataset - Multi-Unit Conversions & Applications", () => {
    const datasetPath =
        "question_bank/grade7/grade7_multi_unit_conversions_questions.json";
    let dataset: any;

    beforeAll(() => {
        try {
            const fileContent = readFileSync(datasetPath, "utf8");
            dataset = JSON.parse(fileContent);
        } catch (error) {
            // Expected to fail initially - this is RED phase
            dataset = null;
        }
    });

    describe("File Structure & Metadata Validation", () => {
        test("should have dataset file present", () => {
            expect(dataset).not.toBeNull();
            expect(dataset).toBeDefined();
        });

        test("should have correct metadata structure", () => {
            expect(dataset.metadata).toBeDefined();
            expect(dataset.metadata.datasetId).toBe(
                "grade7-multi-unit-conversions-2025"
            );
            expect(dataset.metadata.datasetName).toBe(
                "Grade 7 Multi-Unit Conversions & Applications Questions"
            );
            expect(dataset.metadata.grade).toBe(7);
            expect(dataset.metadata.subject).toBe("Mathematics");
            expect(dataset.metadata.curriculumTopic).toBe(
                "Measurement and Applications"
            );
            expect(dataset.metadata.verified).toBe(true);
            expect(dataset.metadata.curriculumAligned).toBe(true);
        });

        test("should have correct question count and types", () => {
            expect(dataset.metadata.totalQuestions).toBe(25);
            expect(dataset.metadata.questionTypes).toContain(
                "MULTI_UNIT_CONVERSIONS"
            );
            expect(dataset.questions).toHaveLength(25);
        });

        test("should have proper difficulty distribution", () => {
            expect(dataset.metadata.difficultyDistribution).toEqual({
                easy: 10,
                medium: 10,
                hard: 5,
            });
        });
    });

    describe("Question Content Validation", () => {
        test("should have all questions with proper structure", () => {
            dataset.questions.forEach((question: any, index: number) => {
                expect(question.id).toMatch(
                    /^g7-MULTI_UNIT_CONVERSIONS-(easy|medium|hard)-\d{3}$/
                );
                expect(question.type).toBe("MULTI_UNIT_CONVERSIONS");
                expect(question.grade).toBe(7);
                expect(question.subject).toBe("Mathematics");
                expect(question.curriculumTopic).toBe(
                    "Measurement and Applications"
                );
                expect(question.verified).toBe(true);
                expect(question.question).toBeDefined();
                expect(question.answer).toBeDefined();
                expect(question.explanation).toBeDefined();
                expect(question.keywords).toBeInstanceOf(Array);
                expect(question.keywords.length).toBeGreaterThan(0);
            });
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

            expect(easyQuestions).toHaveLength(10);
            expect(mediumQuestions).toHaveLength(10);
            expect(hardQuestions).toHaveLength(5);
        });

        test("should have measurement-focused content", () => {
            const measurementKeywords = [
                "unit conversion",
                "metric",
                "imperial",
                "length",
                "mass",
                "volume",
                "time",
                "rate",
                "speed",
                "proportion",
                "scale",
                "measurement",
            ];

            let totalKeywordMatches = 0;
            dataset.questions.forEach((question: any) => {
                const questionText = (
                    question.question +
                    " " +
                    question.explanation
                ).toLowerCase();
                const keywordMatches = measurementKeywords.filter(
                    (keyword) =>
                        questionText.includes(keyword) ||
                        question.keywords.some((k: string) =>
                            k.toLowerCase().includes(keyword)
                        )
                );
                totalKeywordMatches += keywordMatches.length;
            });

            expect(totalKeywordMatches).toBeGreaterThan(15); // Should have good coverage of measurement concepts
        });

        test("should include unit conversion problems", () => {
            const conversionQuestions = dataset.questions.filter(
                (question: any) => {
                    const text = (
                        question.question +
                        " " +
                        question.explanation
                    ).toLowerCase();
                    return (
                        text.includes("convert") ||
                        text.includes("conversion") ||
                        text.includes("meter") ||
                        text.includes("kilometer") ||
                        text.includes("gram") ||
                        text.includes("kilogram") ||
                        text.includes("liter") ||
                        text.includes("milliliter")
                    );
                }
            );

            expect(conversionQuestions.length).toBeGreaterThanOrEqual(8);
        });

        test("should include rate and proportion problems", () => {
            const rateQuestions = dataset.questions.filter((question: any) => {
                const text = (
                    question.question +
                    " " +
                    question.explanation
                ).toLowerCase();
                return (
                    text.includes("rate") ||
                    text.includes("speed") ||
                    text.includes("per") ||
                    text.includes("ratio") ||
                    text.includes("proportion") ||
                    text.includes("scale")
                );
            });

            expect(rateQuestions.length).toBeGreaterThanOrEqual(6);
        });
    });

    describe("Curriculum Alignment Validation", () => {
        test("should cover Grade 7 measurement standards", () => {
            const curriculumConcepts = [
                "unit conversions within metric system",
                "unit conversions between metric and imperial",
                "rate calculations and applications",
                "proportional reasoning with measurements",
                "scale drawings and models",
                "measurement applications in real contexts",
            ];

            // Each concept should appear in at least 2 questions
            curriculumConcepts.forEach((concept) => {
                const relatedQuestions = dataset.questions.filter(
                    (question: any) => {
                        const content = (
                            question.question +
                            " " +
                            question.explanation +
                            " " +
                            question.curriculumSubtopic
                        ).toLowerCase();
                        const conceptWords = concept.toLowerCase().split(" ");
                        return conceptWords.some((word) =>
                            content.includes(word)
                        );
                    }
                );

                expect(relatedQuestions.length).toBeGreaterThanOrEqual(2);
            });
        });

        test("should have appropriate complexity progression", () => {
            const easyQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "easy"
            );
            const hardQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "hard"
            );

            // Easy questions should focus on basic conversions
            const easyConversions = easyQuestions.filter((question: any) => {
                const text = question.question.toLowerCase();
                return (
                    text.includes("convert") &&
                    (text.includes("meter") ||
                        text.includes("gram") ||
                        text.includes("liter"))
                );
            });
            expect(easyConversions.length).toBeGreaterThanOrEqual(4);

            // Hard questions should involve multi-step problems or complex rates
            const hardMultiStep = hardQuestions.filter((question: any) => {
                const text = (
                    question.question +
                    " " +
                    question.explanation
                ).toLowerCase();
                return (
                    text.includes("calculate") &&
                    (text.includes("then") ||
                        text.includes("next") ||
                        text.includes("rate") ||
                        text.includes("proportion"))
                );
            });
            expect(hardMultiStep.length).toBeGreaterThanOrEqual(2);
        });
    });

    describe("Question Quality Validation", () => {
        test("should have well-structured question IDs", () => {
            const easyQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "easy"
            );
            const mediumQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "medium"
            );
            const hardQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "hard"
            );

            easyQuestions.forEach((q: any, index: number) => {
                expect(q.id).toBe(
                    `g7-MULTI_UNIT_CONVERSIONS-easy-${String(
                        index + 1
                    ).padStart(3, "0")}`
                );
            });

            mediumQuestions.forEach((q: any, index: number) => {
                expect(q.id).toBe(
                    `g7-MULTI_UNIT_CONVERSIONS-medium-${String(
                        index + 1
                    ).padStart(3, "0")}`
                );
            });

            hardQuestions.forEach((q: any, index: number) => {
                expect(q.id).toBe(
                    `g7-MULTI_UNIT_CONVERSIONS-hard-${String(
                        index + 1
                    ).padStart(3, "0")}`
                );
            });
        });

        test("should have comprehensive explanations", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.explanation.length).toBeGreaterThan(50);
                expect(question.explanation).toMatch(/[.!?]$/); // Should end with punctuation
            });
        });

        test("should have appropriate keywords for discoverability", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.keywords).toContain("grade 7");
                expect(question.keywords.length).toBeGreaterThanOrEqual(4);
                expect(question.keywords.length).toBeLessThanOrEqual(8);
            });
        });
    });
});
