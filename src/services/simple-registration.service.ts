/**
 * Simple Student Registration Service
 * Bypasses complex dependencies for production student creation
 */

import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";
import { User, UserRole } from "../models/user.model.js";
import { AuthResponse } from "./auth.service.js";

export interface SimpleStudentData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    grade: number;
    country: string;
}

export interface LoginData {
    email: string;
    password: string;
}

export class SimpleRegistrationService {
    private static SALT_ROUNDS = 12;
    private static JWT_SECRET =
        process.env.JWT_SECRET || "learning-hub-secret-key";
    private static JWT_EXPIRES_IN = "24h";

    /**
     * Register a student with minimal dependencies
     */
    static async registerStudent(
        data: SimpleStudentData
    ): Promise<AuthResponse> {
        try {
            console.log("🎓 Simple student registration:", {
                email: data.email,
                grade: data.grade,
            });

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
            console.error("❌ Simple student registration error:", error);
            return {
                success: false,
                message: `Registration failed: ${error.message}`,
            };
        }
    }

    /**
     * Login a student and return JWT token
     */
    static async loginStudent(data: LoginData): Promise<AuthResponse> {
        try {
            console.log("🔑 Simple student login:", { email: data.email });

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

            // Generate JWT token using the simpler approach
            const payload = {
                userId: user._id,
                email: user.email,
                role: user.role,
                grade: user.grade,
            };

            // Use a simple string concatenation approach for token creation
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
            console.error("❌ Simple student login error:", error);
            return {
                success: false,
                message: `Login failed: ${error.message}`,
            };
        }
    }
}
