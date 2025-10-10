/**
 * Answer Submission Result Model
 *
 * Stores student answer submissions and AI validation results in MongoDB.
 * Tracks individual question performance, overall scores, feedback, and
 * learning analytics for student progress monitoring.
 *
 * @module models/answer-submission
 */

import mongoose, { Document, Schema } from "mongoose";

/**
 * Individual question result within an answer submission.
 * Contains student answer, AI validation score, feedback, and expected answer.
 */
export interface IQuestionResult {
    /** Unique identifier for the question */
    id: string;
    /** The full question text presented to student */
    questionText: string;
    /** Question type identifier (e.g., 'ADDITION', 'SUBTRACTION') */
    questionType: string;
    /** Difficulty level ('easy', 'medium', 'hard') */
    difficulty: string;
    /** Student's submitted answer */
    studentAnswer: string;
    /** AI-assigned score for this question (0-10) */
    score: number;
    /** Maximum possible score for this question */
    maxScore: number;
    /** Binary correctness flag (score >= 7 typically means correct) */
    isCorrect: boolean;
    /** Expected/ideal answer as determined by AI */
    expectedAnswer: string;
    /** Detailed feedback from AI validator */
    feedback: string;
    /** Explanation for partial credit, if applicable */
    partialCreditReason?: string;
}

/**
 * Complete answer submission result document stored in MongoDB.
 *
 * Represents a student's completed question session with AI validation,
 * scoring, feedback, and learning analytics. Used for progress tracking,
 * performance analytics, and personalized learning recommendations.
 *
 * @extends Document - Mongoose document with _id, timestamps, etc.
 */
export interface IAnswerSubmissionResult extends Document {
    /** Unique session identifier linking to question generation session */
    sessionId: string;

    /** Reference to User document (student who submitted answers) */
    studentId: mongoose.Types.ObjectId;

    /** Student's email for quick lookup and reporting */
    studentEmail: string;

    /** Timestamp when student submitted answers */
    submittedAt: Date;

    /** Timestamp when AI validation completed */
    validatedAt: Date;

    /** Total score achieved (sum of all question scores) */
    totalScore: number;

    /** Maximum possible score (sum of all maxScore values) */
    maxScore: number;

    /** Percentage score (totalScore / maxScore * 100) */
    percentageScore: number;

    /** Array of individual question results with scores and feedback */
    questions: IQuestionResult[];

    /** Overall feedback from AI analyzing entire submission */
    overallFeedback: string;

    /** Identified strengths based on performance patterns */
    strengths: string[];

    /** Areas needing improvement based on errors and partial credit */
    areasForImprovement: string[];

    /** Quality metrics for the AI validation process */
    qualityMetrics: {
        /** LLM model used for validation (e.g., 'qwen2.5:14b') */
        modelUsed: string;
        /** Time taken for validation in milliseconds */
        validationTime: number;
        /** AI confidence in validation results (0.0-1.0) */
        confidenceScore: number;
    };
}

/**
 * Mongoose schema for question results.
 * Defines structure and validation rules for individual question data.
 */
const QuestionResultSchema = new Schema<IQuestionResult>(
    {
        id: { type: String, required: true },
        questionText: { type: String, required: true },
        questionType: { type: String, required: true },
        difficulty: { type: String, required: true },
        studentAnswer: { type: String, required: true },
        score: { type: Number, required: true, min: 0, max: 10 },
        maxScore: { type: Number, required: true, default: 10 },
        isCorrect: { type: Boolean, required: true },
        expectedAnswer: { type: String, required: true },
        feedback: { type: String, required: true },
        partialCreditReason: { type: String, required: false },
    },
    { _id: false }
); // No separate _id for subdocuments

/**
 * Mongoose schema for answer submission results.
 * Defines complete document structure with validation, indexes, and timestamps.
 */
const AnswerSubmissionResultSchema = new Schema<IAnswerSubmissionResult>(
    {
        sessionId: {
            type: String,
            required: true,
            index: true, // Index for fast session lookup
        },
        studentId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true, // Index for student performance queries
        },
        studentEmail: {
            type: String,
            required: true,
            index: true, // Index for email-based reporting
        },
        submittedAt: {
            type: Date,
            required: true,
            index: true, // Index for time-based analytics
        },
        validatedAt: {
            type: Date,
            required: true,
        },
        totalScore: {
            type: Number,
            required: true,
            min: 0,
        },
        maxScore: {
            type: Number,
            required: true,
            min: 0,
        },
        percentageScore: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        questions: [QuestionResultSchema],
        overallFeedback: {
            type: String,
            required: true,
        },
        strengths: [{ type: String }],
        areasForImprovement: [{ type: String }],
        qualityMetrics: {
            modelUsed: { type: String, required: true },
            validationTime: { type: Number, required: true },
            confidenceScore: { type: Number, required: true, min: 0, max: 1 },
        },
    },
    {
        timestamps: true, // Auto-add createdAt and updatedAt
        collection: "answer_submission_results",
    }
);

/**
 * Compound index for efficient student progress queries.
 * Enables fast lookup of all submissions by a student sorted by date.
 */
AnswerSubmissionResultSchema.index({ studentId: 1, submittedAt: -1 });

/**
 * Compound index for session-based analytics.
 * Enables tracking all student submissions for a specific question session.
 */
AnswerSubmissionResultSchema.index({ sessionId: 1, studentId: 1 });

/**
 * Mongoose model for answer submission results.
 * Use this to query, create, update, and delete submission records.
 *
 * @example Create new submission result
 * ```typescript
 * const result = new AnswerSubmissionResult({
 *   sessionId: 'session-123',
 *   studentId: userId,
 *   studentEmail: 'student@example.com',
 *   submittedAt: new Date(),
 *   validatedAt: new Date(),
 *   totalScore: 85,
 *   maxScore: 100,
 *   percentageScore: 85,
 *   questions: [...],
 *   overallFeedback: 'Great work!',
 *   strengths: ['Multiplication', 'Problem solving'],
 *   areasForImprovement: ['Division'],
 *   qualityMetrics: { modelUsed: 'qwen2.5:14b', validationTime: 2500, confidenceScore: 0.92 }
 * });
 * await result.save();
 * ```
 *
 * @example Query student's recent submissions
 * ```typescript
 * const recentSubmissions = await AnswerSubmissionResult
 *   .find({ studentId: userId })
 *   .sort({ submittedAt: -1 })
 *   .limit(10);
 * ```
 */
export const AnswerSubmissionResult = mongoose.model<IAnswerSubmissionResult>(
    "AnswerSubmissionResult",
    AnswerSubmissionResultSchema
);
