/**
 * Authentication Service
 * Handles user registration, login, and JWT token management
 */

import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";
import { SignOptions } from "jsonwebtoken";
import mongoose from "mongoose";
import { User, IUser, UserRole } from "../models/user.model.js";

// Registration Data Interfaces
export interface StudentRegistrationData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    grade: number;
    country: string;
}

export interface AdminRegistrationData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    country: string;
    adminCode: string;
}

export interface LoginData {
    email: string;
    password: string;
}

// Response Interfaces
export interface AuthResponse {
    success: boolean;
    message: string;
    user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        grade?: number;
        country?: string;
        preferredSubjects?: string[];
    };
    accessToken?: string;
    refreshToken?: string;
}

export interface JWTPayload {
    userId: string;
    email: string;
    role: UserRole;
    iat?: number;
    exp?: number;
}

/**
 * Authentication Service Class
 * Provides comprehensive user authentication and authorization functionality
 */
export class AuthService {
    private readonly JWT_SECRET: string;
    private readonly JWT_REFRESH_SECRET: string;
    private readonly JWT_EXPIRES_IN: string = "1h";
    private readonly JWT_REFRESH_EXPIRES_IN: string = "7d";
    private readonly SALT_ROUNDS: number = 12;
    private readonly ADMIN_CODE: string;

    constructor() {
        this.JWT_SECRET = process.env.JWT_SECRET || "";
        this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "";
        this.ADMIN_CODE = process.env.ADMIN_CODE || "defaultAdminCode";

        if (!this.JWT_SECRET || !this.JWT_REFRESH_SECRET) {
            throw new Error(
                "JWT secrets must be provided in environment variables"
            );
        }
    }

    /**
     * Register a new student user
     * @param data Student registration data
     * @returns Authentication response with user data and tokens
     */
    async registerStudent(
        data: StudentRegistrationData
    ): Promise<AuthResponse> {
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
            });

            await newUser.save();

            // Generate tokens
            const accessToken = this.generateAccessToken({
                userId: (newUser._id as any).toString(),
                email: newUser.email,
                role: newUser.role,
            });

            const refreshToken = this.generateRefreshToken({
                userId: (newUser._id as any).toString(),
                email: newUser.email,
                role: newUser.role,
            });

            return {
                success: true,
                message: "Student registered successfully",
                user: newUser.toAuthJSON(),
                accessToken,
                refreshToken,
            };
        } catch (error) {
            console.error("Student registration error:", error);
            return {
                success: false,
                message: "Registration failed due to server error",
            };
        }
    }

    /**
     * Register a new admin user
     * @param data Admin registration data
     * @returns Authentication response with user data and tokens
     */
    async registerAdmin(data: AdminRegistrationData): Promise<AuthResponse> {
        try {
            // Verify admin code
            if (data.adminCode !== this.ADMIN_CODE) {
                return {
                    success: false,
                    message: "Invalid admin code",
                };
            }

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

            // Create new admin user
            const newUser = new User({
                email: data.email,
                password: hashedPassword,
                firstName: data.firstName,
                lastName: data.lastName,
                role: UserRole.ADMIN,
                country: data.country,
            });

            await newUser.save();

            // Generate tokens
            const accessToken = this.generateAccessToken({
                userId: (newUser._id as any).toString(),
                email: newUser.email,
                role: newUser.role,
            });

            const refreshToken = this.generateRefreshToken({
                userId: (newUser._id as any).toString(),
                email: newUser.email,
                role: newUser.role,
            });

            return {
                success: true,
                message: "Admin registered successfully",
                user: newUser.toAuthJSON(),
                accessToken,
                refreshToken,
            };
        } catch (error) {
            console.error("Admin registration error:", error);
            return {
                success: false,
                message: "Registration failed due to server error",
            };
        }
    }

    /**
     * Authenticate user login
     * @param data Login credentials
     * @returns Authentication response with user data and tokens
     */
    async login(data: LoginData): Promise<AuthResponse> {
        try {
            // Find user by email
            const user = await User.findOne({ email: data.email });
            if (!user) {
                return {
                    success: false,
                    message: "Invalid email or password",
                };
            }

            // Verify password
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

            // Generate tokens
            const accessToken = this.generateAccessToken({
                userId: (user._id as mongoose.Types.ObjectId).toString(),
                email: user.email,
                role: user.role,
            });

            const refreshToken = this.generateRefreshToken({
                userId: (user._id as mongoose.Types.ObjectId).toString(),
                email: user.email,
                role: user.role,
            });

            return {
                success: true,
                message: "Login successful",
                user: user.toAuthJSON(),
                accessToken,
                refreshToken,
            };
        } catch (error) {
            console.error("Login error:", error);
            return {
                success: false,
                message: "Login failed due to server error",
            };
        }
    }

    /**
     * Refresh access token using refresh token
     * @param refreshToken Valid refresh token
     * @returns New access token
     */
    async refreshToken(
        refreshToken: string
    ): Promise<{ success: boolean; accessToken?: string; message: string }> {
        try {
            const decoded = jwt.verify(
                refreshToken,
                this.JWT_REFRESH_SECRET
            ) as JWTPayload;

            // Verify user still exists
            const user = await User.findById(decoded.userId);
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            // Generate new access token
            const newAccessToken = this.generateAccessToken({
                userId: (user._id as mongoose.Types.ObjectId).toString(),
                email: user.email,
                role: user.role,
            });

            return {
                success: true,
                accessToken: newAccessToken,
                message: "Token refreshed successfully",
            };
        } catch (error) {
            return {
                success: false,
                message: "Invalid refresh token",
            };
        }
    }

    /**
     * Verify and decode access token
     * @param token JWT access token
     * @returns Decoded token payload or null if invalid
     */
    async verifyToken(token: string): Promise<JWTPayload | null> {
        try {
            const decoded = jwt.verify(token, this.JWT_SECRET) as JWTPayload;

            // Verify user still exists and is active
            const user = await User.findById(decoded.userId);
            if (!user) {
                return null;
            }

            return decoded;
        } catch (error) {
            return null;
        }
    }

    /**
     * Generate JWT access token
     * @param payload Token payload
     * @returns Signed JWT token
     */
    private generateAccessToken(
        payload: Omit<JWTPayload, "iat" | "exp">
    ): string {
        // Expires in 1 hour
        const expiresIn = Math.floor(Date.now() / 1000) + 60 * 60;
        const jwtPayload: JWTPayload = { ...payload, exp: expiresIn };
        return jwt.sign(jwtPayload, this.JWT_SECRET);
    }

    /**
     * Generate JWT refresh token
     * @param payload Token payload
     * @returns Signed JWT refresh token
     */
    private generateRefreshToken(
        payload: Omit<JWTPayload, "iat" | "exp">
    ): string {
        // Expires in 1 hour
        const expiresIn = Math.floor(Date.now() / 1000) + 60 * 60;
        const jwtPayload: JWTPayload = { ...payload, exp: expiresIn };
        return jwt.sign(jwtPayload, this.JWT_SECRET);
    }

    /**
     * Hash password using bcrypt
     * @param password Plain text password
     * @returns Hashed password
     */
    async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.SALT_ROUNDS);
    }

    /**
     * Compare password with hash
     * @param password Plain text password
     * @param hashedPassword Hashed password from database
     * @returns True if password matches
     */
    async comparePassword(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}
