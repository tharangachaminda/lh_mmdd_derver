/**
 * Grade 8 Phase 2E FINANCIAL_LITERACY Dataset Tests
 *
 * Comprehensive test suite for financial literacy questions covering:
 * - Simple Interest calculations
 * - Compound Interest scenarios
 * - Budgeting and financial planning
 * - Profit & Loss calculations
 * - Banking concepts and fees
 * - Basic investment principles
 *
 * Tests ensure Grade 8 appropriate content with enhanced mathematical reasoning
 * and New Zealand curriculum alignment.
 *
 * @author MMDD-TDD Agent
 * @version 1.0.0
 */

import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Grade 8 Phase 2E FINANCIAL_LITERACY Dataset", () => {
    let dataset: any;
    let questions: any[];

    beforeAll(() => {
        const filePath = join(
            __dirname,
            "../../question_bank/grade8/grade8_financial_literacy_questions.json"
        );

        if (!existsSync(filePath)) {
            throw new Error(`Dataset file not found: ${filePath}`);
        }

        const fileContent = readFileSync(filePath, "utf8");
        dataset = JSON.parse(fileContent);
        questions = dataset.questions || [];
    });

    describe("Dataset Structure Validation", () => {
        test("should have valid metadata structure", () => {
            expect(dataset.metadata).toBeDefined();
            expect(dataset.metadata.datasetId).toBe(
                "grade8-financial-literacy-2025"
            );
            expect(dataset.metadata.datasetName).toBe(
                "Grade 8 Financial Literacy Questions"
            );
            expect(dataset.metadata.version).toBe("1.0.0");
            expect(dataset.metadata.grade).toBe(8);
            expect(dataset.metadata.subject).toBe("Mathematics");
            expect(dataset.metadata.topic).toBe("FINANCIAL_LITERACY");
            expect(dataset.metadata.curriculumTopic).toBe("Number and Algebra");
            expect(dataset.metadata.curriculumSubtopic).toBe(
                "Financial Mathematics"
            );
        });

        test("should have educational objectives for financial literacy", () => {
            expect(dataset.metadata.educationalObjectives).toBeDefined();
            expect(Array.isArray(dataset.metadata.educationalObjectives)).toBe(
                true
            );
            expect(
                dataset.metadata.educationalObjectives.length
            ).toBeGreaterThanOrEqual(4);

            const objectives = dataset.metadata.educationalObjectives
                .join(" ")
                .toLowerCase();
            expect(objectives).toMatch(
                /interest|financial|budget|profit|saving|investment/
            );
        });

        test("should have comprehensive financial literacy categories", () => {
            expect(dataset.metadata.categories).toBeDefined();
            expect(
                dataset.metadata.categories["simple-interest"]
            ).toBeDefined();
            expect(
                dataset.metadata.categories["compound-interest"]
            ).toBeDefined();
            expect(dataset.metadata.categories["budgeting"]).toBeDefined();
            expect(dataset.metadata.categories["profit-loss"]).toBeDefined();
            expect(dataset.metadata.categories["banking"]).toBeDefined();
            expect(dataset.metadata.categories["investment"]).toBeDefined();
        });

        test("should have target question count between 25-30", () => {
            expect(dataset.metadata.totalQuestions).toBeGreaterThanOrEqual(25);
            expect(dataset.metadata.totalQuestions).toBeLessThanOrEqual(30);
            expect(questions.length).toBe(dataset.metadata.totalQuestions);
        });

        test("should have balanced difficulty distribution", () => {
            expect(dataset.metadata.difficultyDistribution).toBeDefined();
            expect(
                dataset.metadata.difficultyDistribution.easy
            ).toBeGreaterThanOrEqual(8);
            expect(
                dataset.metadata.difficultyDistribution.medium
            ).toBeGreaterThanOrEqual(8);
            expect(
                dataset.metadata.difficultyDistribution.hard
            ).toBeGreaterThanOrEqual(4);

            const total =
                dataset.metadata.difficultyDistribution.easy +
                dataset.metadata.difficultyDistribution.medium +
                dataset.metadata.difficultyDistribution.hard;
            expect(total).toBe(dataset.metadata.totalQuestions);
        });
    });

    describe("Simple Interest Questions", () => {
        test("should have at least 4 simple interest questions", () => {
            const simpleInterestQuestions = questions.filter(
                (q) => q.category === "simple-interest"
            );
            expect(simpleInterestQuestions.length).toBeGreaterThanOrEqual(4);
        });

        test("simple interest questions should cover basic calculations", () => {
            const basicCalculations = questions.filter(
                (q) =>
                    q.category === "simple-interest" &&
                    q.subcategory === "basic-calculation"
            );
            expect(basicCalculations.length).toBeGreaterThanOrEqual(2);
        });

        test("should include time period variations", () => {
            const timePeriodQuestions = questions.filter(
                (q) =>
                    q.category === "simple-interest" &&
                    q.subcategory === "time-period"
            );
            expect(timePeriodQuestions.length).toBeGreaterThanOrEqual(1);
        });

        test("simple interest explanations should include formula reasoning", () => {
            const simpleInterestQuestions = questions.filter(
                (q) => q.category === "simple-interest"
            );

            simpleInterestQuestions.forEach((question) => {
                expect(question.explanation.toLowerCase()).toMatch(
                    /interest.*principal.*rate.*time|formula|calculate/
                );
                expect(question.includesFormula).toBe(true);
            });
        });
    });

    describe("Compound Interest Questions", () => {
        test("should have at least 3 compound interest questions", () => {
            const compoundInterestQuestions = questions.filter(
                (q) => q.category === "compound-interest"
            );
            expect(compoundInterestQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test("should cover annual compounding", () => {
            const annualCompounding = questions.filter(
                (q) =>
                    q.category === "compound-interest" &&
                    q.subcategory === "annual-compounding"
            );
            expect(annualCompounding.length).toBeGreaterThanOrEqual(2);
        });

        test("should include quarterly or monthly compounding", () => {
            const frequentCompounding = questions.filter(
                (q) =>
                    q.category === "compound-interest" &&
                    (q.subcategory === "quarterly-compounding" ||
                        q.subcategory === "monthly-compounding")
            );
            expect(frequentCompounding.length).toBeGreaterThanOrEqual(1);
        });

        test("compound interest questions should be marked as medium or hard difficulty", () => {
            const compoundInterestQuestions = questions.filter(
                (q) => q.category === "compound-interest"
            );

            compoundInterestQuestions.forEach((question) => {
                expect(["medium", "hard"]).toContain(question.difficulty);
            });
        });
    });

    describe("Budgeting Questions", () => {
        test("should have at least 4 budgeting questions", () => {
            const budgetingQuestions = questions.filter(
                (q) => q.category === "budgeting"
            );
            expect(budgetingQuestions.length).toBeGreaterThanOrEqual(4);
        });

        test("should cover income and expenses", () => {
            const incomeExpenseQuestions = questions.filter(
                (q) =>
                    q.category === "budgeting" &&
                    q.subcategory === "income-expenses"
            );
            expect(incomeExpenseQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test("should include savings calculations", () => {
            const savingsQuestions = questions.filter(
                (q) =>
                    q.category === "budgeting" &&
                    q.subcategory === "savings-goals"
            );
            expect(savingsQuestions.length).toBeGreaterThanOrEqual(1);
        });

        test("budgeting questions should use real-world context", () => {
            const budgetingQuestions = questions.filter(
                (q) => q.category === "budgeting"
            );

            budgetingQuestions.forEach((question) => {
                expect(question.context).toBe("real-world");
                expect(question.explanation.toLowerCase()).toMatch(
                    /budget|income|expense|saving|money/
                );
            });
        });
    });

    describe("Profit & Loss Questions", () => {
        test("should have at least 3 profit and loss questions", () => {
            const profitLossQuestions = questions.filter(
                (q) => q.category === "profit-loss"
            );
            expect(profitLossQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test("should cover basic profit calculations", () => {
            const basicProfitQuestions = questions.filter(
                (q) =>
                    q.category === "profit-loss" &&
                    q.subcategory === "basic-profit"
            );
            expect(basicProfitQuestions.length).toBeGreaterThanOrEqual(1);
        });

        test("should include percentage profit/loss", () => {
            const percentageQuestions = questions.filter(
                (q) =>
                    q.category === "profit-loss" &&
                    q.subcategory === "percentage-profit-loss"
            );
            expect(percentageQuestions.length).toBeGreaterThanOrEqual(1);
        });

        test("profit & loss explanations should include business context", () => {
            const profitLossQuestions = questions.filter(
                (q) => q.category === "profit-loss"
            );

            profitLossQuestions.forEach((question) => {
                expect(question.explanation.toLowerCase()).toMatch(
                    /profit|loss|cost|selling|business/
                );
            });
        });
    });

    describe("Banking Questions", () => {
        test("should have at least 3 banking questions", () => {
            const bankingQuestions = questions.filter(
                (q) => q.category === "banking"
            );
            expect(bankingQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test("should cover account fees and charges", () => {
            const feesQuestions = questions.filter(
                (q) =>
                    q.category === "banking" && q.subcategory === "account-fees"
            );
            expect(feesQuestions.length).toBeGreaterThanOrEqual(1);
        });

        test("should include loan calculations", () => {
            const loanQuestions = questions.filter(
                (q) =>
                    q.category === "banking" &&
                    q.subcategory === "loan-calculations"
            );
            expect(loanQuestions.length).toBeGreaterThanOrEqual(1);
        });

        test("banking questions should use New Zealand context where appropriate", () => {
            const bankingQuestions = questions.filter(
                (q) => q.category === "banking"
            );

            const hasNZContext = bankingQuestions.some(
                (question) =>
                    question.question.toLowerCase().includes("nz") ||
                    question.explanation
                        .toLowerCase()
                        .includes("new zealand") ||
                    question.question.includes("$") // NZ dollar context
            );
            expect(hasNZContext).toBe(true);
        });
    });

    describe("Investment Questions", () => {
        test("should have at least 2 investment questions", () => {
            const investmentQuestions = questions.filter(
                (q) => q.category === "investment"
            );
            expect(investmentQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test("should cover basic investment principles", () => {
            const basicInvestmentQuestions = questions.filter(
                (q) =>
                    q.category === "investment" &&
                    q.subcategory === "basic-principles"
            );
            expect(basicInvestmentQuestions.length).toBeGreaterThanOrEqual(1);
        });

        test("investment questions should be appropriate for Grade 8", () => {
            const investmentQuestions = questions.filter(
                (q) => q.category === "investment"
            );

            investmentQuestions.forEach((question) => {
                // Should not include complex investment concepts
                expect(question.explanation.toLowerCase()).not.toMatch(
                    /derivative|hedge|portfolio optimization/
                );
                // Should focus on basic concepts
                expect(question.explanation.toLowerCase()).toMatch(
                    /invest|return|growth|save/
                );
            });
        });
    });

    describe("Question Quality Standards", () => {
        test("all questions should have required fields", () => {
            questions.forEach((question, index) => {
                expect(question.id).toBeDefined();
                expect(question.type).toBe("FINANCIAL_LITERACY");
                expect(question.difficulty).toMatch(/^(easy|medium|hard)$/);
                expect(question.grade).toBe(8);
                expect(question.subject).toBe("Mathematics");
                expect(question.curriculumTopic).toBe("Number and Algebra");
                expect(question.curriculumSubtopic).toBe(
                    "Financial Mathematics"
                );
                expect(question.category).toBeDefined();
                expect(question.subcategory).toBeDefined();
                expect(question.question).toBeDefined();
                expect(question.answer).toBeDefined();
                expect(question.explanation).toBeDefined();
                expect(question.keyTerms).toBeDefined();
                expect(question.context).toBeDefined();
                expect(question.includesFormula).toBeDefined();
            });
        });

        test("question IDs should follow FL-X pattern", () => {
            questions.forEach((question) => {
                expect(question.id).toMatch(/^FL-[A-Z0-9]+$/);
            });
        });

        test("explanations should include enhanced reasoning patterns", () => {
            const reasoningPatterns = ["because", "therefore", "since"];

            questions.forEach((question) => {
                const hasReasoningPattern = reasoningPatterns.some((pattern) =>
                    question.explanation.toLowerCase().includes(pattern)
                );
                expect(hasReasoningPattern).toBe(true);
            });
        });

        test("questions should use Grade 8 appropriate vocabulary", () => {
            const inappropriateTerms = [
                "derivative",
                "stochastic",
                "algorithmic",
                "optimization",
                "arbitrage",
                "volatility",
                "beta coefficient",
                "correlation matrix",
            ];

            questions.forEach((question) => {
                const questionText =
                    `${question.question} ${question.explanation}`.toLowerCase();
                inappropriateTerms.forEach((term) => {
                    expect(questionText).not.toContain(term);
                });
            });
        });

        test("financial questions should include relevant key terms", () => {
            questions.forEach((question) => {
                expect(Array.isArray(question.keyTerms)).toBe(true);
                expect(question.keyTerms.length).toBeGreaterThanOrEqual(2);

                const allKeyTerms = question.keyTerms.join(" ").toLowerCase();
                expect(allKeyTerms).toMatch(
                    /interest|money|profit|loss|budget|bank|invest|saving|financial/
                );
            });
        });

        test("answers should be appropriately formatted", () => {
            questions.forEach((question) => {
                expect(question.answer).toBeDefined();
                expect(typeof question.answer).toBe("string");
                expect(question.answer.length).toBeGreaterThan(0);

                // Financial answers should often include currency or percentages
                if (
                    question.category !== "investment" ||
                    question.subcategory !== "basic-principles"
                ) {
                    expect(question.answer).toMatch(
                        /\$|%|dollar|cent|percent/i
                    );
                }
            });
        });
    });

    describe("Mathematical Complexity Validation", () => {
        test("easy questions should use simple calculations", () => {
            const easyQuestions = questions.filter(
                (q) => q.difficulty === "easy"
            );

            easyQuestions.forEach((question) => {
                // Easy questions should not involve complex compound interest
                if (question.category === "compound-interest") {
                    expect(question.subcategory).toBe("annual-compounding");
                }

                // Should not involve complex percentages
                expect(question.explanation).not.toMatch(
                    /quarterly|monthly.*compounding/i
                );
            });
        });

        test("medium questions should involve moderate calculations", () => {
            const mediumQuestions = questions.filter(
                (q) => q.difficulty === "medium"
            );
            expect(mediumQuestions.length).toBeGreaterThanOrEqual(8);

            mediumQuestions.forEach((question) => {
                // Should involve some calculation complexity
                expect(question.includesFormula).toBe(true);
            });
        });

        test("hard questions should involve complex scenarios", () => {
            const hardQuestions = questions.filter(
                (q) => q.difficulty === "hard"
            );
            expect(hardQuestions.length).toBeGreaterThanOrEqual(4);

            hardQuestions.forEach((question) => {
                // Hard questions should involve multi-step calculations or complex concepts
                expect(question.explanation.length).toBeGreaterThan(100);
                expect(question.includesFormula).toBe(true);
            });
        });
    });

    describe("Curriculum Alignment", () => {
        test("should align with New Zealand Level 4-5 Mathematics", () => {
            expect(dataset.metadata.curriculumAlignment).toBe(
                "New Zealand Mathematics Curriculum Level 4-5"
            );
        });

        test("questions should reflect New Zealand financial context", () => {
            const nzContextIndicators = questions.filter((question) => {
                const text =
                    `${question.question} ${question.explanation}`.toLowerCase();
                return (
                    text.includes("$") ||
                    text.includes("dollar") ||
                    text.includes("nz") ||
                    text.includes("new zealand") ||
                    text.includes("gst")
                );
            });

            expect(nzContextIndicators.length).toBeGreaterThanOrEqual(10);
        });

        test("should include real-world financial scenarios relevant to students", () => {
            const realWorldQuestions = questions.filter(
                (q) => q.context === "real-world"
            );
            expect(realWorldQuestions.length).toBeGreaterThanOrEqual(15);

            const studentRelevantTopics = questions.filter((question) => {
                const text =
                    `${question.question} ${question.explanation}`.toLowerCase();
                return (
                    text.includes("pocket money") ||
                    text.includes("saving") ||
                    text.includes("part-time") ||
                    text.includes("student") ||
                    text.includes("allowance") ||
                    text.includes("teenager")
                );
            });

            expect(studentRelevantTopics.length).toBeGreaterThanOrEqual(3);
        });
    });

    describe("Enhanced Metadata Validation", () => {
        test("should include vector search optimization metadata", () => {
            expect(dataset.vectorSearchOptimization).toBeDefined();
            expect(dataset.vectorSearchOptimization.embeddingDimensions).toBe(
                1536
            );
            expect(dataset.vectorSearchOptimization.searchableFields).toContain(
                "question"
            );
            expect(dataset.vectorSearchOptimization.searchableFields).toContain(
                "explanation"
            );
            expect(dataset.vectorSearchOptimization.indexOptimized).toBe(true);
        });

        test("should include quality assurance metadata", () => {
            expect(dataset.qualityAssurance).toBeDefined();
            expect(dataset.qualityAssurance.testFramework).toBe("Jest");
            expect(dataset.qualityAssurance.tddMethodology).toBe(
                "Red-Green-Refactor"
            );
            expect(dataset.qualityAssurance.codeQuality).toBe(
                "Production Ready"
            );
        });

        test("should have production-ready quality metrics", () => {
            expect(dataset.metadata.qualityMetrics).toBeDefined();
            expect(dataset.metadata.qualityMetrics.vocabularyCompliance).toBe(
                "Grade 8 appropriate"
            );
            expect(dataset.metadata.qualityMetrics.reasoningPatterns).toContain(
                "Enhanced with because/therefore/since"
            );
            expect(dataset.metadata.qualityMetrics.curriculumAlignment).toBe(
                "New Zealand Level 4-5"
            );
        });
    });
});
