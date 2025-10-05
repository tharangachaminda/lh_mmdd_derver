/**
 * Authentication Middleware
 *
 * Middleware functions for JWT token verification and role-based access control
 */

import { Request, Response, NextFunction } from "express";
import { AuthService, JWTPayload } from "../services/auth.service.js";
import { IUser, UserRole } from "../models/user.model.js";

// Lazy instantiation to ensure environment variables are loaded
let authService: AuthService;
const getAuthService = () => {
    if (!authService) {
        authService = new AuthService();
    }
    return authService;
};

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: JWTPayload | null;
        }
    }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

        if (!token) {
            res.status(401).json({
                error: "Access token required",
                message: "Please provide a valid authorization token",
            });
            return;
        }

        // Verify token and get user
        const user = await getAuthService().verifyToken(token);
        req.user = user;

        next();
    } catch (error) {
        res.status(403).json({
            error: "Invalid token",
            message: "The provided token is invalid or expired",
        });
    }
};

/**
 * Middleware to check if user is a student
 */
export const requireStudent = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            error: "Authentication required",
            message: "Please authenticate first",
        });
        return;
    }

    if (req.user.role !== UserRole.STUDENT) {
        res.status(403).json({
            error: "Access denied",
            message: "Student access required",
        });
        return;
    }

    next();
};

/**
 * Middleware to check if user is an admin
 */
export const requireAdmin = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (!req.user) {
        res.status(401).json({
            error: "Authentication required",
            message: "Please authenticate first",
        });
        return;
    }

    if (req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
            error: "Access denied",
            message: "Administrator access required",
        });
        return;
    }

    next();
};

/**
 * Middleware to check if user has specific role(s)
 */
export const requireRole = (roles: UserRole | UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                error: "Authentication required",
                message: "Please authenticate first",
            });
            return;
        }

        const allowedRoles = Array.isArray(roles) ? roles : [roles];

        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                error: "Access denied",
                message: `Required role: ${allowedRoles.join(" or ")}`,
            });
            return;
        }

        next();
    };
};

/**
 * Optional authentication middleware - adds user to request if token is valid
 * but doesn't require authentication
 */
export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(" ")[1];

        if (token) {
            try {
                const user = await getAuthService().verifyToken(token);
                req.user = user;
            } catch (error) {
                // Invalid token, but continue without user
                req.user = undefined;
            }
        }

        next();
    } catch (error) {
        next();
    }
};
