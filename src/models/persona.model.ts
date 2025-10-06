/**
 * Student Persona Model for MongoDB
 *
 * Stores personalization data for AI question generation
 */

import mongoose, { Document, Schema } from "mongoose";

// Learning Style Enum
export enum LearningStyle {
    VISUAL = "visual",
    AUDITORY = "auditory",
    KINESTHETIC = "kinesthetic",
    READING_WRITING = "reading_writing",
}

// Difficulty Level Enum
export enum DifficultyLevel {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
}

// Student Persona Interface
export interface IStudentPersona extends Document {
    userId: mongoose.Types.ObjectId;
    grade: number; // Student's current grade/year level
    learningStyle: LearningStyle;
    interests: string[];
    culturalContext: string;
    preferredQuestionTypes: string[];
    performanceLevel: DifficultyLevel;
    strengths: string[];
    improvementAreas: string[];
    motivationalFactors: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Student Persona Schema
const StudentPersonaSchema: Schema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true,
        },
        grade: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
            validate: {
                validator: Number.isInteger,
                message: "Grade must be an integer between 1 and 12",
            },
        },
        learningStyle: {
            type: String,
            enum: Object.values(LearningStyle),
            default: LearningStyle.VISUAL,
        },
        interests: [
            {
                type: String,
                trim: true,
            },
        ],
        culturalContext: {
            type: String,
            default: "New Zealand",
            trim: true,
        },
        preferredQuestionTypes: [
            {
                type: String,
                trim: true,
            },
        ],
        performanceLevel: {
            type: String,
            enum: Object.values(DifficultyLevel),
            default: DifficultyLevel.INTERMEDIATE,
        },
        strengths: [
            {
                type: String,
                trim: true,
            },
        ],
        improvementAreas: [
            {
                type: String,
                trim: true,
            },
        ],
        motivationalFactors: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                (ret as any).id = ret._id;
                delete (ret as any)._id;
                delete (ret as any).__v;
                return ret;
            },
        },
    }
);

// Create compound index for efficient queries
StudentPersonaSchema.index({ userId: 1, updatedAt: -1 });

export const StudentPersona = mongoose.model<IStudentPersona>(
    "StudentPersona",
    StudentPersonaSchema
);
