import express, { Request, Response, NextFunction } from "express";

const app = express();
export { app };

// Middleware to parse JSON bodies
app.use(express.json());

// Error handling middleware for JSON parsing errors
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({ error: "Invalid JSON payload" });
    }
    next(err);
});

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
    });
});

// 404 handler for undefined routes
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});
