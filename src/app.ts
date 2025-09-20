import express, { Request, Response, NextFunction } from "express";
import questionRoutes from "./routes/question.routes";
import { errorHandler } from "./utils/error.handler";

const app = express();
export { app };

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
    });
});

// API routes
app.use("/api/questions", questionRoutes);

// 404 handler for undefined routes
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);
