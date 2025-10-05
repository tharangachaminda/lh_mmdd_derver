/**
 * Simple Auth Controller for Production Student Registration
 * Bypasses complex dependencies that may be causing registration failures
 */

import { Request, Response } from "express";
import { SimpleRegistrationService } from "../services/simple-registration.service.js";

export class SimpleAuthController {
    /**
     * Simple student registration endpoint
     */
    static async registerStudent(req: Request, res: Response): Promise<void> {
        try {
            console.log("📝 Simple student registration request:", req.body);

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

            // Register the student
            const result = await SimpleRegistrationService.registerStudent({
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
            console.error("❌ Simple registration controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during registration",
                details: error.message,
            });
        }
    }

    /**
     * Simple student login endpoint
     */
    static async loginStudent(req: Request, res: Response): Promise<void> {
        try {
            console.log("🔑 Simple student login request:", {
                email: req.body.email,
            });

            const { email, password } = req.body;

            // Basic validation
            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: "Email and password are required",
                });
                return;
            }

            // Login the student
            const result = await SimpleRegistrationService.loginStudent({
                email,
                password,
            });

            if (result.success) {
                res.status(200).json(result);
            } else {
                res.status(401).json(result);
            }
        } catch (error: any) {
            console.error("❌ Simple login controller error:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error during login",
                details: error.message,
            });
        }
    }

    /**
     * Health check endpoint
     */
    static async healthCheck(req: Request, res: Response): Promise<void> {
        res.status(200).json({
            success: true,
            message: "Simple auth controller is working",
            timestamp: new Date().toISOString(),
        });
    }
}
