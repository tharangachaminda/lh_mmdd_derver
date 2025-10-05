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
import * as bcrypt from "bcryptjs";
import { User, UserRole } from "../models/user.model.js";
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
    private static SALT_ROUNDS = 12;

    /**
     * Helper: Register a student with simplified validation
     */
    private static async registerStudentHelper(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        grade: number;
        country: string;
    }) {
        try {
            // Check if user already exists
            const existingUser = await User.findOne({ email: data.email });
            if (existingUser) {
                return {
                    success: false,
                    message: "User with this email already exists",
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(
                data.password,
                this.SALT_ROUNDS
            );

            // Create new student user
            const newUser = new User({
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: UserRole.STUDENT,
                grade: data.grade,
                country: data.country,
                isActive: true,
            });

            await newUser.save();
            console.log("✅ Student created successfully:", newUser._id);

            return {
                success: true,
                message: "Student registered successfully",
                user: {
                    id: (newUser._id as any).toString(),
                    email: newUser.email,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    role: newUser.role,
                    grade: newUser.grade,
                    country: newUser.country,
                },
            };
        } catch (error: any) {
            console.error("❌ Student registration error:", error);
            return {
                success: false,
                message: `Registration failed: ${error.message}`,
            };
        }
    }

    /**
     * Helper: Login a student and return token
     */
    private static async loginStudentHelper(data: {
        email: string;
        password: string;
    }) {
        try {
            // Find user by email
            const user = await User.findOne({ email: data.email });
            if (!user) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(
                data.password,
                user.password
            );
            if (!isPasswordValid) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }

            // Check if user is active
            if (!user.isActive) {
                return {
                    success: false,
                    message: "Account is deactivated",
                };
            }

            // Generate simple token
            const payload = {
                userId: user._id,
                email: user.email,
                role: user.role,
                grade: user.grade,
            };

            const tokenData = JSON.stringify(payload);
            const token = Buffer.from(tokenData).toString("base64");

            console.log("✅ Student logged in successfully:", user._id);

            return {
                success: true,
                message: "Login successful",
                user: {
                    id: (user._id as any).toString(),
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    grade: user.grade,
                    country: user.country,
                },
                accessToken: token,
            };
        } catch (error: any) {
            console.error("❌ Student login error:", error);
            return {
                success: false,
                message: `Login failed: ${error.message}`,
            };
        }
    }
    /**
     * Register a new student (working implementation)
     */
    static async registerStudent(req: Request, res: Response): Promise<void> {
        try {
            console.log("📝 Student registration request:", req.body);

            const { email, password, firstName, lastName, grade, country } =
                req.body;

            // Basic validation
            if (
                !email ||
                !password ||
                !firstName ||
                !lastName ||
                !grade ||
                !country
            ) {
                res.status(400).json({
                    success: false,
                    message:
                        "All fields are required (email, password, firstName, lastName, grade, country)",
                });
                return;
            }

            // Validate grade is a number
            const gradeNum = parseInt(grade);
            if (isNaN(gradeNum) || gradeNum < 1 || gradeNum > 12) {
                res.status(400).json({
                    success: false,
                    message: "Grade must be a number between 1 and 12",
                });
                return;
            }

            // Register the student using working implementation
            const result = await AuthController.registerStudentHelper({
                email,
                password,
                firstName,
                lastName,
                grade: gradeNum,
                country,
            });

            if (result.success) {
                res.status(201).json(result);
            } else {
                res.status(400).json(result);
            }
        } catch (error: any) {
            console.error("❌ Registration controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during registration",
                details: error.message,
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
     * Login user (working implementation)
     */
    static async login(req: Request, res: Response): Promise<void> {
        try {
            console.log("🔑 Student login request:", { email: req.body.email });

            const { email, password } = req.body;

            // Basic validation
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Email and password are required",
                });
                return;
            }

            // Login the student using working implementation
            const result = await AuthController.loginStudentHelper({
                email,
                password,
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error: any) {
            console.error("❌ Login controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during login",
                details: error.message,
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
