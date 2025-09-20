import { Request, Response, NextFunction } from "express";

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public details?: any
    ) {
        super(message);
        this.name = "ApiError";
    }
}

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            error: err.message,
            details: err.details,
        });
        return;
    }

    // Handle syntax errors (e.g., invalid JSON)
    if (err instanceof SyntaxError && "body" in err) {
        res.status(400).json({
            error: "Invalid request body",
            details: err.message,
        });
        return;
    }

    // Default error response
    console.error("Unhandled error:", err);
    res.status(500).json({
        error: "Internal server error",
        details:
            process.env.NODE_ENV === "development" ? err.message : undefined,
    });
};
