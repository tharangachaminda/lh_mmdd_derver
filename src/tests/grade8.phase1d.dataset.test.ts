import { describe, test, expect, beforeAll } from "@jest/globals";
import { readFileSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Grade 8 Phase 1D: Financial Literacy Dataset", () => {
    let dataset: any;

    beforeAll(() => {
        const filePath = join(
            __dirname,
            "../../question_bank/grade8/grade8_financial_literacy_questions.json"
        );
        const fileContent = readFileSync(filePath, "utf-8");
        dataset = JSON.parse(fileContent);
    });

    describe("Dataset Metadata Validation", () => {
        test("should have correct NZ financial literacy metadata structure", () => {
            expect(dataset.metadata).toBeDefined();
            expect(dataset.metadata.datasetId).toBe(
                "grade8-financial-literacy-2025"
            );
            expect(dataset.metadata.datasetName).toBe(
                "Grade 8 Financial Literacy Questions"
            );
            expect(dataset.metadata.grade).toBe(8);
            expect(dataset.metadata.subject).toBe("Mathematics");
            expect(dataset.metadata.curriculumTopic).toBe("Number and Algebra");
            expect(dataset.metadata.curriculumSubtopic).toContain(
                "Financial literacy"
            );
            expect(dataset.metadata.questionTypes).toEqual([
                "FINANCIAL_LITERACY",
            ]);
        });

        test("should have correct difficulty distribution for Grade 8 financial literacy", () => {
            expect(dataset.metadata.totalQuestions).toBe(26);
            expect(dataset.metadata.difficultyDistribution).toEqual({
                easy: 11,
                medium: 10,
                hard: 5,
            });
        });

        test("should be verified and curriculum aligned", () => {
            expect(dataset.metadata.verified).toBe(true);
            expect(dataset.metadata.curriculumAligned).toBe(true);
            expect(dataset.metadata.version).toBe("1.1");
        });
    });

    describe("Questions Structure Validation", () => {
        test("should have exactly 25 questions", () => {
            expect(dataset.questions).toBeDefined();
            expect(Array.isArray(dataset.questions)).toBe(true);
            expect(dataset.questions.length).toBe(26);
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

            expect(easyQuestions.length).toBe(11);
            expect(mediumQuestions.length).toBe(10);
            expect(hardQuestions.length).toBe(5);
        });

        test("should have consistent Grade 8 metadata in all questions", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.grade).toBe(8);
                expect(question.subject).toBe("Mathematics");
                expect(question.type).toBe("FINANCIAL_LITERACY");
                expect(question.curriculumTopic).toBe("Number and Algebra");
                expect(question.verified).toBe(true);
                expect(question.documentType).toBe("question");
            });
        });
    });

    describe("NZ Financial Literacy Content Validation", () => {
        test("should include GST calculation questions", () => {
            const gstQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("gst") ||
                    q.explanation.toLowerCase().includes("gst") ||
                    q.keywords.some((k: string) =>
                        k.toLowerCase().includes("gst")
                    )
            );
            expect(gstQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test("should include KiwiSaver and savings questions", () => {
            const savingsQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("kiwisaver") ||
                    q.question.toLowerCase().includes("savings") ||
                    q.explanation.toLowerCase().includes("kiwisaver") ||
                    q.explanation.toLowerCase().includes("savings") ||
                    q.keywords.some(
                        (k: string) =>
                            k.toLowerCase().includes("kiwisaver") ||
                            k.toLowerCase().includes("savings")
                    )
            );
            expect(savingsQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test("should include interest and loan calculation questions", () => {
            const interestQuestions = dataset.questions.filter(
                (q: any) =>
                    q.question.toLowerCase().includes("interest") ||
                    q.question.toLowerCase().includes("loan") ||
                    q.explanation.toLowerCase().includes("interest") ||
                    q.explanation.toLowerCase().includes("loan")
            );
            expect(interestQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test("should use NZ financial vocabulary and contexts", () => {
            const nzContexts = [
                "new zealand",
                "nz",
                "dollar",
                "kiwisaver",
                "gst",
                "anz",
                "westpac",
                "bnz",
            ];
            const questionsWithNZContext = dataset.questions.filter(
                (q: any) => {
                    const allText = `${q.question} ${
                        q.explanation
                    } ${q.keywords.join(" ")}`.toLowerCase();
                    return nzContexts.some((context) =>
                        allText.includes(context)
                    );
                }
            );
            expect(questionsWithNZContext.length).toBeGreaterThanOrEqual(15);
        });

        test("should include real-world financial scenarios", () => {
            const realWorldScenarios = [
                "budget",
                "shopping",
                "bank",
                "investment",
                "income",
                "expense",
                "saving",
                "spending",
            ];
            const practicalQuestions = dataset.questions.filter((q: any) => {
                const allText = `${q.question} ${q.explanation}`.toLowerCase();
                return realWorldScenarios.some((scenario) =>
                    allText.includes(scenario)
                );
            });
            expect(practicalQuestions.length).toBeGreaterThanOrEqual(20);
        });
    });

    describe("Question Quality Validation", () => {
        test("should have comprehensive explanations for all questions", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.explanation).toBeDefined();
                expect(question.explanation.length).toBeGreaterThan(100);
                expect(question.explanation).toContain("Step");
            });
        });

        test("should have appropriate keywords for financial literacy searchability", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.keywords.length).toBeGreaterThanOrEqual(4);
                expect(question.keywords).toContain("grade 8");
                expect(
                    question.keywords.some((k: string) =>
                        [
                            "financial",
                            "money",
                            "gst",
                            "savings",
                            "interest",
                            "budget",
                            "loan",
                        ].includes(k.toLowerCase())
                    )
                ).toBe(true);
            });
        });

        test("should have unique question IDs following Grade 8 financial literacy convention", () => {
            const ids = dataset.questions.map((q: any) => q.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(dataset.questions.length);

            dataset.questions.forEach((question: any) => {
                expect(question.id).toMatch(
                    /^g8-FINANCIAL_LITERACY-(easy|medium|hard)-\d{3}$/
                );
            });
        });

        test("should have contentForEmbedding field optimized for vector search", () => {
            dataset.questions.forEach((question: any) => {
                expect(question.contentForEmbedding).toBeDefined();
                expect(question.contentForEmbedding.length).toBeGreaterThan(50);
                expect(question.contentForEmbedding.toLowerCase()).toContain(
                    "financial"
                );
            });
        });
    });

    describe("Difficulty Progression Validation", () => {
        test("should have appropriate easy question complexity", () => {
            const easyQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "easy"
            );
            easyQuestions.forEach((question: any) => {
                // Easy questions should have basic financial concepts
                expect(
                    question.question.toLowerCase().includes("calculate") ||
                        question.question.toLowerCase().includes("what is") ||
                        question.question.toLowerCase().includes("convert") ||
                        question.question.toLowerCase().includes("find")
                ).toBe(true);
            });
        });

        test("should have appropriate medium question complexity", () => {
            const mediumQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "medium"
            );
            mediumQuestions.forEach((question: any) => {
                // Medium questions should involve multi-step calculations or real scenarios
                const hasMultiStep =
                    question.explanation.split("Step").length > 3;
                const hasRealScenario = question.question.length > 80;
                expect(hasMultiStep || hasRealScenario).toBe(true);
            });
        });

        test("should have appropriate hard question complexity", () => {
            const hardQuestions = dataset.questions.filter(
                (q: any) => q.difficulty === "hard"
            );
            hardQuestions.forEach((question: any) => {
                // Hard questions should involve complex financial analysis
                expect(
                    question.explanation.split("Step").length
                ).toBeGreaterThanOrEqual(5);
                expect(question.question.length).toBeGreaterThan(100);
            });
        });

        test("should align with Grade 8 NZ financial literacy learning outcomes", () => {
            // Test that questions cover key financial literacy areas for Year 8
            const keyAreas = {
                gst: 0,
                interest: 0,
                savings: 0,
                budgeting: 0,
                percentage: 0,
            };

            dataset.questions.forEach((question: any) => {
                const content =
                    `${question.question} ${question.explanation}`.toLowerCase();
                if (content.includes("gst")) keyAreas.gst++;
                if (content.includes("interest")) keyAreas.interest++;
                if (content.includes("saving") || content.includes("kiwisaver"))
                    keyAreas.savings++;
                if (content.includes("budget") || content.includes("expense"))
                    keyAreas.budgeting++;
                if (content.includes("%") || content.includes("percent"))
                    keyAreas.percentage++;
            });

            expect(keyAreas.gst).toBeGreaterThanOrEqual(2);
            expect(keyAreas.interest).toBeGreaterThanOrEqual(2);
            expect(keyAreas.savings).toBeGreaterThanOrEqual(2);
            expect(keyAreas.budgeting).toBeGreaterThanOrEqual(2);
            expect(keyAreas.percentage).toBeGreaterThanOrEqual(10);
        });
    });
});
