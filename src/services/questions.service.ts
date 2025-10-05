/**
 * Question Generation Service
 *
 * Bridges authentication system with existing core-api question generation
 */

import axios, { AxiosResponse } from "axios";
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

export interface QuestionSession {
    id: string;
    userId: string;
    questions: GeneratedQuestion[];
    answers: any[];
    startedAt: Date;
    completedAt?: Date;
    totalScore: number;
    maxScore: number;
    timeSpentMinutes: number;
    subject: string;
    topic: string;
}

export class QuestionsService {
    private readonly coreApiUrl =
        process.env.CORE_API_URL || "http://localhost:3001";

    /**
     * Generate AI questions using core-api with user context
     *
     * @param request Question generation parameters
     * @param jwtPayload Current authenticated user payload
     * @returns Generated questions with session ID
     */
    async generateQuestions(
        request: QuestionGenerationRequest,
        jwtPayload: JWTPayload
    ): Promise<{
        sessionId: string;
        questions: GeneratedQuestion[];
        estimatedTotalTime: number;
        personalizationSummary: string;
    }> {
        try {
            // Fetch full user data from JWT payload
            const user = await User.findById(jwtPayload.userId);
            if (!user) {
                throw new Error("User not found");
            }
            // Prepare request for core-api with user context
            const coreApiRequest = {
                subject: request.subject,
                grade: user.grade || 5,
                topic: request.topic,
                subtopic: request.subtopic,
                difficulty: request.difficulty,
                format: request.questionType,
                count: request.count,
                context: this.buildPersonalizationContext(
                    request.persona,
                    user
                ),
                curriculum: user.country || "International",
            };

            // Call core-api for question generation
            const response: AxiosResponse = await axios.post(
                `${this.coreApiUrl}/api/v1/content/generate`,
                coreApiRequest,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                    timeout: 30000, // 30 second timeout
                }
            );

            if (!response.data || !response.data.success) {
                throw new Error(
                    response.data?.message || "Question generation failed"
                );
            }

            // Transform core-api response to our format
            const questions = this.transformCoreApiQuestions(
                response.data.data.content || response.data.data,
                request,
                user
            );

            // Generate session ID
            const sessionId = this.generateSessionId();

            // Calculate estimated time
            const estimatedTotalTime = questions.reduce(
                (total, q) => total + q.metadata.estimatedTimeMinutes,
                0
            );

            // Create personalization summary
            const personalizationSummary = this.createPersonalizationSummary(
                request.persona,
                user
            );

            return {
                sessionId,
                questions,
                estimatedTotalTime,
                personalizationSummary,
            };
        } catch (error: any) {
            console.error("Question generation error:", error);
            throw new Error(`Failed to generate questions: ${error.message}`);
        }
    }

    /**
     * Get or create student persona
     *
     * @param userId User ID
     * @returns Student persona
     */
    async getStudentPersona(userId: string): Promise<IStudentPersona | null> {
        try {
            return await StudentPersona.findOne({ userId });
        } catch (error) {
            console.error("Error fetching persona:", error);
            return null;
        }
    }

    /**
     * Update student persona
     *
     * @param userId User ID
     * @param personaData Persona data to update
     * @returns Updated persona
     */
    async updateStudentPersona(
        userId: string,
        personaData: Partial<IStudentPersona>
    ): Promise<IStudentPersona> {
        try {
            const persona = await StudentPersona.findOneAndUpdate(
                { userId },
                { ...personaData, userId },
                {
                    new: true,
                    upsert: true,
                    runValidators: true,
                }
            );

            if (!persona) {
                throw new Error("Failed to create/update persona");
            }

            return persona;
        } catch (error: any) {
            console.error("Error updating persona:", error);
            throw new Error(`Failed to update persona: ${error.message}`);
        }
    }

    /**
     * Build personalization context for AI generation
     *
     * @param persona Student persona
     * @param user User data
     * @returns Personalization context string
     */
    private buildPersonalizationContext(
        persona: IStudentPersona,
        user: IUser
    ): string {
        const contextParts = [
            `Learning style: ${persona.learningStyle.replace("_", " ")}`,
            `Interests: ${persona.interests.join(", ")}`,
            `Cultural context: ${persona.culturalContext}`,
            `Motivational factors: ${persona.motivationalFactors.join(", ")}`,
            `Grade level: ${persona.grade || user.grade || 5}`,
            `Country: ${user.country || "International"}`,
        ];

        return `Personalize questions for a student with the following characteristics: ${contextParts.join(
            "; "
        )}. Create engaging, relevant examples that connect to their interests and cultural background.`;
    }

    /**
     * Transform core-api response to our question format
     *
     * @param coreApiData Response from core-api
     * @param request Original request
     * @param user User data
     * @returns Transformed questions
     */
    private transformCoreApiQuestions(
        coreApiData: any,
        request: QuestionGenerationRequest,
        user: IUser
    ): GeneratedQuestion[] {
        if (!coreApiData) {
            throw new Error("No data received from core-api");
        }

        // Handle different response formats from core-api
        let questionsData = coreApiData;
        if (coreApiData.questions) {
            questionsData = coreApiData.questions;
        } else if (Array.isArray(coreApiData)) {
            questionsData = coreApiData;
        } else if (typeof coreApiData === "string") {
            // Parse if it's a string response
            questionsData = [
                { question: coreApiData, answer: "Generated content" },
            ];
        }

        // Ensure we have an array
        if (!Array.isArray(questionsData)) {
            questionsData = [questionsData];
        }

        return questionsData.map((item: any, index: number) => ({
            id: `q_${Date.now()}_${index}`,
            subject: request.subject,
            topic: request.topic,
            subtopic: request.subtopic,
            difficulty: request.difficulty,
            questionType: request.questionType,
            question:
                item.question ||
                item.content ||
                item.text ||
                `Generated question ${index + 1}`,
            options:
                item.options ||
                this.generateDefaultOptions(request.questionType),
            correctAnswer:
                item.correctAnswer || item.answer || item.solution || "A",
            explanation:
                item.explanation ||
                item.reasoning ||
                "This is the correct answer based on the given information.",
            hints: item.hints || [
                "Think about the key concepts involved",
                "Consider what you know about this topic",
            ],
            personalizationContext: {
                learningStyle: request.persona.learningStyle,
                interests: request.persona.interests,
                culturalReferences: [request.persona.culturalContext],
            },
            metadata: {
                estimatedTimeMinutes: this.estimateQuestionTime(
                    request.questionType
                ),
                gradeLevel: user.grade || 5,
                tags: [request.subject, request.topic, request.difficulty],
                createdAt: new Date(),
            },
        }));
    }

    /**
     * Generate default options for multiple choice questions
     */
    private generateDefaultOptions(questionType: string): string[] | undefined {
        if (questionType === "multiple_choice") {
            return ["Option A", "Option B", "Option C", "Option D"];
        }
        return undefined;
    }

    /**
     * Estimate time needed for question based on type
     */
    private estimateQuestionTime(questionType: string): number {
        const timeMap: Record<string, number> = {
            multiple_choice: 2,
            true_false: 1,
            short_answer: 3,
            problem_solving: 5,
            creative_writing: 8,
            fill_in_blank: 2,
        };
        return timeMap[questionType] || 3;
    }

    /**
     * Generate unique session ID
     */
    private generateSessionId(): string {
        return `session_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
    }

    /**
     * Create personalization summary
     */
    private createPersonalizationSummary(
        persona: IStudentPersona,
        user: IUser
    ): string {
        return `Questions personalized for ${persona.learningStyle.replace(
            "_",
            " "
        )} learner with interests in ${persona.interests
            .slice(0, 3)
            .join(", ")} and ${
            persona.motivationalFactors.length > 0
                ? persona.motivationalFactors[0].toLowerCase() + " motivation"
                : "general motivation"
        }.`;
    }
}
