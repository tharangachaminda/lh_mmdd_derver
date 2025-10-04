/**
 * Grade 7 Phase 2C Dataset Tests - Data Analysis & Probability
 *
 * RED phase: Write failing tests for Phase 2C dataset before implementation
 *
 * Testing Strategy:
 * - Validate file structure and metadata
 * - Ensure 25 questions with proper distribution (10/10/5)
 * - Verify DATA_ANALYSIS_PROBABILITY question type
 * - Test curriculum alignment for statistics and probability concepts
 * - Validate content quality for data interpretation and probability reasoning
 */

import { readFileSync } from "fs";
import { QuestionType } from "../models/question.js";

describe("Grade 7 Phase 2C Dataset - Data Analysis & Probability", () => {
    const datasetPath =
        "question_bank/grade7/grade7_data_analysis_probability_questions.json";
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
                "grade7-data-analysis-probability-2025"
            );
            expect(dataset.metadata.datasetName).toBe(
                "Grade 7 Data Analysis & Probability Questions"
            );
            expect(dataset.metadata.grade).toBe(7);
            expect(dataset.metadata.subject).toBe("Mathematics");
            expect(dataset.metadata.curriculumTopic).toBe(
                "Data Analysis and Probability"
            );
            expect(dataset.metadata.verified).toBe(true);
            expect(dataset.metadata.curriculumAligned).toBe(true);
        });

        test("should have correct question count and types", () => {
            expect(dataset.metadata.totalQuestions).toBe(25);
            expect(dataset.metadata.questionTypes).toContain(
                "DATA_ANALYSIS_PROBABILITY"
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
                    /^g7-DATA_ANALYSIS_PROBABILITY-(easy|medium|hard)-\d{3}$/
                );
                expect(question.type).toBe("DATA_ANALYSIS_PROBABILITY");
                expect(question.grade).toBe(7);
                expect(question.subject).toBe("Mathematics");
                expect(question.curriculumTopic).toBe(
                    "Data Analysis and Probability"
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

        test("should have statistics and probability focused content", () => {
            const statsKeywords = [
                "mean",
                "median",
                "mode",
                "range",
                "average",
                "probability",
                "data",
                "statistics",
                "frequency",
                "distribution",
                "sample",
                "population",
                "graph",
                "chart",
                "table",
                "survey",
                "experiment",
                "outcome",
                "event",
            ];

            let totalKeywordMatches = 0;
            dataset.questions.forEach((question: any) => {
                const questionText = (
                    question.question +
                    " " +
                    question.explanation
                ).toLowerCase();
                const keywordMatches = statsKeywords.filter(
                    (keyword) =>
                        questionText.includes(keyword) ||
                        question.keywords.some((k: string) =>
                            k.toLowerCase().includes(keyword)
                        )
                );
                totalKeywordMatches += keywordMatches.length;
            });

            expect(totalKeywordMatches).toBeGreaterThan(20); // Should have good coverage of statistics concepts
        });

        test("should include statistical measures problems", () => {
            const statisticalQuestions = dataset.questions.filter(
                (question: any) => {
                    const text = (
                        question.question +
                        " " +
                        question.explanation
                    ).toLowerCase();
                    return (
                        text.includes("mean") ||
                        text.includes("median") ||
                        text.includes("mode") ||
                        text.includes("range") ||
                        text.includes("average") ||
                        text.includes("data set") ||
                        text.includes("statistics")
                    );
                }
            );

            expect(statisticalQuestions.length).toBeGreaterThanOrEqual(8);
        });

        test("should include probability and data interpretation problems", () => {
            const probabilityQuestions = dataset.questions.filter(
                (question: any) => {
                    const text = (
                        question.question +
                        " " +
                        question.explanation
                    ).toLowerCase();
                    return (
                        text.includes("probability") ||
                        text.includes("chance") ||
                        text.includes("likely") ||
                        text.includes("outcome") ||
                        text.includes("event") ||
                        text.includes("graph") ||
                        text.includes("chart") ||
                        text.includes("table") ||
                        text.includes("interpret")
                    );
                }
            );

            expect(probabilityQuestions.length).toBeGreaterThanOrEqual(6);
        });

        test("should include data visualization and analysis problems", () => {
            const visualizationQuestions = dataset.questions.filter(
                (question: any) => {
                    const text = (
                        question.question +
                        " " +
                        question.explanation
                    ).toLowerCase();
                    return (
                        text.includes("graph") ||
                        text.includes("chart") ||
                        text.includes("table") ||
                        text.includes("plot") ||
                        text.includes("diagram") ||
                        text.includes("histogram") ||
                        text.includes("bar graph") ||
                        text.includes("line graph")
                    );
                }
            );

            expect(visualizationQuestions.length).toBeGreaterThanOrEqual(5);
        });
    });

    describe("Curriculum Alignment Validation", () => {
        test("should cover Grade 7 data analysis and probability standards", () => {
            const curriculumConcepts = [
                "statistical measures and central tendency",
                "data interpretation and analysis",
                "probability calculations and reasoning",
                "data visualization and graphing",
                "sampling and data collection methods",
                "experimental and theoretical probability",
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

            // Easy questions should focus on basic statistical measures
            const easyStats = easyQuestions.filter((question: any) => {
                const text = question.question.toLowerCase();
                return (
                    (text.includes("mean") ||
                        text.includes("median") ||
                        text.includes("mode") ||
                        text.includes("range")) &&
                    (text.includes("find") || text.includes("calculate"))
                );
            });
            expect(easyStats.length).toBeGreaterThanOrEqual(4);

            // Hard questions should involve complex data analysis or compound probability
            const hardAnalysis = hardQuestions.filter((question: any) => {
                const text = (
                    question.question +
                    " " +
                    question.explanation
                ).toLowerCase();
                return (
                    text.includes("interpret") ||
                    text.includes("analyze") ||
                    text.includes("compare") ||
                    text.includes("compound") ||
                    text.includes("conditional")
                );
            });
            expect(hardAnalysis.length).toBeGreaterThanOrEqual(2);
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
                    `g7-DATA_ANALYSIS_PROBABILITY-easy-${String(
                        index + 1
                    ).padStart(3, "0")}`
                );
            });

            mediumQuestions.forEach((q: any, index: number) => {
                expect(q.id).toBe(
                    `g7-DATA_ANALYSIS_PROBABILITY-medium-${String(
                        index + 1
                    ).padStart(3, "0")}`
                );
            });

            hardQuestions.forEach((q: any, index: number) => {
                expect(q.id).toBe(
                    `g7-DATA_ANALYSIS_PROBABILITY-hard-${String(
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

        test("should include real-world context in data problems", () => {
            const realWorldQuestions = dataset.questions.filter(
                (question: any) => {
                    const text = question.question.toLowerCase();
                    return (
                        text.includes("students") ||
                        text.includes("school") ||
                        text.includes("survey") ||
                        text.includes("experiment") ||
                        text.includes("weather") ||
                        text.includes("sports") ||
                        text.includes("game") ||
                        text.includes("class") ||
                        text.includes("test") ||
                        text.includes("score")
                    );
                }
            );

            expect(realWorldQuestions.length).toBeGreaterThanOrEqual(10);
        });
    });
});
