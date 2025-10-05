/**
 * User Model for MongoDB
 *
 * Defines the schema for user authentication and profile data
 */

import mongoose, { Document, Schema } from "mongoose";

// User Role Enum
export enum UserRole {
    STUDENT = "student",
    ADMIN = "admin",
}

// User Interface
export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    grade?: number;
    country?: string;
    preferredSubjects?: string[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    lastLoginAt?: Date;
    toAuthJSON(): {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        grade?: number;
        country?: string;
        preferredSubjects?: string[];
    };
}

// User Schema
const UserSchema: Schema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email",
            ],
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 50,
        },
        role: {
            type: String,
            enum: Object.values(UserRole),
            default: UserRole.STUDENT,
            required: true,
        },
        grade: {
            type: Number,
            min: 3,
            max: 12,
            required: function (this: IUser) {
                return this.role === UserRole.STUDENT;
            },
        },
        country: {
            type: String,
            required: function (this: IUser) {
                return this.role === UserRole.STUDENT;
            },
            trim: true,
        },
        preferredSubjects: {
            type: [String],
            default: [],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        lastLoginAt: {
            type: Date,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
        toJSON: {
            transform: function (doc, ret) {
                const { password, ...userObject } = ret;
                return userObject; // Return user object without password
            },
        },
    }
);

// Indexes for performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ grade: 1 });
UserSchema.index({ country: 1 });
UserSchema.index({ createdAt: -1 });

// Instance methods
UserSchema.methods.toAuthJSON = function () {
    return {
        id: this._id,
        email: this.email,
        firstName: this.firstName,
        lastName: this.lastName,
        role: this.role,
        grade: this.grade,
        country: this.country,
        preferredSubjects: this.preferredSubjects,
    };
};

export const User = mongoose.model<IUser>("User", UserSchema);
