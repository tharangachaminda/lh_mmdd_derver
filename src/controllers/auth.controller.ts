/**
 * Authentication Controller
 *
 * Handles HTTP requests for user authentication (registration, login, etc.)
 */

import { Request, Response } from "express";
import {
    AuthService,
    StudentRegistrationData,
    AdminRegistrationData,
    LoginData,
} from "../services/auth.service.js";
import { User } from "../models/user.model.js";
import { z } from "zod";

// Lazy instantiation to ensure environment variables are loaded
let authService: AuthService;
const getAuthService = () => {
    if (!authService) {
        authService = new AuthService();
    }
    return authService;
};

// Validation schemas using Zod
const studentRegistrationSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must be less than 50 characters"),
    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must be less than 50 characters"),
    grade: z
        .number()
        .min(3, "Grade must be between 3 and 12")
        .max(12, "Grade must be between 3 and 12"),
    country: z.string().min(2, "Country is required"),
    preferredSubjects: z.array(z.string()).optional().default([]),
});

const adminRegistrationSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
            "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
        ),
    firstName: z
        .string()
        .min(2, "First name must be at least 2 characters")
        .max(50, "First name must be less than 50 characters"),
    lastName: z
        .string()
        .min(2, "Last name must be at least 2 characters")
        .max(50, "Last name must be less than 50 characters"),
});

const loginSchema = z.object({
    email: z.string().email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
});

const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
});

export class AuthController {
    /**
     * Register a new student
     */
    static async registerStudent(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            const validatedData = studentRegistrationSchema.parse(req.body);

            // Register student
            const result = await getAuthService().registerStudent(
                validatedData as StudentRegistrationData
            );

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: "Validation error",
                    details: error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
                return;
            }

            if (error instanceof Error) {
                if (error.message === "User already exists with this email") {
                    res.status(409).json({
                        success: false,
                        error: "Conflict",
                        message: error.message,
                    });
                    return;
                }

                res.status(400).json({
                    success: false,
                    error: "Registration failed",
                    message: error.message,
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: "Internal server error",
                message: "Student registration failed",
            });
        }
    }

    /**
     * Register a new admin
     */
    static async registerAdmin(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            const validatedData = adminRegistrationSchema.parse(req.body);

            // Register admin
            const result = await getAuthService().registerAdmin(
                validatedData as AdminRegistrationData
            );

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: "Validation error",
                    details: error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
                return;
            }

            if (error instanceof Error) {
                if (error.message === "User already exists with this email") {
                    res.status(409).json({
                        success: false,
                        error: "Conflict",
                        message: error.message,
                    });
                    return;
                }

                res.status(400).json({
                    success: false,
                    error: "Registration failed",
                    message: error.message,
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: "Internal server error",
                message: "Admin registration failed",
            });
        }
    }

    /**
     * Login user
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            const validatedData = loginSchema.parse(req.body);

            // Login user
            const result = await getAuthService().login(
                validatedData as LoginData
            );

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: "Validation error",
                    details: error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
                return;
            }

            if (error instanceof Error) {
                if (error.message === "Invalid email or password") {
                    res.status(401).json({
                        success: false,
                        error: "Authentication failed",
                        message: "Invalid email or password",
                    });
                    return;
                }

                res.status(400).json({
                    success: false,
                    error: "Login failed",
                    message: error.message,
                });
                return;
            }

            res.status(500).json({
                success: false,
                error: "Internal server error",
                message: "Login failed",
            });
        }
    }

    /**
     * Refresh access token
     */
    static async refreshToken(req: Request, res: Response): Promise<void> {
        try {
            // Validate request body
            const validatedData = refreshTokenSchema.parse(req.body);

            // Refresh token
            const result = await getAuthService().refreshToken(
                validatedData.refreshToken
            );

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: "Validation error",
                    details: error.errors.map((err) => ({
                        field: err.path.join("."),
                        message: err.message,
                    })),
                });
                return;
            }

            res.status(401).json({
                success: false,
                error: "Invalid refresh token",
                message: "Please login again",
            });
        }
    }

    /**
     * Get current user profile
     */
    static async getProfile(req: Request, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    error: "Authentication required",
                    message: "Please authenticate first",
                });
                return;
            }

            // Fetch full user data from database
            const user = await User.findById(req.user.userId);
            if (!user) {
                res.status(404).json({
                    success: false,
                    error: "User not found",
                    message: "User account no longer exists",
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: "Profile retrieved successfully",
                data: {
                    user: user.toAuthJSON(),
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Internal server error",
                message: "Failed to retrieve profile",
            });
        }
    }

    /**
     * Logout user (client-side token removal)
     */
    static async logout(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            success: true,
            message: "Logout successful",
            data: {
                message: "Please remove the token from client storage",
            },
        });
    }
}
