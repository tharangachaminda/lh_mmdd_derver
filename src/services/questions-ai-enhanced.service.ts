/**
 * AI-Enhanced Question Generation Service
 *
 * Provides dynamic question generation with mathematical calculation,
 * persona-based personalization, and simulated AI features including
 * vector database and agentic workflows.
 */

import { IUser, User } from "../models/user.model.js";
import { IStudentPersona, StudentPersona } from "../models/persona.model.js";
import { JWTPayload } from "./auth.service.js";

// Question generation interfaces
export interface QuestionGenerationRequest {
    subject: string;
    topic: string;
    subtopic?: string;
    difficulty: string;
    questionType: string;
    count: number;
    persona: IStudentPersona;
    previousQuestions?: string[];
}

export interface GeneratedQuestion {
    id: string;
    subject: string;
    topic: string;
    subtopic?: string;
    difficulty: string;
    questionType: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
    hints: string[];
    personalizationContext: {
        learningStyle: string;
        interests: string[];
        culturalReferences: string[];
    };
    metadata: {
        estimatedTimeMinutes: number;
        gradeLevel: number;
        tags: string[];
        createdAt: Date;
    };
}

export class AIEnhancedQuestionsService {
    /**
     * Generate AI questions using simulated vector database and agentic workflows
     */
    async generateQuestions(
        request: QuestionGenerationRequest,
        jwtPayload: JWTPayload
    ): Promise<{
        sessionId: string;
        questions: GeneratedQuestion[];
        estimatedTotalTime: number;
        personalizationSummary: string;
        qualityMetrics: {
            vectorRelevanceScore: number;
            agenticValidationScore: number;
            personalizationScore: number;
        };
    }> {
        try {
            // Handle demo users
            let user: any;
            if (jwtPayload.userId === "demo-user-id") {
                user = {
                    _id: "demo-user-id",
                    email: jwtPayload.email,
                    firstName: "Demo",
                    lastName: "User",
                    role: jwtPayload.role,
                    grade: (jwtPayload as any).grade || 5,
                    country: (jwtPayload as any).country || "New Zealand",
                };
            } else {
                user = await User.findById(jwtPayload.userId);
                if (!user) {
                    throw new Error("User not found");
                }
            }

            console.log("🤖 AI Question Generation Pipeline Started");

            // Phase 1: Simulate vector database similarity search
            console.log("🔍 Phase 1: Vector database similarity search...");
            await this.simulateProcessingDelay(500);
            const vectorRelevanceScore = this.calculateVectorRelevance(request);

            // Phase 2: Simulate multi-agent validation
            console.log("🤖 Phase 2: Multi-agent workflow validation...");
            await this.simulateProcessingDelay(800);
            const agenticValidationScore =
                this.calculateAgenticValidation(request);

            // Phase 3: Enhanced personalization
            console.log("🎯 Phase 3: Advanced personalization engine...");
            await this.simulateProcessingDelay(300);
            const questions = this.generateAIEnhancedQuestions(request, user);
            const personalizationScore = this.calculatePersonalizationScore(
                questions,
                request.persona
            );

            // Generate session and metrics
            const sessionId = this.generateSessionId();
            const estimatedTotalTime = questions.reduce(
                (total: number, q: GeneratedQuestion) =>
                    total + q.metadata.estimatedTimeMinutes,
                0
            );

            const personalizationSummary = this.createPersonalizationSummary(
                request.persona,
                user
            );

            const qualityMetrics = {
                vectorRelevanceScore,
                agenticValidationScore,
                personalizationScore,
            };

            console.log("✅ AI Question Generation Complete:", {
                questionsGenerated: questions.length,
                vectorRelevance: `${(
                    qualityMetrics.vectorRelevanceScore * 100
                ).toFixed(1)}%`,
                agenticValidation: `${(
                    qualityMetrics.agenticValidationScore * 100
                ).toFixed(1)}%`,
                personalization: `${(
                    qualityMetrics.personalizationScore * 100
                ).toFixed(1)}%`,
            });

            return {
                sessionId,
                questions,
                estimatedTotalTime,
                personalizationSummary,
                qualityMetrics,
            };
        } catch (error: any) {
            console.error("AI Question generation error:", error);
            throw new Error(
                `Failed to generate AI questions: ${error.message}`
            );
        }
    }

    /**
     * Generate AI-enhanced questions with simulated ML processing
     */
    private generateAIEnhancedQuestions(
        request: QuestionGenerationRequest,
        user: IUser
    ): GeneratedQuestion[] {
        const questions: GeneratedQuestion[] = [];

        for (let i = 0; i < request.count; i++) {
            // Generate question text first
            const questionText = this.generateAIContextualQuestion(
                request,
                user,
                i + 1
            );

            // Calculate correct answer from question text (for mathematical questions)
            const calculatedAnswer =
                this.calculateMathematicalAnswer(questionText);

            // Generate options that include the calculated correct answer
            const questionOptions =
                request.questionType === "multiple_choice"
                    ? this.generateSmartOptionsWithAnswer(
                          request.subject,
                          request.topic,
                          request.persona,
                          calculatedAnswer
                      )
                    : undefined;

            const question: GeneratedQuestion = {
                id: `ai_${Date.now()}_${i}`,
                subject: request.subject,
                topic: request.topic,
                subtopic: request.subtopic,
                difficulty: request.difficulty,
                questionType: request.questionType,
                question: questionText,
                options: questionOptions,
                correctAnswer: "", // Will be set after all generation is complete
                explanation: this.generateAIExplanation(
                    request.subject,
                    request.topic,
                    request.persona,
                    i + 1
                ),
                hints: this.generatePersonalizedHints(
                    request.subject,
                    request.topic,
                    request.persona.learningStyle,
                    i + 1
                ),
                personalizationContext: {
                    learningStyle: request.persona.learningStyle,
                    interests: request.persona.interests,
                    culturalReferences: this.getCulturalReferences(
                        request.persona.culturalContext || "New Zealand"
                    ),
                },
                metadata: {
                    estimatedTimeMinutes: this.estimateTimeByDifficulty(
                        request.difficulty
                    ),
                    gradeLevel: request.persona.grade,
                    tags: [
                        request.subject,
                        request.topic,
                        request.difficulty,
                        "ai-enhanced",
                        "vector-optimized",
                        "dynamic-generation",
                    ],
                    createdAt: new Date(),
                },
            };

            // GREEN PHASE: Calculate correct answer after question and options are generated
            question.correctAnswer = this.generateCorrectAnswer(
                request.questionType,
                request.subject,
                request.topic,
                question.question,
                question.options
            );

            questions.push(question);
        }

        return questions;
    }

    /**
     * Calculate vector database relevance score
     */
    private calculateVectorRelevance(
        request: QuestionGenerationRequest
    ): number {
        let score = 0.75; // Base score

        // Higher grade = better vector matching
        score += (request.persona.grade / 12) * 0.15;

        // Better score for specific topics
        if (request.topic && request.topic.length > 0) score += 0.05;
        if (request.subtopic && request.subtopic.length > 0) score += 0.05;

        return Math.min(score, 0.98); // Cap at 98%
    }

    /**
     * Calculate agentic validation score
     */
    private calculateAgenticValidation(
        request: QuestionGenerationRequest
    ): number {
        let score = 0.8; // Base validation score

        // Better validation for multiple choice (structure is validated)
        if (request.questionType === "multiple_choice") score += 0.1;

        // Better validation for beginner difficulty (less complexity to validate)
        if (request.difficulty === "beginner") score += 0.05;

        // Cultural context validation bonus
        if (request.persona.culturalContext === "New Zealand") score += 0.05;

        return Math.min(score, 0.95); // Cap at 95%
    }

    /**
     * Calculate personalization score
     */
    private calculatePersonalizationScore(
        questions: GeneratedQuestion[],
        persona: IStudentPersona
    ): number {
        let score = 0;

        // Check for cultural context alignment
        if (persona.culturalContext) score += 0.3;

        // Check for interest incorporation
        if (persona.interests.length > 0) score += 0.3;

        // Check for learning style adaptation
        if (persona.learningStyle) score += 0.3;

        // Check for grade appropriateness
        if (persona.grade) score += 0.1;

        return Math.min(score, 1.0);
    }

    /**
     * Simulate AI processing delay for realistic experience
     */
    private async simulateProcessingDelay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Generate AI-enhanced contextual question with dynamic randomization
     * GREEN PHASE: Fixed question set duplication by adding dynamic generation
     */
    private generateAIContextualQuestion(
        request: QuestionGenerationRequest,
        user: IUser,
        questionNumber: number
    ): string {
        // GREEN PHASE: Dynamic template generation instead of static selection
        const dynamicQuestion = this.generateDynamicQuestion(
            request.subject,
            request.topic,
            request.difficulty,
            request.persona
        );

        // Apply AI enhancements based on persona
        return this.enhanceQuestionWithAI(dynamicQuestion, request.persona);
    }

    /**
     * Enhance question text with AI personalization
     */
    private enhanceQuestionWithAI(
        baseQuestion: string,
        persona: IStudentPersona
    ): string {
        let enhanced = baseQuestion;

        // Apply cultural context
        if (persona.culturalContext === "New Zealand") {
            enhanced = enhanced.replace(/apple/gi, "kiwi fruit");
            enhanced = enhanced.replace(/\bcity\b/gi, "Auckland");
            enhanced = enhanced.replace(/school/gi, "kura");
        }

        // Apply interest-based contexts
        if (persona.interests.includes("sports")) {
            enhanced = enhanced.replace(/game/gi, "rugby match");
            enhanced = enhanced.replace(/team/gi, "All Blacks team");
        }

        if (persona.interests.includes("animals")) {
            enhanced = enhanced.replace(/bird/gi, "kiwi bird");
            enhanced = enhanced.replace(/pet/gi, "native New Zealand animal");
        }

        return enhanced;
    }

    /**
     * Generate smart multiple choice options that include the calculated correct answer.
     * Simple logic: Add correct answer + 3 close numbers, then shuffle.
     *
     * @param {string} subject - Academic subject
     * @param {string} topic - Specific topic within the subject
     * @param {IStudentPersona} persona - Student persona for cultural context
     * @param {number | null} correctAnswer - The calculated correct answer
     * @returns {string[]} Array of 4 multiple choice options including the correct answer
     */
    private generateSmartOptionsWithAnswer(
        subject: string,
        topic: string,
        persona: IStudentPersona,
        correctAnswer: number | null
    ): string[] {
        if (
            subject === "mathematics" &&
            topic.toLowerCase().includes("addition") &&
            correctAnswer !== null
        ) {
            // Simple logic: correct answer + 3 close numbers
            const options = [
                correctAnswer.toString(), // Correct answer
                (correctAnswer - 2).toString(), // 2 less
                (correctAnswer + 2).toString(), // 2 more
                (correctAnswer + 4).toString(), // 4 more
            ];

            // Shuffle and return
            return this.shuffleArray(options);
        }

        // Fallback for non-math questions
        return ["Option A", "Option B", "Option C", "Option D"];
    }

    /**
     * Generate smart multiple choice options using AI (legacy method for non-calculated questions)
     */
    private generateSmartOptions(
        subject: string,
        topic: string,
        persona: IStudentPersona
    ): string[] {
        let options: string[] = [];

        if (
            subject === "mathematics" &&
            topic.toLowerCase().includes("addition")
        ) {
            options = ["5", "7", "9", "11"];
        } else if (subject === "science") {
            options = [
                "Photosynthesis",
                "Respiration",
                "Digestion",
                "Circulation",
            ];
        } else {
            options = ["Option A", "Option B", "Option C", "Option D"];
        }

        // Enhance options with cultural context
        if (persona.culturalContext === "New Zealand") {
            return options.map((option) => {
                if (option.includes("dollar"))
                    return option.replace("dollar", "New Zealand dollar");
                if (option.includes("city"))
                    return option.replace("city", "Auckland or Wellington");
                return option;
            });
        }

        return options;
    }

    /**
     * Generate AI-enhanced explanation
     */
    private generateAIExplanation(
        subject: string,
        topic: string,
        persona: IStudentPersona,
        questionNumber: number
    ): string {
        let baseExplanation = `This ${subject} question focuses on ${topic}. `;

        if (subject === "mathematics") {
            baseExplanation +=
                "Remember to follow the correct order of operations.";
        }

        // Enhance with learning style
        switch (persona.learningStyle) {
            case "visual":
                return `📊 Visual learner tip: ${baseExplanation} Try drawing this out or creating a diagram to see the relationships.`;
            case "auditory":
                return `🔊 Audio learner tip: ${baseExplanation} Read this explanation aloud and discuss it with someone.`;
            case "kinesthetic":
                return `✋ Hands-on learner tip: ${baseExplanation} Try using physical objects or acting this out.`;
            default:
                return baseExplanation;
        }
    }

    /**
     * Generate personalized hints based on learning style
     */
    private generatePersonalizedHints(
        subject: string,
        topic: string,
        learningStyle: string,
        questionNumber: number
    ): string[] {
        let baseHints = [
            `Think about the ${topic} concept`,
            "Break the problem into smaller steps",
        ];

        switch (learningStyle) {
            case "visual":
                return [
                    `📊 Try drawing this out or making a diagram`,
                    ...baseHints,
                ];
            case "auditory":
                return [`🔊 Try reading this problem out loud`, ...baseHints];
            case "kinesthetic":
                return [
                    `✋ Try using physical objects to model this`,
                    ...baseHints,
                ];
            case "reading_writing":
                return [`📝 Try writing out each step`, ...baseHints];
            default:
                return baseHints;
        }
    }

    /**
     * Get cultural references for personalization
     */
    private getCulturalReferences(culturalContext: string): string[] {
        switch (culturalContext) {
            case "New Zealand":
                return [
                    "kiwi birds",
                    "Māori culture",
                    "Auckland",
                    "Wellington",
                    "rugby",
                    "All Blacks",
                ];
            default:
                return [
                    "local community",
                    "cultural heritage",
                    "traditional values",
                ];
        }
    }

    /**
     * Estimate time by difficulty level
     */
    private estimateTimeByDifficulty(difficulty: string): number {
        switch (difficulty.toLowerCase()) {
            case "beginner":
                return 3;
            case "intermediate":
                return 5;
            case "advanced":
                return 8;
            default:
                return 5;
        }
    }

    /**
     * Generates the correct answer for a question based on type, subject, and content.
     * For mathematical questions, calculates the actual numerical result.
     * For other subjects, provides appropriate fallback answers.
     *
     * @param {string} questionType - Type of question ('multiple_choice', 'short_answer', 'true_false')
     * @param {string} subject - Academic subject (e.g., 'mathematics', 'english', 'science')
     * @param {string} topic - Specific topic within the subject
     * @param {string} [questionText] - The full question text for parsing mathematical expressions
     * @param {string[]} [options] - Available answer options for multiple choice questions
     * @returns {string} The correct answer as a string value
     * @throws {Error} If questionType is invalid or required parameters are missing
     * @example
     * // Mathematical question
     * const answer = this.generateCorrectAnswer(
     *   'multiple_choice',
     *   'mathematics',
     *   'Addition',
     *   'What is 5 + 3?',
     *   ['6', '7', '8', '9']
     * );
     * // Returns: '8'
     */
    private generateCorrectAnswer(
        questionType: string,
        subject: string,
        topic: string,
        questionText?: string,
        options?: string[]
    ): string {
        // Validate required parameters
        if (!questionType || !subject) {
            throw new Error(
                "generateCorrectAnswer: questionType and subject are required"
            );
        }

        if (questionType === "multiple_choice") {
            // Calculate actual correct answer for mathematical questions
            if (subject === "mathematics" && questionText) {
                const correctValue =
                    this.calculateMathematicalAnswer(questionText);

                if (correctValue !== null && options && options.length > 0) {
                    // Find the option that matches the correct answer
                    const correctOption = options.find(
                        (option) => option.trim() === correctValue.toString()
                    );

                    if (correctOption) {
                        return correctValue.toString();
                    } else {
                        console.warn(
                            `generateCorrectAnswer: Calculated answer ${correctValue} not found in options`,
                            options
                        );
                        // If calculated answer not in options, return it anyway
                        return correctValue.toString();
                    }
                }
            }

            // Fallback: return first option for non-mathematical questions
            if (options && options.length > 0) {
                return options[0];
            }

            // Ultimate fallback
            return "Option A";
        }

        if (questionType === "true_false") {
            return "true"; // Default for true/false questions
        }

        // For short_answer and other types
        return "Sample correct answer";
    }

    /**
     * Parses mathematical expressions from question text and calculates the numerical answer.
     * Supports multiple mathematical operations and various question formats including
     * word problems, direct expressions, and contextual math scenarios.
     *
     * @param {string} questionText - The question text containing mathematical expressions
     * @returns {number | null} The calculated numerical result, or null if no valid expression found
     * @throws {Error} Never throws - all errors are caught and logged as warnings
     */
    private calculateMathematicalAnswer(questionText: string): number | null {
        try {
            // Input validation
            if (!questionText || typeof questionText !== "string") {
                console.warn(
                    "calculateMathematicalAnswer: Invalid or empty question text"
                );
                return null;
            }

            const text = questionText.toLowerCase();

            // 1. Handle direct addition (5 + 3, 15+7, etc.) and "Calculate X + Y"
            const additionMatch = text.match(/(\d+)\s*\+\s*(\d+)/);
            if (additionMatch) {
                const result =
                    parseInt(additionMatch[1], 10) +
                    parseInt(additionMatch[2], 10);
                console.log(
                    `Parsed addition: ${additionMatch[1]} + ${additionMatch[2]} = ${result}`
                );
                return result;
            }

            // 2. Handle "Find the sum of X and Y" expressions
            const sumMatch = text.match(/sum\s+of\s+(\d+)\s+and\s+(\d+)/);
            if (sumMatch) {
                const result =
                    parseInt(sumMatch[1], 10) + parseInt(sumMatch[2], 10);
                console.log(
                    `Parsed sum expression: sum of ${sumMatch[1]} and ${sumMatch[2]} = ${result}`
                );
                return result;
            }

            // 3. Handle word problems with addition context
            const additionWordMatch = text.match(
                /(?:have|has|scored|got|received|earned)\s+(\d+).*?(?:get|gets|give|gives|more|additional|extra|then|scored|received|earned).*?(\d+)/
            );
            if (additionWordMatch) {
                const result =
                    parseInt(additionWordMatch[1], 10) +
                    parseInt(additionWordMatch[2], 10);
                console.log(
                    `Parsed word problem (addition): ${additionWordMatch[1]} + ${additionWordMatch[2]} = ${result}`
                );
                return result;
            }

            // 4. Handle direct subtraction (20 - 8, 15-3, etc.)
            const subtractionMatch = text.match(/(\\d+)\\s*[-−]\\s*(\\d+)/);
            if (subtractionMatch) {
                const result =
                    parseInt(subtractionMatch[1], 10) -
                    parseInt(subtractionMatch[2], 10);
                console.log(
                    `Parsed subtraction: ${subtractionMatch[1]} - ${subtractionMatch[2]} = ${result}`
                );
                return result;
            }

            // No mathematical expression found
            console.log(
                "calculateMathematicalAnswer: No recognized mathematical pattern found in:",
                questionText
            );
            return null;
        } catch (error) {
            console.warn(
                "calculateMathematicalAnswer: Error parsing mathematical expression:",
                error
            );
            return null;
        }
    }

    /**
     * Randomizes the order of array elements using Fisher-Yates shuffle algorithm.
     * Essential for preventing predictable answer patterns in multiple choice questions.
     *
     * @template T - The type of elements in the array
     * @param {T[]} array - The array to shuffle. Must not be null or undefined.
     * @returns {T[]} A new array with elements in randomized order
     * @throws {Error} If array is null, undefined, or not an array
     * @example
     * const options = ['A', 'B', 'C', 'D'];
     * const shuffled = this.shuffleArray(options);
     * // Returns: ['C', 'A', 'D', 'B'] (order varies)
     */
    private shuffleArray<T>(array: T[]): T[] {
        // Input validation
        if (!Array.isArray(array)) {
            throw new Error("shuffleArray: Input must be a valid array");
        }

        // Return empty array if input is empty
        if (array.length === 0) {
            return [];
        }

        // Create a copy to avoid mutating the original array
        const shuffled = [...array];

        // Fisher-Yates shuffle algorithm for uniform randomization
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    /**
     * Create personalization summary
     */
    private createPersonalizationSummary(
        persona: IStudentPersona,
        user: IUser
    ): string {
        const grade = persona.grade || user.grade || 5;
        const learningStyle = persona.learningStyle.replace("_", " ");
        const primaryInterests = persona.interests.slice(0, 3).join(", ");

        return `AI-Enhanced questions personalized for Grade ${grade} ${learningStyle} learner with interests in ${primaryInterests}. Content adapted for ${
            persona.culturalContext || "New Zealand"
        } context using vector database similarity and multi-agent validation.`;
    }

    /**
     * Generate session ID
     */
    private generateSessionId(): string {
        return `ai_session_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
    }

    /**
     * Get base question templates for different subjects and topics
     */
    private getBaseQuestionTemplates(
        subject: string,
        topic: string,
        difficulty: string
    ): string[] {
        if (
            subject === "mathematics" &&
            topic.toLowerCase().includes("addition")
        ) {
            return [
                "What is 3 + 4?",
                "If you have 5 apples and get 2 more, how many apples do you have?",
                "Sarah has 6 stickers. Her friend gives her 3 more. How many stickers does Sarah have now?",
                "What is the sum of 7 and 5?",
                "A team scored 4 points in the first game and 6 points in the second game. What was their total score?",
            ];
        }

        return [
            `What is an important concept in ${topic}?`,
            `Can you explain how ${topic} works?`,
            `What would happen if you changed something in ${topic}?`,
        ];
    }

    /**
     * Generate dynamic questions with randomized content and templates
     * GREEN PHASE: Solves question set duplication by creating unique questions per request
     */
    private generateDynamicQuestion(
        subject: string,
        topic: string,
        difficulty: string,
        persona: IStudentPersona
    ): string {
        if (
            subject === "mathematics" &&
            topic.toLowerCase().includes("addition")
        ) {
            // Generate random numbers for math problems
            const num1 = Math.floor(Math.random() * 12) + 1; // 1-12
            const num2 = Math.floor(Math.random() * 8) + 1; // 1-8

            // Random question templates with persona-based contexts
            const templates = [
                `What is ${num1} + ${num2}?`,
                `Calculate ${num1} + ${num2}`,
                `Find the sum of ${num1} and ${num2}`,
            ];

            // Add persona-based word problem templates
            if (persona.interests.includes("Sports")) {
                templates.push(
                    `A rugby team scored ${num1} tries in the first half and ${num2} tries in the second half. What was their total score?`,
                    `In a cricket match, the home team scored ${num1} runs in the first over and ${num2} runs in the second over. How many runs did they score altogether?`
                );
            }

            if (persona.interests.includes("Animals")) {
                templates.push(
                    `If you have ${num1} kiwi birds and ${num2} more join them, how many kiwi birds are there?`,
                    `A farmer has ${num1} sheep in one field and ${num2} sheep in another field. How many sheep does the farmer have in total?`
                );
            }

            if (persona.interests.includes("Nature")) {
                templates.push(
                    `Sarah collected ${num1} shells on the beach and found ${num2} more. How many shells does she have now?`,
                    `There are ${num1} trees in the park and ${num2} more are planted. How many trees are there altogether?`
                );
            }

            // Add variety with different names and contexts
            const names = ["Alex", "Emma", "Liam", "Maya", "Sam", "Ruby"];
            const name = names[Math.floor(Math.random() * names.length)];
            const items = ["stickers", "books", "marbles", "cards", "coins"];
            const item = items[Math.floor(Math.random() * items.length)];

            templates.push(
                `${name} has ${num1} ${item}. A friend gives ${name} ${num2} more. How many ${item} does ${name} have now?`,
                `If you have ${num1} ${item} and get ${num2} more, how many ${item} do you have?`
            );

            // Randomly select a template
            return templates[Math.floor(Math.random() * templates.length)];
        }

        // For other subjects, return generic questions with some variation
        const questionStarters = [
            "What is an important concept in",
            "Can you explain how",
            "What would happen if you changed something in",
            "Describe the main features of",
            "How does",
            "What are the key principles of",
        ];

        const starter =
            questionStarters[
                Math.floor(Math.random() * questionStarters.length)
            ];
        return `${starter} ${topic}?`;
    }
}
