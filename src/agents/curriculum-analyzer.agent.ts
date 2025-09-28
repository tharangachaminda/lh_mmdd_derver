import { IEducationalAgent, AgentContext } from "./base-agent.interface.js";
import { EmbeddingService } from "../services/embedding.service.js";
import opensearchService from "../services/opensearch.service.js";
import { QuestionType } from "../models/question.js";

/**
 * Curriculum Analyzer Agent
 *
 * Responsible for:
 * - Validating grade-level appropriateness
 * - Searching vector database for curriculum-aligned examples
 * - Identifying learning objectives and prerequisite skills
 * - Ensuring questions align with educational standards
 */
export class CurriculumAnalyzerAgent implements IEducationalAgent {
    public readonly name = "CurriculumAnalyzerAgent";
    public readonly description =
        "Analyzes curriculum requirements and finds relevant examples from vector database";

    private embeddingService: EmbeddingService;

    constructor(embeddingService?: EmbeddingService) {
        this.embeddingService = embeddingService || new EmbeddingService();
    }

    /**
     * Process curriculum analysis for the given context
     *
     * @param context - Current workflow context
     * @returns Updated context with curriculum analysis results
     */
    async process(context: AgentContext): Promise<AgentContext> {
        try {
            context.workflow.currentStep = this.name;

            // Generate search query for similar questions
            const searchQuery = this.buildSearchQuery(context);

            // Search vector database for similar questions
            const similarQuestions = await this.findSimilarQuestions(
                searchQuery,
                context.questionType,
                context.grade
            );

            // Analyze curriculum requirements
            const curriculumAnalysis = this.analyzeCurriculumRequirements(
                context.questionType,
                context.grade,
                context.difficulty
            );

            // Update context with curriculum analysis
            context.curriculumContext = {
                learningObjectives: curriculumAnalysis.learningObjectives,
                prerequisiteSkills: curriculumAnalysis.prerequisiteSkills,
                similarQuestions: similarQuestions,
            };

            return context;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            context.workflow.errors.push(`CurriculumAnalyzer: ${errorMessage}`);
            return context;
        }
    }

    /**
     * Build search query for vector database lookup
     *
     * @param context - Current workflow context
     * @returns Search query string
     */
    private buildSearchQuery(context: AgentContext): string {
        const { questionType, grade, difficulty } = context;

        const typeDescriptions: Record<string, string> = {
            [QuestionType.ADDITION]: "addition problems arithmetic sum",
            [QuestionType.SUBTRACTION]:
                "subtraction problems arithmetic difference",
            [QuestionType.MULTIPLICATION]:
                "multiplication problems arithmetic product times",
            [QuestionType.DIVISION]:
                "division problems arithmetic quotient divide",
            [QuestionType.FRACTION_ADDITION]:
                "fraction problems parts whole numerator denominator",
            [QuestionType.DECIMAL_ADDITION]:
                "decimal problems decimal point place value",
            [QuestionType.ALGEBRAIC_EXPRESSION]:
                "word problems story problems real world application",
            [QuestionType.AREA_CALCULATION]:
                "geometry shapes area perimeter volume angles",
        };

        const baseQuery =
            typeDescriptions[questionType] ||
            questionType.toLowerCase().replace("_", " ");
        return `grade ${grade} ${difficulty} ${baseQuery} elementary school math`;
    }

    /**
     * Find similar questions from vector database
     *
     * @param searchQuery - Query for similarity search
     * @param questionType - Type of question being generated
     * @param grade - Target grade level
     * @returns Array of similar questions with relevance scores
     */
    private async findSimilarQuestions(
        searchQuery: string,
        questionType: QuestionType,
        grade: number
    ): Promise<
        Array<{
            question: string;
            explanation?: string;
            type: QuestionType;
            score: number;
        }>
    > {
        try {
            // Generate embedding for search query
            const queryEmbedding =
                await this.embeddingService.generateEmbedding(searchQuery);

            // Search vector database
            const searchResults =
                await opensearchService.searchSimilarQuestions(
                    queryEmbedding,
                    5 // limit
                );

            return searchResults.map((result) => ({
                question: result.question,
                explanation: result.topic || "No explanation available",
                type: questionType, // Use original question type
                score: result.score,
            }));
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            console.warn(`Vector search failed: ${errorMessage}`);
            return [];
        }
    }

    /**
     * Analyze curriculum requirements for given parameters
     *
     * @param questionType - Type of question
     * @param grade - Target grade level
     * @param difficulty - Difficulty level
     * @returns Curriculum analysis results
     */
    private analyzeCurriculumRequirements(
        questionType: QuestionType,
        grade: number,
        difficulty: string
    ): {
        learningObjectives: string[];
        prerequisiteSkills: string[];
    } {
        // Grade-specific curriculum mapping
        const curriculumMap: Record<
            number,
            Record<string, { objectives: string[]; prerequisites: string[] }>
        > = {
            1: {
                [QuestionType.ADDITION]: {
                    objectives: [
                        "Add within 20",
                        "Use addition strategies",
                        "Understand addition as joining",
                    ],
                    prerequisites: [
                        "Count to 20",
                        "Number recognition",
                        "Basic counting strategies",
                    ],
                },
                [QuestionType.SUBTRACTION]: {
                    objectives: [
                        "Subtract within 20",
                        "Use subtraction strategies",
                        "Understand subtraction as separation",
                    ],
                    prerequisites: [
                        "Count to 20",
                        "Understand addition",
                        "Basic number sense",
                    ],
                },
            },
            2: {
                [QuestionType.ADDITION]: {
                    objectives: [
                        "Add within 100",
                        "Use place value in addition",
                        "Add two-digit numbers",
                    ],
                    prerequisites: [
                        "Add within 20 fluently",
                        "Understand place value",
                        "Basic addition facts",
                    ],
                },
                [QuestionType.SUBTRACTION]: {
                    objectives: [
                        "Subtract within 100",
                        "Use place value in subtraction",
                        "Subtract two-digit numbers",
                    ],
                    prerequisites: [
                        "Subtract within 20 fluently",
                        "Understand place value",
                        "Basic subtraction facts",
                    ],
                },
            },
            // Add more grades as needed...
        };

        const gradeMap =
            curriculumMap[grade] || curriculumMap[Math.min(grade, 2)] || {};
        const typeMap = gradeMap[questionType] || {
            objectives: [
                `Practice ${questionType
                    .toLowerCase()
                    .replace("_", " ")} skills`,
            ],
            prerequisites: ["Basic number sense", "Counting skills"],
        };

        return {
            learningObjectives: typeMap.objectives,
            prerequisiteSkills: typeMap.prerequisites,
        };
    }
}
