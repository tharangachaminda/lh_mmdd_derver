import {
    CurriculumContent,
    SampleQuestion,
    MathConcept,
    CurriculumValidationResult,
} from "../models/curriculum.js";
import { QuestionType, DifficultyLevel } from "../models/question.js";

export class CurriculumValidator {
    /**
     * Validates a math concept
     */
    static validateMathConcept(concept: MathConcept): string[] {
        const errors: string[] = [];

        if (!concept.id) errors.push("Math concept must have an ID");
        if (!concept.name) errors.push("Math concept must have a name");
        if (!concept.description)
            errors.push("Math concept must have a description");
        if (!concept.keywords || concept.keywords.length === 0) {
            errors.push("Math concept must have at least one keyword");
        }

        return errors;
    }

    /**
     * Validates a sample question
     */
    static validateSampleQuestion(question: SampleQuestion): string[] {
        const errors: string[] = [];

        if (!question.id) errors.push("Sample question must have an ID");
        if (!question.question)
            errors.push("Sample question must have question text");
        if (question.answer === undefined)
            errors.push("Sample question must have an answer");
        if (!question.explanation)
            errors.push("Sample question must have an explanation");
        if (!Object.values(QuestionType).includes(question.type)) {
            errors.push("Sample question must have a valid question type");
        }

        return errors;
    }

    /**
     * Validates the grade level
     */
    static validateGrade(grade: number): string[] {
        const errors: string[] = [];

        if (!Number.isInteger(grade)) errors.push("Grade must be an integer");
        if (grade < 1 || grade > 6)
            errors.push("Grade must be between 1 and 6");

        return errors;
    }

    /**
     * Validates curriculum content
     */
    static validateCurriculumContent(
        content: CurriculumContent
    ): CurriculumValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Basic field validation
        if (!content.id) errors.push("Curriculum content must have an ID");
        if (!content.subject) errors.push("Subject is required");
        if (!content.topic) errors.push("Topic is required");

        // Grade validation
        errors.push(...this.validateGrade(content.grade));

        // Concept validation
        errors.push(...this.validateMathConcept(content.concept));

        // Difficulty validation
        if (!Object.values(DifficultyLevel).includes(content.difficulty)) {
            errors.push("Invalid difficulty level");
        }

        // Question types validation
        if (!content.questionTypes || content.questionTypes.length === 0) {
            errors.push("At least one question type is required");
        } else {
            content.questionTypes.forEach((type) => {
                if (!Object.values(QuestionType).includes(type)) {
                    errors.push(`Invalid question type: ${type}`);
                }
            });
        }

        // Sample questions validation
        if (!content.sampleQuestions || content.sampleQuestions.length === 0) {
            errors.push("At least one sample question is required");
        } else {
            content.sampleQuestions.forEach((question, index) => {
                const questionErrors = this.validateSampleQuestion(question);
                questionErrors.forEach((error) => {
                    errors.push(`Sample question ${index + 1}: ${error}`);
                });
            });
        }

        // Learning objectives validation
        if (
            !content.learningObjectives ||
            content.learningObjectives.length === 0
        ) {
            errors.push("At least one learning objective is required");
        }

        // Warnings for optional fields
        if (!content.prerequisites || content.prerequisites.length === 0) {
            warnings.push("No prerequisites specified");
        }
        if (!content.commonMistakes || content.commonMistakes.length === 0) {
            warnings.push("No common mistakes specified");
        }

        // Version and timestamp validation
        if (!content.version || content.version < 1) {
            errors.push("Invalid version number");
        }
        if (!content.createdAt) errors.push("Created timestamp is required");
        if (!content.updatedAt) errors.push("Updated timestamp is required");

        return {
            isValid: errors.length === 0,
            errors,
            warnings,
        };
    }
}
