/**
 * Simple Auth Routes for Production Student Registration
 * Clean endpoints without complex middleware dependencies
 */

import { Router } from "express";
import { SimpleAuthController } from "../controllers/simple-auth.controller.js";

const router = Router();

/**
 * @swagger
 * /api/simple-auth/health:
 *   get:
 *     summary: Health check for simple auth service
 *     responses:
 *       200:
 *         description: Service is healthy
 */
router.get("/health", SimpleAuthController.healthCheck);

/**
 * @swagger
 * /api/simple-auth/register/student:
 *   post:
 *     summary: Register a new student (simplified version)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - grade
 *               - country
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               grade:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *               country:
 *                 type: string
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Validation error or user already exists
 *       500:
 *         description: Server error
 */
router.post("/register/student", SimpleAuthController.registerStudent);

/**
 * @swagger
 * /api/simple-auth/login/student:
 *   post:
 *     summary: Login a student (simplified version)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with JWT token
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post("/login/student", SimpleAuthController.loginStudent);

export default router;
