/**
 * Authentication Routes
 *
 * API routes for user authentication endpoints
 */

import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import {
    authenticateToken,
    requireAdmin,
} from "../middleware/auth.middleware.js";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     StudentRegistration:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - firstName
 *         - lastName
 *         - grade
 *         - country
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *         firstName:
 *           type: string
 *           minLength: 2
 *         lastName:
 *           type: string
 *           minLength: 2
 *         grade:
 *           type: integer
 *           minimum: 3
 *           maximum: 12
 *         country:
 *           type: string
 *         preferredSubjects:
 *           type: array
 *           items:
 *             type: string
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             user:
 *               type: object
 *             token:
 *               type: string
 *             refreshToken:
 *               type: string
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/auth/register/student:
 *   post:
 *     summary: Register a new student (working version)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentRegistration'
 *     responses:
 *       201:
 *         description: Student registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: User already exists
 */
router.post("/register/student", AuthController.registerStudent);

/**
 * @swagger
 * /api/auth/register/admin:
 *   post:
 *     summary: Register a new admin
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Admin registered successfully
 *       403:
 *         description: Admin access required
 */
router.post(
    "/register/admin",
    authenticateToken,
    requireAdmin,
    AuthController.registerAdmin
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login student (working version)
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", AuthController.login);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid refresh token
 */
router.post("/refresh", AuthController.refreshToken);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get("/profile", authenticateToken, AuthController.getProfile);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post("/logout", authenticateToken, AuthController.logout);

export default router;
