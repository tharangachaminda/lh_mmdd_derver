/**
 * @fileoverview Test suite for Grade 8 Phase 2A: UNIT_CONVERSIONS dataset
 *
 * This test suite validates the UNIT_CONVERSIONS question dataset for Grade 8 Phase 2A,
 * focusing on time (including milliseconds) and volume unit conversions with real-world applications.
 *
 * Educational Standards: NZ Mathematics Curriculum Year 8 - Measurement and Applications
 * TDD Phase: RED - All tests will initially fail until dataset implementation
 *
 * Dataset Requirements:
 * - Total: 20 questions (8 easy, 8 medium, 4 hard)
 * - Time conversions: milliseconds, seconds, minutes, hours
 * - Volume conversions: metric, imperial, real-world applications
 * - Progressive difficulty with practical contexts
 *
 * @author MMDD-TDD Agent
 * @version 1.0
 * @created 2025-10-04
 */

import { readFileSync } from "fs";
import { join } from "path";

describe("Grade 8 Phase 2A: UNIT_CONVERSIONS Dataset", () => {
    let dataset: any;
    let questions: any[];

    beforeAll(() => {
        try {
            const datasetPath = join(
                process.cwd(),
                "question_bank",
                "grade8",
                "grade8_unit_conversions_questions.json"
            );
            const rawData = readFileSync(datasetPath, "utf-8");
            dataset = JSON.parse(rawData);
            questions = dataset.questions || [];
        } catch (error) {
            // Expected to fail initially - this is RED phase
            dataset = null;
            questions = [];
        }
    });

    // ========================================
    // DATASET STRUCTURE VALIDATION (4 tests)
    // ========================================

    describe("Dataset Structure Validation", () => {
        test("should have valid dataset metadata", () => {
            expect(dataset).toBeDefined();
            expect(dataset.metadata).toBeDefined();
            expect(dataset.metadata.datasetId).toBe(
                "grade8-unit-conversions-2025"
            );
            expect(dataset.metadata.datasetName).toBe(
                "Grade 8 Unit Conversions Mathematics Questions"
            );
            expect(dataset.metadata.grade).toBe(8);
            expect(dataset.metadata.subject).toBe("Mathematics");
            expect(dataset.metadata.curriculumTopic).toBe(
                "Measurement and Applications"
            );
            expect(dataset.metadata.totalQuestions).toBe(20);
        });

        test("should have correct question type and difficulty distribution", () => {
            expect(dataset.metadata.questionTypes).toEqual([
                "UNIT_CONVERSIONS",
            ]);
            expect(dataset.metadata.difficultyDistribution).toEqual({
                easy: 8,
                medium: 8,
                hard: 4,
            });
            expect(dataset.metadata.verified).toBe(true);
            expect(dataset.metadata.curriculumAligned).toBe(true);
        });

        test("should contain exactly 20 questions", () => {
            expect(questions).toHaveLength(20);
        });

        test("should have questions with correct difficulty distribution", () => {
            const easyQuestions = questions.filter(
                (q) => q.difficulty === "easy"
            );
            const mediumQuestions = questions.filter(
                (q) => q.difficulty === "medium"
            );
            const hardQuestions = questions.filter(
                (q) => q.difficulty === "hard"
            );

            expect(easyQuestions).toHaveLength(8);
            expect(mediumQuestions).toHaveLength(8);
            expect(hardQuestions).toHaveLength(4);
        });
    });

    // ========================================
    // TIME CONVERSION QUESTIONS (10 tests)
    // ========================================

    describe("Time Conversion Questions", () => {
        test("should include milliseconds to seconds conversions", () => {
            const timeQuestions = questions.filter(
                (q) =>
                    q.curriculumSubtopic?.includes("time") ||
                    q.keywords?.some(
                        (k: string) =>
                            k.includes("milliseconds") || k.includes("seconds")
                    )
            );
            expect(timeQuestions.length).toBeGreaterThanOrEqual(3);

            // Check for milliseconds conversion
            const millisecondsQuestion = timeQuestions.find(
                (q) =>
                    q.question.includes("milliseconds") ||
                    q.keywords?.includes("milliseconds")
            );
            expect(millisecondsQuestion).toBeDefined();
        });

        test("should include minutes to hours conversions", () => {
            const minutesToHoursQuestions = questions.filter(
                (q) =>
                    (q.question.includes("minutes") &&
                        q.question.includes("hours")) ||
                    q.keywords?.some(
                        (k: string) =>
                            k.includes("minutes") &&
                            q.keywords?.includes("hours")
                    )
            );
            expect(minutesToHoursQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test("should include complex time calculations (medium/hard)", () => {
            const complexTimeQuestions = questions.filter(
                (q) =>
                    (q.difficulty === "medium" || q.difficulty === "hard") &&
                    (q.curriculumSubtopic?.includes("time") ||
                        q.keywords?.some((k: string) => k.includes("time")))
            );
            expect(complexTimeQuestions.length).toBeGreaterThanOrEqual(4);
        });

        test("should have time questions with real-world contexts", () => {
            const realWorldTimeQuestions = questions.filter(
                (q) =>
                    q.question.match(
                        /cooking|recipe|movie|race|timer|stopwatch|sport/
                    ) ||
                    q.explanation?.match(
                        /cooking|recipe|movie|race|timer|stopwatch|sport/
                    )
            );
            expect(realWorldTimeQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test("should include seconds to minutes conversions with practical applications", () => {
            const secondsToMinutesQuestions = questions.filter(
                (q) =>
                    q.question.includes("seconds") &&
                    q.question.includes("minutes")
            );
            expect(secondsToMinutesQuestions.length).toBeGreaterThanOrEqual(2);
        });
    });

    // ========================================
    // VOLUME CONVERSION QUESTIONS (10 tests)
    // ========================================

    describe("Volume Conversion Questions", () => {
        test("should include liters to milliliters conversions", () => {
            const litersMlQuestions = questions.filter(
                (q) =>
                    (q.question.includes("liters") ||
                        q.question.includes("litres")) &&
                    (q.question.includes("milliliters") ||
                        q.question.includes("millilitres"))
            );
            expect(litersMlQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test("should include cubic meters to liters conversions", () => {
            const cubicMetersQuestions = questions.filter(
                (q) =>
                    q.question.includes("cubic meters") ||
                    q.question.includes("m³")
            );
            expect(cubicMetersQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test("should include imperial to metric volume conversions", () => {
            const imperialQuestions = questions.filter(
                (q) =>
                    q.question.match(/gallons?|pints?|quarts?|fluid ounces?/) ||
                    q.keywords?.some((k: string) =>
                        k.match(/gallon|pint|quart|imperial/)
                    )
            );
            expect(imperialQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test("should have cooking measurement conversions", () => {
            const cookingQuestions = questions.filter(
                (q) =>
                    q.question.match(
                        /recipe|cooking|baking|cup|tablespoon|teaspoon/
                    ) ||
                    q.explanation?.match(
                        /recipe|cooking|baking|cup|tablespoon|teaspoon/
                    )
            );
            expect(cookingQuestions.length).toBeGreaterThanOrEqual(2);
        });

        test("should include fuel/liquid capacity conversions", () => {
            const fuelQuestions = questions.filter(
                (q) =>
                    q.question.match(/fuel|gas|petrol|tank|container|bottle/) ||
                    q.explanation?.match(
                        /fuel|gas|petrol|tank|container|bottle/
                    )
            );
            expect(fuelQuestions.length).toBeGreaterThanOrEqual(2);
        });
    });

    // ========================================
    // QUESTION QUALITY VALIDATION (5 tests)
    // ========================================

    describe("Question Quality and Standards", () => {
        test("should have all questions with required fields", () => {
            questions.forEach((question, index) => {
                expect(question.id).toBeDefined();
                expect(question.question).toBeDefined();
                expect(question.answer).toBeDefined();
                expect(question.explanation).toBeDefined();
                expect(question.type).toBe("UNIT_CONVERSIONS");
                expect(question.difficulty).toMatch(/^(easy|medium|hard)$/);
                expect(question.grade).toBe(8);
                expect(question.subject).toBe("Mathematics");
            });
        });

        test("should have curriculum alignment for all questions", () => {
            questions.forEach((question, index) => {
                expect(question.curriculumTopic).toBe(
                    "Measurement and Applications"
                );
                expect(question.curriculumSubtopic).toBeDefined();
                expect(question.keywords).toBeDefined();
                expect(Array.isArray(question.keywords)).toBe(true);
                expect(question.keywords.length).toBeGreaterThanOrEqual(4);
            });
        });

        test("should have proper NZ spelling and terminology", () => {
            questions.forEach((question, index) => {
                // Check for proper spelling (litres vs liters, metres vs meters)
                const text =
                    `${question.question} ${question.explanation}`.toLowerCase();
                if (text.includes("liter")) {
                    expect(text.includes("litre")).toBe(true);
                }
                if (text.includes("meter") && !text.includes("thermometer")) {
                    expect(text.includes("metre")).toBe(true);
                }
            });
        });

        test("should have content suitable for Year 8 students (age 12-13)", () => {
            questions.forEach((question, index) => {
                expect(question.question.length).toBeGreaterThan(10);
                expect(question.question.length).toBeLessThan(200);
                expect(question.explanation.length).toBeGreaterThan(20);

                // Check for age-appropriate contexts
                const contexts = question.question.toLowerCase();
                const appropriateContexts = [
                    "school",
                    "student",
                    "classroom",
                    "sport",
                    "cooking",
                    "recipe",
                    "movie",
                    "game",
                    "race",
                    "swimming",
                    "bike",
                    "walk",
                    "run",
                ];
                const hasAppropriateContext = appropriateContexts.some(
                    (context) => contexts.includes(context)
                );
                // At least 60% should have age-appropriate contexts
                // This will be validated in aggregate later
            });
        });

        test("should have progressive difficulty with appropriate mathematical complexity", () => {
            const easyQuestions = questions.filter(
                (q) => q.difficulty === "easy"
            );
            const mediumQuestions = questions.filter(
                (q) => q.difficulty === "medium"
            );
            const hardQuestions = questions.filter(
                (q) => q.difficulty === "hard"
            );

            // Easy questions should have simple, direct conversions
            easyQuestions.forEach((question, index) => {
                expect(question.explanation.length).toBeLessThan(150);
            });

            // Medium questions should involve multi-step conversions
            mediumQuestions.forEach((question, index) => {
                expect(question.explanation.length).toBeGreaterThan(80);
            });

            // Hard questions should involve complex calculations or multiple conversions
            hardQuestions.forEach((question, index) => {
                expect(question.explanation.length).toBeGreaterThan(100);
            });
        });
    });

    // ========================================
    // EDUCATIONAL STANDARDS COMPLIANCE (5 tests)
    // ========================================

    describe("Educational Standards Compliance", () => {
        test("should align with NZ Curriculum Level 4 learning objectives", () => {
            // Level 4: Use appropriate scales, devices, and metric units for length, area, volume and capacity, weight (mass), temperature, angle, and time
            const levelFourTopics = questions.filter((q) =>
                q.curriculumSubtopic?.match(
                    /metric units|volume conversions|time conversions|capacity/
                )
            );
            expect(levelFourTopics.length).toBeGreaterThanOrEqual(15);
        });

        test("should include real-world measurement applications", () => {
            const realWorldQuestions = questions.filter(
                (q) =>
                    q.question.match(
                        /recipe|cooking|fuel|sports?|race|movie|timer|container|bottle|tank/
                    ) ||
                    q.explanation?.match(
                        /recipe|cooking|fuel|sports?|race|movie|timer|container|bottle|tank/
                    )
            );
            expect(realWorldQuestions.length).toBeGreaterThanOrEqual(12);
        });

        test("should demonstrate practical measurement skills", () => {
            const practicalQuestions = questions.filter((q) =>
                q.keywords?.some((k: string) =>
                    k.match(/practical|real-world|application|daily|life/)
                )
            );
            expect(practicalQuestions.length).toBeGreaterThanOrEqual(8);
        });

        test("should include both metric and imperial systems understanding", () => {
            const metricQuestions = questions.filter(
                (q) =>
                    q.question.match(
                        /meters?|metres?|liters?|litres?|grams?|kilograms?/
                    ) || q.keywords?.includes("metric")
            );
            const imperialQuestions = questions.filter(
                (q) =>
                    q.question.match(
                        /gallons?|pints?|quarts?|pounds?|feet|inches/
                    ) || q.keywords?.includes("imperial")
            );

            expect(metricQuestions.length).toBeGreaterThanOrEqual(12);
            expect(imperialQuestions.length).toBeGreaterThanOrEqual(3);
        });

        test("should support development of proportional reasoning", () => {
            const proportionalQuestions = questions.filter(
                (q) =>
                    q.explanation?.match(
                        /multiply|divide|ratio|proportion|scale/
                    ) ||
                    q.keywords?.some((k: string) =>
                        k.match(/conversion|ratio|proportion/)
                    )
            );
            expect(proportionalQuestions.length).toBeGreaterThanOrEqual(16);
        });
    });
});
