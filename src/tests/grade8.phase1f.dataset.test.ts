import { describe, test, expect, beforeAll } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Grade 8 Phase 1F: LINEAR_EQUATIONS Dataset Test Suite
 *
 * This test suite validates the Grade 8 Linear Equations question dataset
 * following TDD RED-GREEN-REFACTOR methodology.
 *
 * Test Coverage:
 * - Dataset structure and metadata validation
 * - Question count and difficulty distribution
 * - Linear equation type coverage
 * - Mathematical accuracy and solution methods
 * - Educational standards alignment
 * - Vector database optimization
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const datasetPath = path.join(
    __dirname,
    "../../question_bank/grade8/grade8_linear_equations_questions.json"
);

describe("Grade 8 Phase 1F: LINEAR_EQUATIONS Dataset", () => {
    describe("Dataset Structure and Metadata", () => {
        let dataset: any;

        beforeAll(() => {
            if (fs.existsSync(datasetPath)) {
                const rawData = fs.readFileSync(datasetPath, "utf8");
                dataset = JSON.parse(rawData);
            } else {
                dataset = null;
            }
        });

        test("should have valid dataset file", () => {
            expect(dataset).not.toBeNull();
            expect(dataset).toBeDefined();
        });

        test("should have complete metadata structure", () => {
            expect(dataset.metadata).toBeDefined();
            expect(dataset.metadata.datasetId).toBe(
                "grade8-linear-equations-2025"
            );
            expect(dataset.metadata.grade).toBe(8);
            expect(dataset.metadata.subject).toBe("Mathematics");
            expect(dataset.metadata.curriculumTopic).toBe("Number and Algebra");
            expect(dataset.metadata.questionTypes).toContain(
                "LINEAR_EQUATIONS"
            );
        });

        test("should have correct total question count", () => {
            expect(dataset.metadata.totalQuestions).toBe(25);
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

    describe("Question Count and Distribution", () => {
        let dataset: any;

        beforeAll(() => {
            if (fs.existsSync(datasetPath)) {
                const rawData = fs.readFileSync(datasetPath, "utf8");
                dataset = JSON.parse(rawData);
            }
        });

        test("should have exactly 10 easy questions", () => {
            const easyQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "easy"
            );
            expect(easyQuestions).toHaveLength(10);
        });

        test("should have exactly 10 medium questions", () => {
            const mediumQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "medium"
            );
            expect(mediumQuestions).toHaveLength(10);
        });

        test("should have exactly 5 hard questions", () => {
            const hardQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "hard"
            );
            expect(hardQuestions).toHaveLength(5);
        });
    });

    describe("Question Quality and Content", () => {
        let dataset: any;

        beforeAll(() => {
            if (fs.existsSync(datasetPath)) {
                const rawData = fs.readFileSync(datasetPath, "utf8");
                dataset = JSON.parse(rawData);
            }
        });

        test("should have all required question fields", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.id).toBeDefined();
                expect(question.question).toBeDefined();
                expect(question.answer).toBeDefined();
                expect(question.explanation).toBeDefined();
                expect(question.difficulty).toBeDefined();
                expect(question.grade).toBe(8);
                expect(question.questionType).toBe("LINEAR_EQUATIONS");
                expect(question.keywords).toBeDefined();
                expect(Array.isArray(question.keywords)).toBe(true);
            });
        });

        test("should have comprehensive explanations with step-by-step solutions", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.explanation.length).toBeGreaterThan(50);
                expect(
                    question.explanation.toLowerCase().includes("step") ||
                        question.explanation.toLowerCase().includes("solve") ||
                        question.explanation
                            .toLowerCase()
                            .includes("substitute")
                ).toBe(true);
            });
        });

        test("should have proper ID format", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.id).toMatch(
                    /^g8-LINEAR_EQUATIONS-(easy|medium|hard)-\d{3}$/
                );
            });
        });
    });

    describe("Linear Equation Type Coverage", () => {
        let dataset: any;

        beforeAll(() => {
            if (fs.existsSync(datasetPath)) {
                const rawData = fs.readFileSync(datasetPath, "utf8");
                dataset = JSON.parse(rawData);
            }
        });

        test("should include one-step equations", () => {
            const oneStepQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("x +") ||
                    q.question.toLowerCase().includes("x -") ||
                    q.question.toLowerCase().includes("x =") ||
                    q.keywords.some((keyword: string) =>
                        keyword.includes("one-step")
                    )
            );
            expect(oneStepQuestions.length).toBeGreaterThanOrEqual(4);
        });

        test("should include two-step equations", () => {
            const twoStepQuestions = dataset.questions.filter(
                (q: any) =>
                    q.explanation.toLowerCase().includes("two-step") ||
                    q.keywords.some((keyword: string) =>
                        keyword.includes("two-step")
                    ) ||
                    (q.question.includes("+") && q.question.includes("x")) ||
                    (q.question.includes("-") && q.question.includes("x"))
            );
            expect(twoStepQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test("should include variable substitution questions", () => {
            const substitutionQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("when") ||
                    q.question.toLowerCase().includes("substitute") ||
                    (q.question.toLowerCase().includes("find") &&
                        q.question.includes("=")) ||
                    q.keywords.some((keyword: string) =>
                        keyword.includes("substitution")
                    )
            );
            expect(substitutionQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test("should include real-world application questions", () => {
            const realWorldQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("age") ||
                    q.question.toLowerCase().includes("money") ||
                    q.question.toLowerCase().includes("cost") ||
                    q.question.toLowerCase().includes("years") ||
                    q.contextualisation.toLowerCase().includes("real-world") ||
                    q.explanation.toLowerCase().includes("real-world")
            );
            expect(realWorldQuestions.length).toBeGreaterThanOrEqual(4);
        });
    });

    describe("Educational Standards", () => {
        let dataset: any;

        beforeAll(() => {
            if (fs.existsSync(datasetPath)) {
                const rawData = fs.readFileSync(datasetPath, "utf8");
                dataset = JSON.parse(rawData);
            }
        });

        test("should align with Grade 8 NZ curriculum objectives", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.curriculumTopic).toBe("Number and Algebra");
                expect(question.learningObjective).toBeDefined();
                expect(question.learningObjective.length).toBeGreaterThan(20);
            });
        });

        test("should include appropriate mathematical vocabulary", () => {
            const vocabularyTerms = [
                "equation",
                "variable",
                "solve",
                "substitute",
                "linear",
                "unknown",
            ];
            const hasVocabulary = dataset.questions.some((q: any) =>
                vocabularyTerms.some(
                    (term) =>
                        q.question.toLowerCase().includes(term) ||
                        q.explanation.toLowerCase().includes(term) ||
                        q.keywords.some((keyword: string) =>
                            keyword.toLowerCase().includes(term)
                        )
                )
            );
            expect(hasVocabulary).toBe(true);
        });

        test("should have progressive complexity across difficulty levels", () => {
            const easyQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "easy"
            );
            const hardQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "hard"
            );

            // Easy questions should be shorter and simpler
            const avgEasyLength =
                easyQuestions.reduce(
                    (sum: number, q: any) => sum + q.question.length,
                    0
                ) / easyQuestions.length;
            const avgHardLength =
                hardQuestions.reduce(
                    (sum: number, q: any) => sum + q.question.length,
                    0
                ) / hardQuestions.length;

            expect(avgHardLength).toBeGreaterThan(avgEasyLength);
        });
    });

    describe("Progressive Difficulty", () => {
        let dataset: any;

        beforeAll(() => {
            if (fs.existsSync(datasetPath)) {
                const rawData = fs.readFileSync(datasetPath, "utf8");
                dataset = JSON.parse(rawData);
            }
        });

        test("should show clear progression from easy to hard questions", () => {
            const easyQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "easy"
            );
            const mediumQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "medium"
            );
            const hardQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "hard"
            );

            // Easy questions should focus on basic one-step equations
            const easyOneStep = easyQuestions.filter(
                (q: any) =>
                    q.question.match(/x\s*[\+\-]\s*\d+\s*=\s*\d+/) ||
                    q.question.match(/\d+\s*[x\*]\s*=\s*\d+/) ||
                    q.question.match(/x\s*[\/÷]\s*\d+\s*=\s*\d+/)
            );
            expect(easyOneStep.length).toBeGreaterThan(0);

            // Hard questions should involve multi-step or word problems
            const hardMultiStep = hardQuestions.filter(
                (q: any) =>
                    q.question.length > 100 ||
                    q.explanation.toLowerCase().includes("multi-step") ||
                    q.question.toLowerCase().includes("years old") ||
                    q.question.toLowerCase().includes("total cost")
            );
            expect(hardMultiStep.length).toBeGreaterThan(0);
        });

        test("should have appropriate solution complexity progression", () => {
            const easyQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "easy"
            );
            const hardQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "hard"
            );

            // Check that hard questions have longer explanations
            const avgEasyExplanation =
                easyQuestions.reduce(
                    (sum: number, q: any) => sum + q.explanation.length,
                    0
                ) / easyQuestions.length;
            const avgHardExplanation =
                hardQuestions.reduce(
                    (sum: number, q: any) => sum + q.explanation.length,
                    0
                ) / hardQuestions.length;

            expect(avgHardExplanation).toBeGreaterThan(avgEasyExplanation);
        });
    });

    describe("Vector Database Optimization", () => {
        let dataset: any;

        beforeAll(() => {
            if (fs.existsSync(datasetPath)) {
                const rawData = fs.readFileSync(datasetPath, "utf8");
                dataset = JSON.parse(rawData);
            }
        });

        test("should have optimized keywords for semantic search", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.keywords.length).toBeGreaterThanOrEqual(5);
                expect(question.keywords.length).toBeLessThanOrEqual(12);

                // Should include grade level
                expect(
                    question.keywords.some(
                        (keyword: string) =>
                            keyword.includes("grade 8") ||
                            keyword.includes("mathematics")
                    )
                ).toBe(true);
            });
        });

        test("should have content for embedding field", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.contentForEmbedding).toBeDefined();
                expect(question.contentForEmbedding.length).toBeGreaterThan(30);
                expect(question.contentForEmbedding.toLowerCase()).toContain(
                    "grade 8"
                );
            });
        });

        test("should include document type and verification flags", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.documentType).toBe("question");
                expect(question.verified).toBe(true);
            });
        });
    });

    describe("Real-world Application and Context", () => {
        let dataset: any;

        beforeAll(() => {
            if (fs.existsSync(datasetPath)) {
                const rawData = fs.readFileSync(datasetPath, "utf8");
                dataset = JSON.parse(rawData);
            }
        });

        test("should include contextualised examples", () => {
            const contextualisedQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("age") ||
                    q.question.toLowerCase().includes("cost") ||
                    q.question.toLowerCase().includes("money") ||
                    q.question.toLowerCase().includes("years") ||
                    q.question.toLowerCase().includes("total") ||
                    q.explanation.toLowerCase().includes("real-world") ||
                    q.explanation.toLowerCase().includes("practical")
            );
            expect(contextualisedQuestions.length).toBeGreaterThanOrEqual(5);
        });

        test("should connect equations to mathematical reasoning", () => {
            dataset.questions.forEach((question: any) => {
                const content = question.explanation.toLowerCase();
                expect(
                    content.includes("solve") ||
                        content.includes("equation") ||
                        content.includes("substitute") ||
                        content.includes("variable") ||
                        content.includes("unknown")
                ).toBe(true);
            });
        });
    });
});
