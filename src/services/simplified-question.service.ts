import { z } from "zod";
import {
    MainQuestionType,
    QuestionSubType,
    QuestionGenerationRequest,
    QuestionOutput,
    MultipleQuestionsOutput,
    QuestionOutputSchema,
    MultipleQuestionsOutputSchema,
    selectSubTypes,
    getSubTypesForGrade,
    convertSubTypeToLegacy,
    convertDifficultyStringToEnum,
} from "../models/simplified-question-types.js";
import { LanguageModelFactory } from "./language-model.factory.js";
import { VectorEnhancedQuestionService } from "./vector-enhanced-question.service.js";
import { QuestionType, DifficultyLevel } from "../models/question.js";

/**
 * Service for managing simplified question types and structured AI output
 */
export class SimplifiedQuestionService {
    private languageModelFactory: LanguageModelFactory;
    private vectorEnhancedService: VectorEnhancedQuestionService;

    constructor() {
        this.languageModelFactory = LanguageModelFactory.getInstance();
        this.vectorEnhancedService = new VectorEnhancedQuestionService();
    }

    /**
     * Generate questions using simplified main types with intelligent sub-type selection
     */
    async generateQuestions(
        request: QuestionGenerationRequest
    ): Promise<MultipleQuestionsOutput> {
        const startTime = Date.now();

        try {
            // Validate request
            const validatedRequest = this.validateRequest(request);

            // Select sub-types for each main type
            const typeSubTypeMapping =
                this.planQuestionGeneration(validatedRequest);

            // Generate questions for each type/sub-type combination
            const questions: QuestionOutput[] = [];
            const subTypesUsed: Set<QuestionSubType> = new Set();

            for (const [mainType, subTypes] of Array.from(
                typeSubTypeMapping.entries()
            )) {
                const questionsPerType = Math.ceil(
                    validatedRequest.count / validatedRequest.types.length
                );

                for (
                    let i = 0;
                    i < questionsPerType &&
                    questions.length < validatedRequest.count;
                    i++
                ) {
                    // Select sub-type (rotate through available sub-types for variety)
                    const subType = subTypes[i % subTypes.length];
                    subTypesUsed.add(subType);

                    const question = await this.generateSingleQuestion({
                        mainType,
                        subType,
                        grade: validatedRequest.grade,
                        difficulty: validatedRequest.difficulty,
                        context: validatedRequest.context,
                    });

                    questions.push(question);
                }
            }

            // Calculate difficulty distribution
            const difficultyDistribution: Record<string, number> = {};
            questions.forEach((q) => {
                difficultyDistribution[q.difficulty] =
                    (difficultyDistribution[q.difficulty] || 0) + 1;
            });

            const result: MultipleQuestionsOutput = {
                questions: questions.slice(0, validatedRequest.count),
                metadata: {
                    totalQuestions: validatedRequest.count,
                    mainType: validatedRequest.types[0], // Primary type for metadata
                    subTypesUsed: Array.from(subTypesUsed),
                    difficultyDistribution,
                    generationTime: Date.now() - startTime,
                },
            };

            // Validate output with Zod
            return MultipleQuestionsOutputSchema.parse(result);
        } catch (error) {
            console.error("Error generating questions:", error);
            throw new Error(
                `Question generation failed: ${
                    error instanceof Error ? error.message : "Unknown error"
                }`
            );
        }
    }

    /**
     * Generate a single question with specific sub-type
     */
    async generateSingleQuestion(params: {
        mainType: MainQuestionType;
        subType: QuestionSubType;
        grade: number;
        difficulty: string;
        context?: string;
    }): Promise<QuestionOutput> {
        const { mainType, subType, grade, difficulty, context } = params;

        try {
            // Convert to legacy types for vector-enhanced service
            const legacyType = convertSubTypeToLegacy(subType);
            const difficultyLevel = convertDifficultyStringToEnum(difficulty);

            // Use vector-enhanced service for context-aware generation
            const vectorResult =
                await this.vectorEnhancedService.generateVectorEnhancedQuestion(
                    {
                        type: legacyType,
                        difficulty: difficultyLevel,
                        grade: grade,
                        useVectorContext: true,
                        maxSimilarQuestions: 3,
                    }
                );

            // Convert vector-enhanced result to simplified format
            return QuestionOutputSchema.parse({
                question: vectorResult.question,
                answer: vectorResult.answer.toString(),
                subType: subType,
                difficulty: difficulty,
                grade: grade,
                context: context,
                explanation: vectorResult.explanation,
                vectorContext: vectorResult.vectorContext,
                generationMetadata: vectorResult.generationMetadata,
            });
        } catch (error) {
            console.error(
                `Error generating ${subType} question with vector enhancement:`,
                error
            );

            // Fallback to AI generation without vector context
            try {
                // Build structured prompt for AI
                const prompt = this.buildStructuredPrompt(
                    mainType,
                    subType,
                    grade,
                    difficulty,
                    context
                );

                // Get AI model and generate
                const model = this.languageModelFactory.createModel();
                const response = await model.generateMathQuestion(
                    `${mainType}_${subType}`,
                    grade,
                    difficulty
                );

                // Parse and validate AI response
                const parsedQuestion = this.parseAIResponse(
                    response,
                    subType,
                    grade,
                    difficulty
                );

                return QuestionOutputSchema.parse(parsedQuestion);
            } catch (fallbackError) {
                console.error(
                    `Fallback generation also failed for ${subType}:`,
                    fallbackError
                );

                // Final fallback to deterministic generation
                return this.generateFallbackQuestion(
                    mainType,
                    subType,
                    grade,
                    difficulty,
                    context
                );
            }
        }
    }

    /**
     * Validate incoming request
     */
    private validateRequest(
        request: QuestionGenerationRequest
    ): QuestionGenerationRequest {
        // Remove duplicates from types
        const uniqueTypes = Array.from(new Set(request.types));

        return {
            ...request,
            types: uniqueTypes,
        };
    }

    /**
     * Plan question generation by selecting appropriate sub-types
     */
    private planQuestionGeneration(
        request: QuestionGenerationRequest
    ): Map<MainQuestionType, QuestionSubType[]> {
        const typeSubTypeMapping = new Map<
            MainQuestionType,
            QuestionSubType[]
        >();

        request.types.forEach((mainType) => {
            const subTypes = selectSubTypes(mainType, request.grade, {
                includeWordProblems: request.includeWordProblems,
                includeDecimals: request.includeDecimals,
                includeFractions: request.includeFractions,
            });

            typeSubTypeMapping.set(mainType, subTypes);
        });

        return typeSubTypeMapping;
    }

    /**
     * Build structured prompt for AI generation
     */
    private buildStructuredPrompt(
        mainType: MainQuestionType,
        subType: QuestionSubType,
        grade: number,
        difficulty: string,
        context?: string
    ): string {
        const contextSection = context ? `Context: ${context}\n` : "";

        return `Generate a grade ${grade} ${difficulty} difficulty ${mainType} question.
${contextSection}
Specific sub-type: ${subType}

Requirements:
- Question must be age-appropriate for grade ${grade}
- Difficulty level: ${difficulty}
- Include clear, accurate answer
- Provide step-by-step solution if complex
- Use real-world scenarios when possible

Format your response as a JSON object with these fields:
{
  "question": "The question text",
  "answer": "The correct answer (number or string)",
  "explanation": "Brief explanation of how to solve",
  "workingSteps": ["Step 1", "Step 2", ...] (optional),
  "subType": "${subType}",
  "difficulty": "${difficulty}",
  "grade": ${grade},
  "context": "Real-world context used" (optional)
}

Generate exactly one question following this format.`;
    }

    /**
     * Parse AI response and extract structured data
     */
    private parseAIResponse(
        response: string,
        expectedSubType: QuestionSubType,
        expectedGrade: number,
        expectedDifficulty: string
    ): QuestionOutput {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error("No JSON found in AI response");
            }

            const parsed = JSON.parse(jsonMatch[0]);

            // Ensure required fields with fallbacks
            return {
                question: parsed.question || "Generated question not found",
                answer: parsed.answer || 0,
                explanation: parsed.explanation,
                workingSteps: parsed.workingSteps,
                subType: parsed.subType || expectedSubType,
                difficulty:
                    (parsed.difficulty as "easy" | "medium" | "hard") ||
                    (expectedDifficulty as "easy" | "medium" | "hard"),
                grade: parsed.grade || expectedGrade,
                context: parsed.context,
            };
        } catch (error) {
            console.error("Failed to parse AI response:", error);

            // Extract question and answer using regex fallback
            const questionMatch = response.match(
                /(?:Question|Q):\s*(.+?)(?:\n|Answer|A:|$)/i
            );
            const answerMatch = response.match(/(?:Answer|A):\s*([^\n]+)/i);

            return {
                question:
                    questionMatch?.[1]?.trim() ||
                    "Question could not be parsed",
                answer: answerMatch?.[1]?.trim() || "Answer not found",
                subType: expectedSubType,
                difficulty: expectedDifficulty as "easy" | "medium" | "hard",
                grade: expectedGrade,
            };
        }
    }

    /**
     * Generate fallback question when AI fails
     */
    private generateFallbackQuestion(
        mainType: MainQuestionType,
        subType: QuestionSubType,
        grade: number,
        difficulty: string,
        context?: string
    ): QuestionOutput {
        const templates = this.getFallbackTemplates(mainType, subType, grade);
        const template =
            templates[Math.floor(Math.random() * templates.length)];

        return {
            question: template.question,
            answer: template.answer,
            explanation: template.explanation,
            subType,
            difficulty: difficulty as "easy" | "medium" | "hard",
            grade,
            context: context || template.context,
        };
    }

    /**
     * Get fallback question templates for reliable generation
     */
    private getFallbackTemplates(
        mainType: MainQuestionType,
        subType: QuestionSubType,
        grade: number
    ): Array<{
        question: string;
        answer: number | string;
        explanation?: string;
        context?: string;
    }> {
        const gradeRange = this.getNumberRangeForGrade(grade);
        const num1 = Math.floor(Math.random() * gradeRange) + 1;
        const num2 = Math.floor(Math.random() * gradeRange) + 1;

        switch (mainType) {
            case MainQuestionType.ADDITION:
                return [
                    {
                        question: `What is ${num1} + ${num2}?`,
                        answer: num1 + num2,
                        explanation: `Add ${num1} and ${num2} to get ${
                            num1 + num2
                        }`,
                        context: "Basic addition",
                    },
                ];

            case MainQuestionType.SUBTRACTION:
                const larger = Math.max(num1, num2);
                const smaller = Math.min(num1, num2);
                return [
                    {
                        question: `What is ${larger} - ${smaller}?`,
                        answer: larger - smaller,
                        explanation: `Subtract ${smaller} from ${larger} to get ${
                            larger - smaller
                        }`,
                        context: "Basic subtraction",
                    },
                ];

            case MainQuestionType.MULTIPLICATION:
                return [
                    {
                        question: `What is ${num1} × ${num2}?`,
                        answer: num1 * num2,
                        explanation: `Multiply ${num1} by ${num2} to get ${
                            num1 * num2
                        }`,
                        context: "Basic multiplication",
                    },
                ];

            case MainQuestionType.DIVISION:
                const product = num1 * num2;
                return [
                    {
                        question: `What is ${product} ÷ ${num1}?`,
                        answer: num2,
                        explanation: `Divide ${product} by ${num1} to get ${num2}`,
                        context: "Basic division",
                    },
                ];

            case MainQuestionType.PATTERN_RECOGNITION:
                const sequence = [num1, num1 + 2, num1 + 4, num1 + 6];
                return [
                    {
                        question: `What comes next in this pattern: ${sequence.join(
                            ", "
                        )}, ___?`,
                        answer: num1 + 8,
                        explanation: `The pattern increases by 2 each time, so ${
                            num1 + 6
                        } + 2 = ${num1 + 8}`,
                        context: "Number pattern",
                    },
                ];

            default:
                return [
                    {
                        question: `What is ${num1} + ${num2}?`,
                        answer: num1 + num2,
                        explanation: "Fallback addition question",
                    },
                ];
        }
    }

    /**
     * Get appropriate number range for grade level
     */
    private getNumberRangeForGrade(grade: number): number {
        const ranges: Record<number, number> = {
            1: 10,
            2: 20,
            3: 100,
            4: 1000,
            5: 10000,
        };

        return ranges[grade] || ranges[5];
    }

    /**
     * Get sub-types available for a main type and grade
     */
    getAvailableSubTypes(
        mainType: MainQuestionType,
        grade: number
    ): QuestionSubType[] {
        return getSubTypesForGrade(mainType, grade);
    }

    /**
     * Get all main types
     */
    getMainTypes(): MainQuestionType[] {
        return Object.values(MainQuestionType);
    }
}

export default SimplifiedQuestionService;
