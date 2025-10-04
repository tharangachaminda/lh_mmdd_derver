import fs from "node:fs";
import path from "node:path";
import { QuestionType } from "../models/question.js";

/**
 * RED Phase Test (Phase 1B - Fraction & Decimal Mastery)
 * -----------------------------------------------------
 * Purpose:
 *  - Establish the contract for the forthcoming Grade 7 Phase 1B dataset
 *  - Enforce creation of a new aggregated QuestionType: FRACTION_DECIMAL_MASTERY
 *  - Require presence of the dataset JSON file with 30 questions (12 easy / 12 medium / 6 hard)
 *
 * This test is EXPECTED TO FAIL initially (RED) because:
 *  1. QuestionType.FRACTION_DECIMAL_MASTERY does NOT yet exist
 *  2. The dataset file does NOT yet exist
 *
 * Minimal GREEN criteria (next phase):
 *  - Add enum member FRACTION_DECIMAL_MASTERY
 *  - Create dataset file with correct metadata skeleton & difficulty distribution totaling 30
 *  - (Questions themselves can be added incrementally in later micro-steps)
 */

describe("Grade 7 Phase 1B Dataset Contract (RED)", () => {
    const datasetPath = path.join(
        process.cwd(),
        "question_bank",
        "grade7",
        "grade7_fraction_decimal_mastery_questions.json"
    );

    it("should define QuestionType.FRACTION_DECIMAL_MASTERY and provide dataset file with correct metadata contract", () => {
        // Expect new aggregated question type to exist
        expect(QuestionType).toHaveProperty("FRACTION_DECIMAL_MASTERY"); // <-- Expected to fail now

        // Dataset file must exist
        const exists = fs.existsSync(datasetPath);
        expect(exists).toBe(true); // <-- Expected to fail now (file not yet created)

        // If (once GREEN) it exists, enforce structural metadata expectations
        if (exists) {
            const raw = fs.readFileSync(datasetPath, "utf-8");
            const json = JSON.parse(raw);
            expect(json.metadata).toBeDefined();
            expect(json.metadata.datasetId).toBe(
                "grade7-fraction-decimal-mastery-2025"
            );
            expect(json.metadata.totalQuestions).toBe(30);
            expect(json.metadata.difficultyDistribution).toEqual({
                easy: 12,
                medium: 12,
                hard: 6,
            });
            expect(Array.isArray(json.questions)).toBe(true);
            // We will tighten question length expectations in subsequent micro-steps.
        }
    });
});
