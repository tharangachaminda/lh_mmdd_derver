import { CurriculumValidator } from "../utils/curriculum.validator.js";
import {
    MathConcept,
    SampleQuestion,
    CurriculumContent,
} from "../models/curriculum.js";
import { QuestionType, DifficultyLevel } from "../models/question.js";

describe("CurriculumValidator", () => {
    describe("validateMathConcept", () => {
        it("should validate a valid math concept", () => {
            const concept: MathConcept = {
                id: "concept-1",
                name: "Addition of Fractions",
                description: "Adding fractions with like denominators",
                keywords: ["fractions", "addition", "like denominators"],
            };

            const errors = CurriculumValidator.validateMathConcept(concept);
            expect(errors).toHaveLength(0);
        });

        it("should return errors for invalid math concept", () => {
            const concept = {
                id: "",
                name: "",
                description: "",
                keywords: [],
            } as MathConcept;

            const errors = CurriculumValidator.validateMathConcept(concept);
            expect(errors).toContain("Math concept must have an ID");
            expect(errors).toContain("Math concept must have a name");
            expect(errors).toContain("Math concept must have a description");
            expect(errors).toContain(
                "Math concept must have at least one keyword"
            );
        });
    });

    describe("validateSampleQuestion", () => {
        it("should validate a valid sample question", () => {
            const question: SampleQuestion = {
                id: "question-1",
                question: "What is 2/5 + 1/5?",
                answer: "3/5",
                explanation:
                    "When adding fractions with like denominators, add the numerators and keep the denominator the same.",
                type: QuestionType.FRACTION_ADDITION,
                keywords: ["fractions", "addition"],
            };

            const errors = CurriculumValidator.validateSampleQuestion(question);
            expect(errors).toHaveLength(0);
        });

        it("should return errors for invalid sample question", () => {
            const question = {
                id: "",
                question: "",
                explanation: "",
                type: "INVALID_TYPE" as QuestionType,
            } as SampleQuestion;

            const errors = CurriculumValidator.validateSampleQuestion(question);
            expect(errors).toContain("Sample question must have an ID");
            expect(errors).toContain("Sample question must have question text");
            expect(errors).toContain("Sample question must have an answer");
            expect(errors).toContain(
                "Sample question must have a valid question type"
            );
        });
    });

    describe("validateGrade", () => {
        it.each([1, 2, 3, 4, 5, 6])("should validate grade %i", (grade) => {
            const errors = CurriculumValidator.validateGrade(grade);
            expect(errors).toHaveLength(0);
        });

        it.each([-1, 0, 7, 1.5])(
            "should return error for invalid grade %i",
            (grade) => {
                const errors = CurriculumValidator.validateGrade(grade);
                expect(errors.length).toBeGreaterThan(0);
            }
        );
    });

    describe("validateCurriculumContent", () => {
        let validContent: CurriculumContent;

        beforeEach(() => {
            validContent = {
                id: "content-1",
                grade: 5,
                subject: "Mathematics",
                topic: "Fractions",
                subtopic: "Addition",
                concept: {
                    id: "concept-1",
                    name: "Addition of Fractions",
                    description: "Adding fractions with like denominators",
                    keywords: ["fractions", "addition"],
                },
                difficulty: DifficultyLevel.MEDIUM,
                questionTypes: [QuestionType.FRACTION_ADDITION],
                sampleQuestions: [
                    {
                        id: "question-1",
                        question: "What is 2/5 + 1/5?",
                        answer: "3/5",
                        explanation: "Add numerators, keep denominator",
                        type: QuestionType.FRACTION_ADDITION,
                    },
                ],
                prerequisites: ["Understanding fractions"],
                learningObjectives: ["Add fractions with like denominators"],
                commonMistakes: ["Adding denominators"],
                createdAt: new Date(),
                updatedAt: new Date(),
                version: 1,
            };
        });

        it("should validate valid curriculum content", () => {
            const result =
                CurriculumValidator.validateCurriculumContent(validContent);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should validate and return warnings for missing optional fields", () => {
            const contentWithoutOptionals: CurriculumContent = {
                ...validContent,
                prerequisites: undefined,
                commonMistakes: undefined,
            };

            const result = CurriculumValidator.validateCurriculumContent(
                contentWithoutOptionals
            );
            expect(result.isValid).toBe(true);
            expect(result.warnings).toContain("No prerequisites specified");
            expect(result.warnings).toContain("No common mistakes specified");
        });

        it("should return errors for invalid curriculum content", () => {
            const invalidContent: CurriculumContent = {
                id: "",
                grade: 0,
                subject: "",
                topic: "",
                concept: {
                    id: "",
                    name: "",
                    description: "",
                    keywords: [],
                },
                difficulty: "INVALID" as DifficultyLevel,
                questionTypes: [],
                sampleQuestions: [],
                learningObjectives: [],
                createdAt: new Date(0),
                updatedAt: new Date(0),
                version: 0,
            };

            const result =
                CurriculumValidator.validateCurriculumContent(invalidContent);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain(
                "Curriculum content must have an ID"
            );
            expect(result.errors).toContain("Subject is required");
            expect(result.errors).toContain("Topic is required");
            expect(result.errors).toContain("Grade must be between 1 and 6");
            expect(result.errors).toContain("Invalid difficulty level");
            expect(result.errors).toContain(
                "At least one question type is required"
            );
            expect(result.errors).toContain(
                "At least one sample question is required"
            );
            expect(result.errors).toContain(
                "At least one learning objective is required"
            );
        });

        it("should validate timestamps and version", () => {
            const contentWithInvalidTimestamps: CurriculumContent = {
                ...validContent,
                createdAt: null as unknown as Date,
                updatedAt: null as unknown as Date,
                version: 0,
            };

            const result = CurriculumValidator.validateCurriculumContent(
                contentWithInvalidTimestamps
            );
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Created timestamp is required");
            expect(result.errors).toContain("Updated timestamp is required");
            expect(result.errors).toContain("Invalid version number");
        });
    });
});
