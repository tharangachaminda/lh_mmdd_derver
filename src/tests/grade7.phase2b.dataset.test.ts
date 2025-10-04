/**
 * Grade 7 Phase 2B Dataset Tests - Geometry & Spatial Reasoning
 *
 * RED phase: Write failing tests for Phase 2B dataset before implementation
 *
 * Testing Strategy:
 * - Validate file structure and metadata
 * - Ensure 25 questions with proper distribution (10/10/5)
 * - Verify GEOMETRY_SPATIAL_REASONING question type
 * - Test curriculum alignment for geometry concepts
 * - Validate content quality for shapes, transformations, and spatial thinking
 */

import { readFileSync } from "fs";
import { QuestionType } from "../models/question.js";

describe("Grade 7 Phase 2B Dataset - Geometry & Spatial Reasoning", () => {
    const datasetPath =
        "question_bank/grade7/grade7_geometry_spatial_reasoning_questions.json";
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
                "grade7-geometry-spatial-reasoning-2025"
            );
            expect(dataset.metadata.datasetName).toBe(
                "Grade 7 Geometry & Spatial Reasoning Questions"
            );
            expect(dataset.metadata.grade).toBe(7);
            expect(dataset.metadata.subject).toBe("Mathematics");
            expect(dataset.metadata.curriculumTopic).toBe(
                "Geometry and Spatial Reasoning"
            );
            expect(dataset.metadata.verified).toBe(true);
            expect(dataset.metadata.curriculumAligned).toBe(true);
        });

        test("should have correct question count and types", () => {
            expect(dataset.metadata.totalQuestions).toBe(25);
            expect(dataset.metadata.questionTypes).toContain(
                "GEOMETRY_SPATIAL_REASONING"
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
                    /^g7-GEOMETRY_SPATIAL_REASONING-(easy|medium|hard)-\d{3}$/
                );
                expect(question.type).toBe("GEOMETRY_SPATIAL_REASONING");
                expect(question.grade).toBe(7);
                expect(question.subject).toBe("Mathematics");
                expect(question.curriculumTopic).toBe(
                    "Geometry and Spatial Reasoning"
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

        test("should have geometry-focused content", () => {
            const geometryKeywords = [
                "angle",
                "triangle",
                "circle",
                "polygon",
                "area",
                "perimeter",
                "circumference",
                "diameter",
                "radius",
                "transformation",
                "rotation",
                "reflection",
                "translation",
                "congruent",
                "similar",
                "coordinate",
                "quadrilateral",
                "parallel",
                "perpendicular",
            ];

            let totalKeywordMatches = 0;
            dataset.questions.forEach((question: any) => {
                const questionText = (
                    question.question +
                    " " +
                    question.explanation
                ).toLowerCase();
                const keywordMatches = geometryKeywords.filter(
                    (keyword) =>
                        questionText.includes(keyword) ||
                        question.keywords.some((k: string) =>
                            k.toLowerCase().includes(keyword)
                        )
                );
                totalKeywordMatches += keywordMatches.length;
            });

            expect(totalKeywordMatches).toBeGreaterThan(20); // Should have good coverage of geometry concepts
        });

        test("should include shape and measurement problems", () => {
            const shapeQuestions = dataset.questions.filter((question: any) => {
                const text = (
                    question.question +
                    " " +
                    question.explanation
                ).toLowerCase();
                return (
                    text.includes("triangle") ||
                    text.includes("circle") ||
                    text.includes("rectangle") ||
                    text.includes("polygon") ||
                    text.includes("area") ||
                    text.includes("perimeter") ||
                    text.includes("circumference")
                );
            });

            expect(shapeQuestions.length).toBeGreaterThanOrEqual(8);
        });

        test("should include transformation and coordinate problems", () => {
            const transformationQuestions = dataset.questions.filter(
                (question: any) => {
                    const text = (
                        question.question +
                        " " +
                        question.explanation
                    ).toLowerCase();
                    return (
                        text.includes("transformation") ||
                        text.includes("rotation") ||
                        text.includes("reflection") ||
                        text.includes("translation") ||
                        text.includes("coordinate") ||
                        text.includes("grid") ||
                        text.includes("plane")
                    );
                }
            );

            expect(transformationQuestions.length).toBeGreaterThanOrEqual(6);
        });

        test("should include angle and geometric reasoning problems", () => {
            const angleQuestions = dataset.questions.filter((question: any) => {
                const text = (
                    question.question +
                    " " +
                    question.explanation
                ).toLowerCase();
                return (
                    text.includes("angle") ||
                    text.includes("degrees") ||
                    text.includes("parallel") ||
                    text.includes("perpendicular") ||
                    text.includes("congruent") ||
                    text.includes("similar")
                );
            });

            expect(angleQuestions.length).toBeGreaterThanOrEqual(5);
        });
    });

    describe("Curriculum Alignment Validation", () => {
        test("should cover Grade 7 geometry standards", () => {
            const curriculumConcepts = [
                "angle relationships and calculations",
                "area and perimeter of composite shapes",
                "circle properties and measurements",
                "geometric transformations",
                "coordinate geometry applications",
                "spatial reasoning and visualization",
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

            // Easy questions should focus on basic shape properties
            const easyShapes = easyQuestions.filter((question: any) => {
                const text = question.question.toLowerCase();
                return (
                    (text.includes("area") || text.includes("perimeter")) &&
                    (text.includes("rectangle") ||
                        text.includes("triangle") ||
                        text.includes("circle"))
                );
            });
            expect(easyShapes.length).toBeGreaterThanOrEqual(4);

            // Hard questions should involve complex geometric reasoning
            const hardReasoning = hardQuestions.filter((question: any) => {
                const text = (
                    question.question +
                    " " +
                    question.explanation
                ).toLowerCase();
                return (
                    text.includes("transformation") ||
                    text.includes("coordinate") ||
                    text.includes("composite") ||
                    text.includes("reasoning")
                );
            });
            expect(hardReasoning.length).toBeGreaterThanOrEqual(2);
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
                    `g7-GEOMETRY_SPATIAL_REASONING-easy-${String(
                        index + 1
                    ).padStart(3, "0")}`
                );
            });

            mediumQuestions.forEach((q: any, index: number) => {
                expect(q.id).toBe(
                    `g7-GEOMETRY_SPATIAL_REASONING-medium-${String(
                        index + 1
                    ).padStart(3, "0")}`
                );
            });

            hardQuestions.forEach((q: any, index: number) => {
                expect(q.id).toBe(
                    `g7-GEOMETRY_SPATIAL_REASONING-hard-${String(
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
