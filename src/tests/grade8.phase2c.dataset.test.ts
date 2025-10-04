/**
 * Grade 8 Phase 2C Dataset Tests - Speed Calculations
 *
 * RED phase: Write failing tests for Phase 2C dataset before implementation
 * Focus: Speed, distance, and time relationships with practical applications
 * Target: 25 questions (10 easy, 10 medium, 5 hard)
 *
 * @fileoverview Comprehensive test suite for SPEED_CALCULATIONS questions
 * @author Learning Hub Development Team
 * @version 1.0.0
 */

import { describe, test, expect, beforeAll } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("Grade 8 Phase 2C Dataset - Speed Calculations", () => {
    let dataset: any;
    let questions: any[];

    beforeAll(() => {
        const filePath = path.join(
            __dirname,
            "../../question_bank/grade8/grade8_speed_calculations_questions.json"
        );

        // This will fail initially as the file doesn't exist yet (RED phase)
        expect(fs.existsSync(filePath)).toBe(true);

        const fileContent = fs.readFileSync(filePath, "utf8");
        dataset = JSON.parse(fileContent);
        questions = dataset.questions || [];
    });

    // ========================================
    // 1. DATASET STRUCTURE VALIDATION (4 tests)
    // ========================================

    test("should have proper dataset metadata structure", () => {
        expect(dataset).toHaveProperty("metadata");
        expect(dataset.metadata).toHaveProperty(
            "datasetId",
            "grade8-speed-time-distance-2025"
        );
        expect(dataset.metadata).toHaveProperty(
            "datasetName",
            "Grade 8 Speed, Time, and Distance Questions"
        );
        expect(dataset.metadata).toHaveProperty("grade", 8);
        expect(dataset.metadata).toHaveProperty("subject", "Mathematics");
        expect(dataset.metadata).toHaveProperty("topic", "SPEED_TIME_DISTANCE");
    });

    test("should have exactly 30 questions total", () => {
        expect(questions).toHaveLength(30);
    });

    test("should have proper difficulty distribution", () => {
        const difficulties = questions.map((q) => q.difficulty);
        const easyCount = difficulties.filter((d) => d === "easy").length;
        const mediumCount = difficulties.filter((d) => d === "medium").length;
        const hardCount = difficulties.filter((d) => d === "hard").length;

        expect(easyCount).toBe(13);
        expect(mediumCount).toBe(12);
        expect(hardCount).toBe(5);
    });

    test("should have proper question structure for all questions", () => {
        questions.forEach((question) => {
            expect(question).toHaveProperty("id");
            expect(question).toHaveProperty("question");
            expect(question).toHaveProperty("answer");
            expect(question).toHaveProperty("explanation");
            expect(question).toHaveProperty("difficulty");
            expect(question).toHaveProperty("type", "SPEED_TIME_DISTANCE");
            expect(question).toHaveProperty("grade", 8);
            expect(question).toHaveProperty("subject", "Mathematics");
            expect(question).toHaveProperty(
                "curriculumTopic",
                "Measurement and Geometry"
            );
        });
    });

    // ========================================
    // 2. BASIC SPEED CALCULATIONS (6 tests)
    // ========================================

    test("should include basic speed calculation questions (speed = distance ÷ time)", () => {
        const speedQuestions = questions.filter(
            (q) =>
                q.category === "speed" && q.subcategory === "basic-calculation"
        );
        expect(speedQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include distance calculation questions (distance = speed × time)", () => {
        const distanceQuestions = questions.filter(
            (q) =>
                q.category === "distance" &&
                q.subcategory === "basic-calculation"
        );
        expect(distanceQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include time calculation questions (time = distance ÷ speed)", () => {
        const timeQuestions = questions.filter(
            (q) =>
                q.category === "time" && q.subcategory === "basic-calculation"
        );
        expect(timeQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include questions with different speed units (km/h, m/s)", () => {
        const kmhQuestions = questions.filter(
            (q) =>
                q.question.toLowerCase().includes("km/h") ||
                q.answer.toLowerCase().includes("km/h")
        );
        const msQuestions = questions.filter(
            (q) =>
                q.question.toLowerCase().includes("m/s") ||
                q.answer.toLowerCase().includes("m/s")
        );

        expect(kmhQuestions.length).toBeGreaterThanOrEqual(1);
        expect(msQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include unit conversion between speed units", () => {
        const conversionQuestions = questions.filter(
            (q) => q.subcategory === "unit-conversion"
        );
        expect(conversionQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should have proper speed calculation formulas in explanations", () => {
        const speedQuestions = questions.filter(
            (q) =>
                q.question.toLowerCase().includes("speed") ||
                q.question.toLowerCase().includes("distance") ||
                q.question.toLowerCase().includes("time")
        );

        speedQuestions.forEach((question) => {
            expect(question.explanation.toLowerCase()).toMatch(
                /speed.*=.*distance.*÷.*time|distance.*=.*speed.*×.*time|time.*=.*distance.*÷.*speed|s.*=.*d.*÷.*t|d.*=.*s.*×.*t|t.*=.*d.*÷.*s/
            );
        });
    });

    // ========================================
    // 3. REAL-WORLD APPLICATIONS (5 tests)
    // ========================================

    test("should include vehicle speed scenarios", () => {
        const vehicleQuestions = questions.filter(
            (q) => q.subcategory === "vehicle-travel"
        );
        expect(vehicleQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include sports and athletics speed questions", () => {
        const sportsQuestions = questions.filter(
            (q) => q.subcategory === "sports-athletics"
        );
        expect(sportsQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include journey and travel planning questions", () => {
        const journeyQuestions = questions.filter(
            (q) => q.subcategory === "journey-planning"
        );
        expect(journeyQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include New Zealand geographical contexts", () => {
        const nzQuestions = questions.filter(
            (q) =>
                q.context === "new-zealand" ||
                q.question.toLowerCase().includes("auckland") ||
                q.question.toLowerCase().includes("wellington") ||
                q.question.toLowerCase().includes("christchurch") ||
                q.question.toLowerCase().includes("new zealand")
        );
        expect(nzQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include everyday practical speed scenarios", () => {
        const practicalQuestions = questions.filter(
            (q) => q.subcategory === "practical-scenarios"
        );
        expect(practicalQuestions.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 4. PROBLEM-SOLVING COMPLEXITY (4 tests)
    // ========================================

    test("should include multi-step speed problems", () => {
        const multiStepQuestions = questions.filter(
            (q) => q.subcategory === "multi-step"
        );
        expect(multiStepQuestions.length).toBeGreaterThanOrEqual(2);
    });

    test("should include average speed calculations", () => {
        const averageSpeedQuestions = questions.filter(
            (q) => q.subcategory === "average-speed"
        );
        expect(averageSpeedQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include relative speed and overtaking scenarios", () => {
        const relativeSpeedQuestions = questions.filter(
            (q) => q.subcategory === "relative-speed"
        );
        expect(relativeSpeedQuestions.length).toBeGreaterThanOrEqual(1);
    });

    test("should include time schedules and arrival calculations", () => {
        const scheduleQuestions = questions.filter(
            (q) => q.subcategory === "schedule-arrival"
        );
        expect(scheduleQuestions.length).toBeGreaterThanOrEqual(1);
    });

    // ========================================
    // 5. QUESTION QUALITY STANDARDS (4 tests)
    // ========================================

    test("should have age-appropriate mathematical complexity", () => {
        questions.forEach((question) => {
            // Check for Grade 8 appropriate mathematical concepts
            expect(question.question.toLowerCase()).toMatch(
                /speed|distance|time|travel|journey|km\/h|m\/s|kilometres|meters|minutes|hours|average|calculate/
            );

            // Ensure no overly advanced concepts for Grade 8
            expect(question.question.toLowerCase()).not.toMatch(
                /acceleration|velocity|physics|calculus|derivative|integral/
            );
        });
    });

    test("should include proper units in answers and explanations", () => {
        questions.forEach((question) => {
            if (question.category === "speed") {
                expect(question.answer.toLowerCase()).toMatch(
                    /km\/h|m\/s|kilometres per hour|meters per second/
                );
            }
            if (question.category === "distance") {
                expect(question.answer.toLowerCase()).toMatch(
                    /km|m|kilometres|meters|miles/
                );
            }
            if (question.category === "time") {
                expect(question.answer.toLowerCase()).toMatch(
                    /hours|minutes|seconds|h|min|s/
                );
            }
        });
    });

    test("should have comprehensive explanations with formulas", () => {
        questions.forEach((question) => {
            expect(question.explanation).toBeTruthy();
            expect(question.explanation.length).toBeGreaterThan(20);

            // Check that explanations include the relevant formula
            if (question.category === "speed") {
                expect(question.explanation.toLowerCase()).toMatch(
                    /speed.*=.*distance.*÷.*time|s.*=.*d.*÷.*t/
                );
            }
            if (question.category === "distance") {
                expect(question.explanation.toLowerCase()).toMatch(
                    /distance.*=.*speed.*×.*time|d.*=.*s.*×.*t/
                );
            }
            if (question.category === "time") {
                expect(question.explanation.toLowerCase()).toMatch(
                    /time.*=.*distance.*÷.*speed|t.*=.*d.*÷.*s/
                );
            }
        });
    });

    test("should have proper New Zealand curriculum alignment", () => {
        questions.forEach((question) => {
            expect(question.curriculumTopic).toBe("Measurement and Geometry");
            expect(question.curriculumSubtopic).toMatch(
                /speed|distance|time|measurement|practical applications/i
            );

            // All questions should have proper grade level
            expect(question.grade).toBe(8);
            expect(question.type).toBe("SPEED_TIME_DISTANCE");
        });
    });
});

/**
 * Test file validation checklist:
 *
 * ✅ Dataset structure validation (4 tests)
 * ✅ Basic speed calculations (6 tests)
 * ✅ Real-world applications (5 tests)
 * ✅ Problem-solving complexity (4 tests)
 * ✅ Quality standards validation (4 tests)
 *
 * Total: 23 comprehensive tests covering all aspects of Phase 2C
 *
 * Expected Initial Status: All tests FAILING (RED phase)
 * Next Phase: Implement minimal dataset to make tests pass (GREEN phase)
 */
