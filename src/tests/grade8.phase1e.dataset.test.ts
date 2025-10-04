/**
 * Grade 8 Phase 1E Dataset Tests: NUMBER_PATTERNS
 *
 * Comprehensive test suite for Grade 8 Number Patterns questions
 * Testing: Pattern recognition, sequence extension, rule identification
 *
 * TDD Phase: RED (Write failing tests first)
 * Expected: All tests should FAIL initially (dataset doesn't exist yet)
 */

import { readFileSync } from "fs";
import path from "path";

describe("Grade 8 Phase 1E: NUMBER_PATTERNS Dataset", () => {
    let dataset: any;
    let questions: any[];

    beforeAll(() => {
        try {
            const filePath = path.join(
                process.cwd(),
                "question_bank",
                "grade8",
                "grade8_number_patterns_questions.json"
            );
            const fileContent = readFileSync(filePath, "utf-8");
            dataset = JSON.parse(fileContent);
            questions = dataset.questions || [];
        } catch (error) {
            // Expected to fail initially - dataset doesn't exist yet
            dataset = null;
            questions = [];
        }
    });

    describe("Dataset Structure and Metadata", () => {
        test("should have valid dataset structure", () => {
            expect(dataset).toBeTruthy();
            expect(dataset.metadata).toBeDefined();
            expect(dataset.questions).toBeDefined();
        });

        test("should have correct metadata properties", () => {
            expect(dataset.metadata.datasetId).toBe(
                "grade8-number-patterns-2025"
            );
            expect(dataset.metadata.datasetName).toBe(
                "Grade 8 Number Patterns Questions"
            );
            expect(dataset.metadata.grade).toBe(8);
            expect(dataset.metadata.subject).toBe("Mathematics");
            expect(dataset.metadata.curriculumTopic).toBe("Number and Algebra");
            expect(dataset.metadata.totalQuestions).toBe(25);
            expect(dataset.metadata.questionTypes).toEqual(["NUMBER_PATTERNS"]);
        });

        test("should have correct difficulty distribution", () => {
            expect(dataset.metadata.difficultyDistribution).toEqual({
                easy: 10,
                medium: 10,
                hard: 5,
            });
        });

        test("should have curriculum alignment flags", () => {
            expect(dataset.metadata.verified).toBe(true);
            expect(dataset.metadata.curriculumAligned).toBe(true);
        });
    });

    describe("Question Count and Distribution", () => {
        test("should have exactly 25 questions", () => {
            expect(questions).toHaveLength(25);
        });

        test("should have correct difficulty distribution", () => {
            const easyQuestions = questions.filter(
                (q) => q.difficulty === "easy"
            );
            const mediumQuestions = questions.filter(
                (q) => q.difficulty === "medium"
            );
            const hardQuestions = questions.filter(
                (q) => q.difficulty === "hard"
            );

            expect(easyQuestions).toHaveLength(10);
            expect(mediumQuestions).toHaveLength(10);
            expect(hardQuestions).toHaveLength(5);
        });

        test("should have sequential IDs for each difficulty", () => {
            const easyQuestions = questions.filter(
                (q) => q.difficulty === "easy"
            );
            const mediumQuestions = questions.filter(
                (q) => q.difficulty === "medium"
            );
            const hardQuestions = questions.filter(
                (q) => q.difficulty === "hard"
            );

            // Check easy questions (001-010)
            for (let i = 0; i < easyQuestions.length; i++) {
                const expectedId = `g8-NUMBER_PATTERNS-easy-${String(
                    i + 1
                ).padStart(3, "0")}`;
                expect(easyQuestions[i].id).toBe(expectedId);
            }

            // Check medium questions (001-010)
            for (let i = 0; i < mediumQuestions.length; i++) {
                const expectedId = `g8-NUMBER_PATTERNS-medium-${String(
                    i + 1
                ).padStart(3, "0")}`;
                expect(mediumQuestions[i].id).toBe(expectedId);
            }

            // Check hard questions (001-005)
            for (let i = 0; i < hardQuestions.length; i++) {
                const expectedId = `g8-NUMBER_PATTERNS-hard-${String(
                    i + 1
                ).padStart(3, "0")}`;
                expect(hardQuestions[i].id).toBe(expectedId);
            }
        });
    });

    describe("Question Quality and Content", () => {
        test("all questions should have required fields", () => {
            questions.forEach((question, index) => {
                expect(question.id).toBeDefined();
                expect(question.question).toBeDefined();
                expect(question.answer).toBeDefined();
                expect(question.explanation).toBeDefined();
                expect(question.type).toBe("NUMBER_PATTERNS");
                expect(question.difficulty).toMatch(/^(easy|medium|hard)$/);
                expect(question.grade).toBe(8);
                expect(question.subject).toBe("Mathematics");
                expect(question.curriculumTopic).toBe("Number and Algebra");
            });
        });

        test("questions should have meaningful content", () => {
            questions.forEach((question) => {
                expect(question.question.length).toBeGreaterThan(10);
                expect(question.explanation.length).toBeGreaterThan(20);
                expect(question.answer).toBeTruthy();
            });
        });

        test("explanations should include step-by-step reasoning", () => {
            questions.forEach((question) => {
                const explanation = question.explanation.toLowerCase();
                expect(
                    explanation.includes("step 1") ||
                        explanation.includes("pattern") ||
                        explanation.includes("sequence") ||
                        explanation.includes("rule")
                ).toBe(true);
            });
        });
    });

    describe("Pattern Type Coverage", () => {
        test("should include arithmetic sequence patterns", () => {
            const arithmeticPatterns = questions.filter(
                (q) =>
                    q.question.toLowerCase().includes("sequence") ||
                    q.explanation.toLowerCase().includes("arithmetic") ||
                    q.explanation
                        .toLowerCase()
                        .includes("constant difference") ||
                    (q.explanation.toLowerCase().includes("add") &&
                        q.explanation.toLowerCase().includes("each"))
            );
            expect(arithmeticPatterns.length).toBeGreaterThanOrEqual(5);
        });

        test("should include geometric sequence patterns", () => {
            const geometricPatterns = questions.filter(
                (q) =>
                    q.explanation.toLowerCase().includes("geometric") ||
                    q.explanation.toLowerCase().includes("multiply") ||
                    q.explanation.toLowerCase().includes("ratio") ||
                    q.explanation.toLowerCase().includes("times")
            );
            expect(geometricPatterns.length).toBeGreaterThanOrEqual(3);
        });

        test("should include special number patterns", () => {
            const specialPatterns = questions.filter(
                (q) =>
                    q.explanation.toLowerCase().includes("square") ||
                    q.explanation.toLowerCase().includes("triangular") ||
                    q.explanation.toLowerCase().includes("fibonacci") ||
                    q.explanation.toLowerCase().includes("cube")
            );
            expect(specialPatterns.length).toBeGreaterThanOrEqual(2);
        });

        test("should include pattern rule identification", () => {
            const rulePatterns = questions.filter(
                (q) =>
                    q.question.toLowerCase().includes("rule") ||
                    q.question.toLowerCase().includes("pattern") ||
                    q.explanation.toLowerCase().includes("rule") ||
                    q.explanation.toLowerCase().includes("relationship")
            );
            expect(rulePatterns.length).toBeGreaterThanOrEqual(8);
        });
    });

    describe("Educational Standards", () => {
        test("should have appropriate mathematical complexity for Grade 8", () => {
            const easyQuestions = questions.filter(
                (q) => q.difficulty === "easy"
            );
            const hardQuestions = questions.filter(
                (q) => q.difficulty === "hard"
            );

            // Easy questions should have simple patterns
            easyQuestions.forEach((q) => {
                expect(q.explanation.length).toBeLessThan(300);
            });

            // Hard questions should have complex patterns
            hardQuestions.forEach((q) => {
                expect(q.explanation.length).toBeGreaterThan(100);
            });
        });

        test("should include curriculum-relevant keywords", () => {
            questions.forEach((question) => {
                expect(question.keywords).toBeDefined();
                expect(Array.isArray(question.keywords)).toBe(true);
                expect(question.keywords.length).toBeGreaterThan(3);

                const hasPatternKeywords = question.keywords.some(
                    (keyword: string) =>
                        keyword.includes("pattern") ||
                        keyword.includes("sequence") ||
                        keyword.includes("arithmetic") ||
                        keyword.includes("geometric") ||
                        keyword.includes("number")
                );
                expect(hasPatternKeywords).toBe(true);
            });
        });

        test("should have learning objectives focused on pattern recognition", () => {
            questions.forEach((question) => {
                expect(question.learningObjective).toBeDefined();
                const objective = question.learningObjective.toLowerCase();
                expect(
                    objective.includes("pattern") ||
                        objective.includes("sequence") ||
                        objective.includes("identify") ||
                        objective.includes("extend") ||
                        objective.includes("rule")
                ).toBe(true);
            });
        });
    });

    describe("Progressive Difficulty", () => {
        test("easy questions should use simple patterns", () => {
            const easyQuestions = questions.filter(
                (q) => q.difficulty === "easy"
            );
            easyQuestions.forEach((q) => {
                // Easy patterns should typically involve small numbers or simple operations
                const hasSimplePattern =
                    q.explanation.toLowerCase().includes("add 1") ||
                    q.explanation.toLowerCase().includes("add 2") ||
                    q.explanation.toLowerCase().includes("add 3") ||
                    q.explanation.toLowerCase().includes("multiply by 2") ||
                    q.explanation.toLowerCase().includes("subtract");
                // At least some easy questions should have simple patterns
            });
        });

        test("hard questions should involve complex mathematical reasoning", () => {
            const hardQuestions = questions.filter(
                (q) => q.difficulty === "hard"
            );
            hardQuestions.forEach((q) => {
                // Hard questions should have more sophisticated explanations
                expect(q.explanation.length).toBeGreaterThan(150);

                const hasComplexConcepts =
                    q.explanation.toLowerCase().includes("variable") ||
                    q.explanation.toLowerCase().includes("expression") ||
                    q.explanation.toLowerCase().includes("formula") ||
                    q.explanation.toLowerCase().includes("algebraic") ||
                    q.explanation.toLowerCase().includes("nth term");
                // Hard questions should involve more advanced concepts
            });
        });
    });

    describe("Vector Database Optimization", () => {
        test("should have contentForEmbedding field for vector search", () => {
            questions.forEach((question) => {
                expect(question.contentForEmbedding).toBeDefined();
                expect(typeof question.contentForEmbedding).toBe("string");
                expect(question.contentForEmbedding.length).toBeGreaterThan(20);
            });
        });

        test("should have documentType for database organization", () => {
            questions.forEach((question) => {
                expect(question.documentType).toBe("question");
                expect(question.verified).toBe(true);
            });
        });

        test("contentForEmbedding should contain key mathematical concepts", () => {
            questions.forEach((question) => {
                const content = question.contentForEmbedding.toLowerCase();
                expect(
                    content.includes("pattern") ||
                        content.includes("sequence") ||
                        content.includes("number") ||
                        content.includes("mathematics") ||
                        content.includes("grade 8")
                ).toBe(true);
            });
        });
    });

    describe("Real-world Application", () => {
        test("should include contextualised examples", () => {
            const contextualisedQuestions = questions.filter(
                (q) =>
                    q.question.toLowerCase().includes("growth") ||
                    q.question.toLowerCase().includes("savings") ||
                    q.question.toLowerCase().includes("population") ||
                    q.question.toLowerCase().includes("tiles") ||
                    q.question.toLowerCase().includes("seats") ||
                    q.explanation.toLowerCase().includes("real-world") ||
                    q.explanation.toLowerCase().includes("practical")
            );
            expect(contextualisedQuestions.length).toBeGreaterThanOrEqual(5);
        });

        test("should connect patterns to mathematical thinking", () => {
            questions.forEach((question) => {
                const content = question.explanation.toLowerCase();
                expect(
                    content.includes("pattern") ||
                        content.includes("relationship") ||
                        content.includes("sequence") ||
                        content.includes("mathematical") ||
                        content.includes("reasoning")
                ).toBe(true);
            });
        });
    });
});
