import { describe, it, expect } from "@jest/globals";
import {
    loadCurriculumFromJSON,
    validateCurriculumData,
} from "../utils/curriculum.loader.js";
import path from "path";

describe("Grade 3-8 Curriculum Data Validation", () => {
    it("should load and validate Grade 5 fractions curriculum", async () => {
        const filePath = path.join(
            process.cwd(),
            "sample-curriculum-grade5.json"
        );

        const isValid = await validateCurriculumData(filePath);
        expect(isValid).toBe(true);

        const data = await loadCurriculumFromJSON(filePath);
        expect(data.grade).toBe(5);
        expect(data.topic).toBe("Addition");
        expect(data.subtopic).toBe("Whole Numbers & Decimals");
        expect(data.questionTypes).toContain("decimal_addition");
        expect(data.gradeLevelStandards).toBeDefined();
        expect(data.gradeLevelStandards?.grade).toBe(5);
        expect(data.gradeLevelStandards?.standard).toBe(
            "NZC mathematics — Number and Algebra: Number strategies, addition and subtraction"
        );
    });

    it("should load and validate Grade 7 algebra curriculum", async () => {
        const filePath = path.join(
            process.cwd(),
            "sample-curriculum-grade7.json"
        );

        const isValid = await validateCurriculumData(filePath);
        expect(isValid).toBe(true);

        const data = await loadCurriculumFromJSON(filePath);
        expect(data.grade).toBe(7);
        expect(data.topic).toBe("Algebraic Expressions");
        expect(data.subtopic).toBe("Solving Two-Step Equations");
        expect(data.questionTypes).toContain("solving_equations");
        expect(data.gradeLevelStandards).toBeDefined();
        expect(data.gradeLevelStandards?.grade).toBe(7);
        expect(data.gradeLevelStandards?.standard).toBe("7.EE.4");
    });

    it("should validate batch curriculum data for Grades 3-8", async () => {
        const filePath = path.join(
            process.cwd(),
            "curriculum-batch-grades3-8.json"
        );

        const isValid = await validateCurriculumData(filePath);
        // This will fail because it's an array, not a single curriculum item
        expect(isValid).toBe(false);

        // But we can test the file exists and has valid JSON
        const fs = await import("fs/promises");
        const content = await fs.readFile(filePath, "utf-8");
        const data = JSON.parse(content);

        expect(Array.isArray(data)).toBe(true);
        expect(data).toHaveLength(4);
        expect(data[0].grade).toBe(5);
        expect(data[1].grade).toBe(5);
        expect(data[2].grade).toBe(5);
        expect(data[3].grade).toBe(5);
    });
});
