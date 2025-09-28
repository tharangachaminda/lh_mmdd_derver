import { IEducationalAgent, AgentContext } from "./base-agent.interface.js";
import { QuestionType, DifficultyLevel } from "../models/question.js";

/**
 * Context Enhancer Agent
 *
 * Responsible for:
 * - Adding real-world context and story problems
 * - Making abstract math concepts relatable for children
 * - Adding engaging scenarios appropriate for grade level
 * - Ensuring cultural sensitivity and inclusivity
 */
export class ContextEnhancerAgent implements IEducationalAgent {
    public readonly name = "ContextEnhancerAgent";
    public readonly description =
        "Enhances questions with engaging, age-appropriate real-world context";

    /**
     * Process context enhancement for the given context
     *
     * @param context - Current workflow context
     * @returns Updated context with enhanced questions
     */
    async process(context: AgentContext): Promise<AgentContext> {
        try {
            context.workflow.currentStep = this.name;

            if (!context.questions || context.questions.length === 0) {
                context.workflow.warnings.push("No questions to enhance");
                return context;
            }

            context.enhancedQuestions = [];

            for (let i = 0; i < context.questions.length; i++) {
                const question = context.questions[i];
                const enhancement = await this.enhanceQuestion(
                    question,
                    context.questionType,
                    context.grade,
                    context.difficulty
                );

                context.enhancedQuestions.push(enhancement);
            }

            return context;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            context.workflow.errors.push(`ContextEnhancer: ${errorMessage}`);
            return context;
        }
    }

    /**
     * Enhance a single question with real-world context
     *
     * @param question - Question to enhance
     * @param questionType - Type of question
     * @param grade - Target grade level
     * @param difficulty - Difficulty level
     * @returns Enhanced question data
     */
    private async enhanceQuestion(
        question: {
            text: string;
            answer: number;
            explanation?: string;
        },
        questionType: QuestionType,
        grade: number,
        difficulty: DifficultyLevel
    ): Promise<{
        originalText: string;
        enhancedText: string;
        contextType: "real-world" | "story" | "visual" | "none";
        engagementScore: number;
    }> {
        // Determine if question needs enhancement
        const needsEnhancement = this.shouldEnhanceQuestion(
            question.text,
            questionType
        );

        if (!needsEnhancement) {
            return {
                originalText: question.text,
                enhancedText: question.text,
                contextType: "none",
                engagementScore: 0.5,
            };
        }

        // Select appropriate context type
        const contextType = this.selectContextType(questionType, grade);

        // Generate enhanced version
        const enhancedText = this.generateEnhancedQuestion(
            question,
            questionType,
            grade,
            contextType
        );

        // Calculate engagement score
        const engagementScore = this.calculateEngagementScore(
            question.text,
            enhancedText,
            grade
        );

        return {
            originalText: question.text,
            enhancedText: enhancedText,
            contextType: contextType,
            engagementScore: engagementScore,
        };
    }

    /**
     * Determine if a question should be enhanced with context
     *
     * @param questionText - Original question text
     * @param questionType - Type of question
     * @returns Whether question needs enhancement
     */
    private shouldEnhanceQuestion(
        questionText: string,
        questionType: QuestionType
    ): boolean {
        // Don't enhance if already has story context
        const storyIndicators = [
            "has",
            "have",
            "bought",
            "sold",
            "gave",
            "shared",
            "collected",
            "apples",
            "toys",
            "books",
            "cookies",
            "students",
            "friends",
        ];

        const hasStoryContext = storyIndicators.some((indicator) =>
            questionText.toLowerCase().includes(indicator)
        );

        if (hasStoryContext) {
            return false;
        }

        // Enhanced certain question types more than others
        const enhancementPriority = {
            [QuestionType.ADDITION]: 0.8,
            [QuestionType.SUBTRACTION]: 0.8,
            [QuestionType.MULTIPLICATION]: 0.7,
            [QuestionType.DIVISION]: 0.7,
            [QuestionType.FRACTION_ADDITION]: 0.6,
            [QuestionType.DECIMAL_ADDITION]: 0.5,
        } as Record<string, number>;

        const priority = enhancementPriority[questionType] || 0.3;
        return Math.random() < priority;
    }

    /**
     * Select appropriate context type for question enhancement
     *
     * @param questionType - Type of question
     * @param grade - Target grade level
     * @returns Context type to use
     */
    private selectContextType(
        questionType: QuestionType,
        grade: number
    ): "real-world" | "story" | "visual" | "none" {
        // Younger grades prefer story contexts
        if (grade <= 2) {
            return Math.random() < 0.7 ? "story" : "real-world";
        }

        // Middle grades mix story and real-world
        if (grade <= 4) {
            return Math.random() < 0.5 ? "story" : "real-world";
        }

        // Older grades prefer real-world applications
        return Math.random() < 0.8 ? "real-world" : "story";
    }

    /**
     * Generate enhanced question with selected context type
     *
     * @param question - Original question
     * @param questionType - Type of question
     * @param grade - Target grade level
     * @param contextType - Type of context to add
     * @returns Enhanced question text
     */
    private generateEnhancedQuestion(
        question: {
            text: string;
            answer: number;
            explanation?: string;
        },
        questionType: QuestionType,
        grade: number,
        contextType: "real-world" | "story" | "visual" | "none"
    ): string {
        // Extract numbers from original question
        const numbers = this.extractNumbers(question.text);

        if (numbers.length < 2) {
            return question.text; // Can't enhance without sufficient numbers
        }

        // Generate context-specific scenarios
        switch (contextType) {
            case "story":
                return this.generateStoryContext(
                    question,
                    questionType,
                    grade,
                    numbers
                );
            case "real-world":
                return this.generateRealWorldContext(
                    question,
                    questionType,
                    grade,
                    numbers
                );
            case "visual":
                return this.generateVisualContext(
                    question,
                    questionType,
                    grade,
                    numbers
                );
            default:
                return question.text;
        }
    }

    /**
     * Generate story-based context for question
     *
     * @param question - Original question
     * @param questionType - Type of question
     * @param grade - Target grade level
     * @param numbers - Numbers extracted from question
     * @returns Story-enhanced question
     */
    private generateStoryContext(
        question: { text: string; answer: number },
        questionType: QuestionType,
        grade: number,
        numbers: number[]
    ): string {
        const characters = ["Emma", "Alex", "Maya", "Sam", "Zoe", "Jake"];
        const character =
            characters[Math.floor(Math.random() * characters.length)];

        const [a, b] = numbers;

        switch (questionType) {
            case QuestionType.ADDITION:
                const items = [
                    "stickers",
                    "marbles",
                    "toy cars",
                    "crayons",
                    "cookies",
                ][Math.floor(Math.random() * 5)];
                return `${character} has ${a} ${items}. Their friend gives them ${b} more ${items}. How many ${items} does ${character} have now?`;

            case QuestionType.SUBTRACTION:
                const things = [
                    "balloons",
                    "candies",
                    "pencils",
                    "erasers",
                    "stamps",
                ][Math.floor(Math.random() * 5)];
                return `${character} had ${a} ${things}. They gave away ${b} ${things} to their friends. How many ${things} does ${character} have left?`;

            case QuestionType.MULTIPLICATION:
                const groups = ["bags", "boxes", "groups", "packs", "sets"][
                    Math.floor(Math.random() * 5)
                ];
                const objects = [
                    "apples",
                    "books",
                    "toys",
                    "cards",
                    "stickers",
                ][Math.floor(Math.random() * 5)];
                return `${character} has ${a} ${groups}. Each ${groups.slice(
                    0,
                    -1
                )} contains ${b} ${objects}. How many ${objects} does ${character} have in total?`;

            case QuestionType.DIVISION:
                const containers = [
                    "boxes",
                    "bags",
                    "baskets",
                    "plates",
                    "groups",
                ][Math.floor(Math.random() * 5)];
                const items2 = [
                    "cookies",
                    "candies",
                    "toys",
                    "cards",
                    "stickers",
                ][Math.floor(Math.random() * 5)];
                return `${character} has ${a} ${items2} to share equally among ${b} ${containers}. How many ${items2} will be in each ${containers.slice(
                    0,
                    -1
                )}?`;

            default:
                return question.text;
        }
    }

    /**
     * Generate real-world context for question
     *
     * @param question - Original question
     * @param questionType - Type of question
     * @param grade - Target grade level
     * @param numbers - Numbers extracted from question
     * @returns Real-world enhanced question
     */
    private generateRealWorldContext(
        question: { text: string; answer: number },
        questionType: QuestionType,
        grade: number,
        numbers: number[]
    ): string {
        const [a, b] = numbers;

        switch (questionType) {
            case QuestionType.ADDITION:
                const scenarios = [
                    `A school library has ${a} fiction books and ${b} non-fiction books. How many books are there in total?`,
                    `In a parking lot, there are ${a} red cars and ${b} blue cars. How many cars are there altogether?`,
                    `A baker made ${a} muffins in the morning and ${b} muffins in the afternoon. How many muffins did the baker make in total?`,
                ];
                return scenarios[Math.floor(Math.random() * scenarios.length)];

            case QuestionType.SUBTRACTION:
                const situations = [
                    `A store had ${a} bottles of juice. They sold ${b} bottles today. How many bottles of juice are left?`,
                    `There were ${a} students in the cafeteria. ${b} students finished eating and left. How many students are still in the cafeteria?`,
                    `A farmer had ${a} chickens. ${b} chickens were sold at the market. How many chickens does the farmer have now?`,
                ];
                return situations[
                    Math.floor(Math.random() * situations.length)
                ];

            case QuestionType.MULTIPLICATION:
                const contexts = [
                    `A classroom has ${a} rows of desks. Each row has ${b} desks. How many desks are there in the classroom?`,
                    `A garden has ${a} flower beds. Each flower bed has ${b} flowers. How many flowers are there in total?`,
                    `A pizza restaurant serves ${a} tables. Each table seats ${b} people. How many people can the restaurant serve?`,
                ];
                return contexts[Math.floor(Math.random() * contexts.length)];

            case QuestionType.DIVISION:
                const examples = [
                    `A teacher has ${a} stickers to distribute equally among ${b} students. How many stickers will each student receive?`,
                    `${a} apples need to be packed into ${b} equal groups. How many apples will be in each group?`,
                    `A pizza is cut into ${a} slices to be shared equally among ${b} friends. How many slices will each friend get?`,
                ];
                return examples[Math.floor(Math.random() * examples.length)];

            default:
                return question.text;
        }
    }

    /**
     * Generate visual context for question
     *
     * @param question - Original question
     * @param questionType - Type of question
     * @param grade - Target grade level
     * @param numbers - Numbers extracted from question
     * @returns Visual-enhanced question
     */
    private generateVisualContext(
        question: { text: string; answer: number },
        questionType: QuestionType,
        grade: number,
        numbers: number[]
    ): string {
        // For now, return original question with visual instruction
        // In a full implementation, this would generate visual descriptions
        return `Look at the picture and solve: ${question.text}`;
    }

    /**
     * Calculate engagement score for enhanced question
     *
     * @param originalText - Original question text
     * @param enhancedText - Enhanced question text
     * @param grade - Target grade level
     * @returns Engagement score (0-1)
     */
    private calculateEngagementScore(
        originalText: string,
        enhancedText: string,
        grade: number
    ): number {
        let score = 0.5; // Base score

        // More engaging if text is longer (has context)
        if (enhancedText.length > originalText.length * 1.5) {
            score += 0.2;
        }

        // More engaging if it has character names
        const hasCharacters = /\b[A-Z][a-z]+\b/.test(enhancedText);
        if (hasCharacters) {
            score += 0.2;
        }

        // More engaging if it has relatable objects
        const relatableWords = [
            "cookies",
            "toys",
            "books",
            "friends",
            "students",
            "school",
            "playground",
            "games",
            "pets",
            "family",
            "home",
            "park",
        ];
        const hasRelatableContent = relatableWords.some((word) =>
            enhancedText.toLowerCase().includes(word)
        );
        if (hasRelatableContent) {
            score += 0.2;
        }

        // Age-appropriate engagement
        if (grade <= 3 && enhancedText.includes("story")) {
            score += 0.1;
        }

        return Math.min(1.0, score);
    }

    /**
     * Extract numbers from text
     *
     * @param text - Text to extract numbers from
     * @returns Array of numbers found in text
     */
    private extractNumbers(text: string): number[] {
        const numberRegex = /\b\d+(?:\.\d+)?\b/g;
        const matches = text.match(numberRegex);
        return matches ? matches.map(Number) : [];
    }
}
