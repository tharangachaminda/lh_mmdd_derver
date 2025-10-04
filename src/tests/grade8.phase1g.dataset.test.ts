/**
 * Grade 8 Phase 1G Dataset Tests: ALGEBRAIC_MANIPULATION
 *
 * Comprehensive test suite for Grade 8 algebraic manipulation questions.
 * Tests dataset structure, content quality, curriculum alignment, and vector database readiness.
 *
 * Expected Dataset: 35 questions (14 easy, 14 medium, 7 hard)
 * Focus: Expression expansion, like terms collection, variable substitution, formula applications
 */

import { readFileSync } from "fs";
import { join } from "path";

// Type definitions for our dataset structure
interface AlgebraicManipulationQuestion {
    id: string;
    questionType: string;
    difficulty: "easy" | "medium" | "hard";
    curriculumTopic: string;
    question: string;
    answer: string;
    explanation: string;
    learningObjective: string;
    keywords: string[];
    contentForEmbedding: string;
    algebraicType?: string;
    realWorldContext?: boolean;
    multiStep?: boolean;
}

interface AlgebraicManipulationDataset {
    metadata: {
        topic: string;
        grade: number;
        phase: string;
        totalQuestions: number;
        difficultyDistribution: {
            easy: number;
            medium: number;
            hard: number;
        };
        curriculumAlignment: string;
        version: string;
    };
    questions: AlgebraicManipulationQuestion[];
}

describe("Grade 8 Phase 1G: ALGEBRAIC_MANIPULATION Dataset", () => {
    let dataset: AlgebraicManipulationDataset | null = null;

    beforeAll(() => {
        try {
            const datasetPath = join(
                process.cwd(),
                "question_bank",
                "grade8",
                "grade8_algebraic_manipulation_questions.json"
            );
            const rawData = readFileSync(datasetPath, "utf-8");
            dataset = JSON.parse(rawData);
        } catch (error) {
            // Dataset doesn't exist yet - this is expected for RED phase
            dataset = null;
        }
    });

    describe("Dataset Structure and Metadata", () => {
        test("should have valid dataset structure", () => {
            expect(dataset).toBeTruthy();
            expect(dataset?.metadata).toBeDefined();
            expect(dataset?.questions).toBeDefined();
            expect(Array.isArray(dataset?.questions)).toBe(true);
        });

        test("should have correct metadata information", () => {
            expect(dataset?.metadata.topic).toBe("ALGEBRAIC_MANIPULATION");
            expect(dataset?.metadata.grade).toBe(8);
            expect(dataset?.metadata.phase).toBe("1G");
            expect(dataset?.metadata.totalQuestions).toBe(35);
        });

        test("should have correct difficulty distribution", () => {
            expect(dataset?.metadata.difficultyDistribution.easy).toBe(14);
            expect(dataset?.metadata.difficultyDistribution.medium).toBe(14);
            expect(dataset?.metadata.difficultyDistribution.hard).toBe(7);
        });

        test("should have proper curriculum alignment", () => {
            expect(dataset?.metadata.curriculumAlignment).toContain(
                "NZ Year 8"
            );
            expect(dataset?.metadata.curriculumAlignment).toContain(
                "Number and Algebra"
            );
        });
    });

    describe("Question Count and Distribution", () => {
        test("should have exactly 35 questions", () => {
            expect(dataset?.questions).toHaveLength(35);
        });

        test("should have correct difficulty distribution", () => {
            const easyQuestions =
                dataset?.questions.filter((q) => q.difficulty === "easy") || [];
            const mediumQuestions =
                dataset?.questions.filter((q) => q.difficulty === "medium") ||
                [];
            const hardQuestions =
                dataset?.questions.filter((q) => q.difficulty === "hard") || [];

            expect(easyQuestions).toHaveLength(14);
            expect(mediumQuestions).toHaveLength(14);
            expect(hardQuestions).toHaveLength(7);
        });

        test("should have unique question IDs", () => {
            const ids = dataset?.questions.map((q) => q.id) || [];
            const uniqueIds = [...new Set(ids)];
            expect(uniqueIds).toHaveLength(ids.length);
        });
    });

    describe("Question Quality and Content", () => {
        test("should have proper question structure", () => {
            dataset?.questions.forEach((question) => {
                expect(question.id).toBeTruthy();
                expect(question.questionType).toBe("ALGEBRAIC_MANIPULATION");
                expect(question.difficulty).toMatch(/^(easy|medium|hard)$/);
                expect(question.curriculumTopic).toBeTruthy();
                expect(question.question).toBeTruthy();
                expect(question.answer).toBeTruthy();
                expect(question.explanation).toBeTruthy();
                expect(question.learningObjective).toBeTruthy();
            });
        });

        test("should have non-empty questions and answers", () => {
            dataset?.questions.forEach((question) => {
                expect(question.question.length).toBeGreaterThan(10);
                expect(question.answer.length).toBeGreaterThan(1);
                expect(question.explanation.length).toBeGreaterThan(20);
            });
        });

        test("should have meaningful learning objectives", () => {
            dataset?.questions.forEach((question) => {
                expect(question.learningObjective).toMatch(
                    /expand|simplify|substitute|collect|solve|manipulate|evaluate/i
                );
                expect(question.learningObjective.length).toBeGreaterThan(15);
            });
        });
    });

    describe("Algebraic Manipulation Type Coverage", () => {
        test("should cover expression expansion", () => {
            const expansionQuestions =
                dataset?.questions.filter(
                    (q) =>
                        q.question.includes("expand") ||
                        q.question.includes("Expand") ||
                        q.explanation.includes("expand") ||
                        q.keywords.some((k) => k.includes("expansion"))
                ) || [];
            expect(expansionQuestions.length).toBeGreaterThanOrEqual(8);
        });

        test("should cover like terms collection", () => {
            const likeTermsQuestions =
                dataset?.questions.filter(
                    (q) =>
                        q.question.includes("simplify") ||
                        q.question.includes("Simplify") ||
                        q.explanation.includes("like terms") ||
                        q.keywords.some(
                            (k) =>
                                k.includes("like terms") ||
                                k.includes("simplify")
                        )
                ) || [];
            expect(likeTermsQuestions.length).toBeGreaterThanOrEqual(8);
        });

        test("should cover variable substitution", () => {
            const substitutionQuestions =
                dataset?.questions.filter(
                    (q) =>
                        q.question.includes("substitute") ||
                        q.question.includes("when") ||
                        q.question.includes("=") ||
                        q.explanation.includes("substitut") ||
                        q.keywords.some((k) => k.includes("substitution"))
                ) || [];
            expect(substitutionQuestions.length).toBeGreaterThanOrEqual(6);
        });

        test("should cover formula applications", () => {
            const formulaQuestions =
                dataset?.questions.filter(
                    (q) =>
                        q.question.includes("formula") ||
                        q.question.includes("Formula") ||
                        q.question.includes("area") ||
                        q.question.includes("perimeter") ||
                        q.question.includes("speed") ||
                        q.keywords.some((k) => k.includes("formula"))
                ) || [];
            expect(formulaQuestions.length).toBeGreaterThanOrEqual(4);
        });
    });

    describe("Educational Standards", () => {
        test("should align with NZ curriculum topics", () => {
            dataset?.questions.forEach((question) => {
                expect(question.curriculumTopic).toMatch(
                    /Number and Algebra|Algebraic|Expressions|Variables/
                );
            });
        });

        test("should have appropriate learning objectives for Grade 8", () => {
            const grade8Concepts = [
                "expand",
                "simplify",
                "substitute",
                "collect",
                "like terms",
                "algebraic expression",
                "variable",
                "formula",
                "evaluate",
            ];

            dataset?.questions.forEach((question) => {
                const hasGrade8Concept = grade8Concepts.some((concept) =>
                    question.learningObjective.toLowerCase().includes(concept)
                );
                expect(hasGrade8Concept).toBe(true);
            });
        });

        test("should demonstrate step-by-step algebraic thinking", () => {
            dataset?.questions.forEach((question) => {
                // Explanations should show algebraic steps
                const hasSteps =
                    question.explanation.includes("step") ||
                    question.explanation.includes("Step") ||
                    question.explanation.includes("=") ||
                    question.explanation.includes("First") ||
                    question.explanation.includes("Then") ||
                    question.explanation.includes("Next");
                expect(hasSteps).toBe(true);
            });
        });
    });

    describe("Progressive Difficulty", () => {
        test("easy questions should have basic algebraic operations", () => {
            const easyQuestions =
                dataset?.questions.filter((q) => q.difficulty === "easy") || [];
            easyQuestions.forEach((question) => {
                // Easy questions should have simpler algebraic expressions
                const isBasic =
                    question.question.length < 150 ||
                    question.explanation.split(".").length <= 4;
                expect(isBasic).toBe(true);
            });
        });

        test("hard questions should have complex multi-step problems", () => {
            const hardQuestions =
                dataset?.questions.filter((q) => q.difficulty === "hard") || [];
            hardQuestions.forEach((question) => {
                // Hard questions should be more complex
                const isComplex =
                    question.explanation.length > 100 ||
                    question.question.includes("and") ||
                    question.explanation.includes("step");
                expect(isComplex).toBe(true);
            });
        });
    });

    describe("Vector Database Optimization", () => {
        test("should have relevant keywords for semantic search", () => {
            dataset?.questions.forEach((question) => {
                expect(Array.isArray(question.keywords)).toBe(true);
                expect(question.keywords.length).toBeGreaterThanOrEqual(5);

                // Should include algebraic manipulation related terms
                const hasAlgebraicTerms = question.keywords.some(
                    (keyword) =>
                        keyword.includes("algebra") ||
                        keyword.includes("expression") ||
                        keyword.includes("variable") ||
                        keyword.includes("expand") ||
                        keyword.includes("simplify")
                );
                expect(hasAlgebraicTerms).toBe(true);
            });
        });

        test("should have rich content for embedding", () => {
            dataset?.questions.forEach((question) => {
                expect(question.contentForEmbedding).toBeTruthy();
                expect(question.contentForEmbedding.length).toBeGreaterThan(50);

                // Should include key algebraic concepts
                const hasAlgebraicContent =
                    question.contentForEmbedding.includes("algebraic") ||
                    question.contentForEmbedding.includes("expression") ||
                    question.contentForEmbedding.includes("variable") ||
                    question.contentForEmbedding.includes("expand") ||
                    question.contentForEmbedding.includes("simplify");
                expect(hasAlgebraicContent).toBe(true);
            });
        });

        test("should have optimized metadata for search", () => {
            dataset?.questions.forEach((question) => {
                // Check for algebraic type classification
                if (question.algebraicType) {
                    expect(question.algebraicType).toMatch(
                        /expansion|simplification|substitution|formula/i
                    );
                }

                // Check for educational flags
                expect(typeof question.realWorldContext).toBe("boolean");
                if (question.multiStep !== undefined) {
                    expect(typeof question.multiStep).toBe("boolean");
                }
            });
        });
    });

    describe("Real-world Application", () => {
        test("should include practical algebraic applications", () => {
            const realWorldQuestions =
                dataset?.questions.filter(
                    (q) =>
                        q.realWorldContext === true ||
                        q.question.includes("area") ||
                        q.question.includes("perimeter") ||
                        q.question.includes("speed") ||
                        q.question.includes("cost") ||
                        q.question.includes("age") ||
                        q.question.includes("distance") ||
                        q.question.includes("time")
                ) || [];
            expect(realWorldQuestions.length).toBeGreaterThanOrEqual(8);
        });

        test("should connect algebra to practical contexts", () => {
            const practicalTerms = [
                "formula",
                "calculate",
                "find",
                "area",
                "perimeter",
                "speed",
                "distance",
                "cost",
            ];
            let practicalCount = 0;

            dataset?.questions.forEach((question) => {
                const hasPracticalContext = practicalTerms.some(
                    (term) =>
                        question.question.toLowerCase().includes(term) ||
                        question.explanation.toLowerCase().includes(term)
                );
                if (hasPracticalContext) practicalCount++;
            });

            expect(practicalCount).toBeGreaterThanOrEqual(10);
        });
    });
});
