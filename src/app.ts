import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import questionsRoutes from "./routes/questions.routes.js";
import authRoutes from "./routes/auth.routes.js";
import simpleAuthRoutes from "./routes/simple-auth.routes.js";
import productionQuestionsRoutes from "./routes/production-questions.routes.js";
import { errorHandler } from "./utils/error.handler.js";
import { DatabaseConfig } from "./config/database.config.js";

const app = express();
export { app };

// Initialize database connection
const database = DatabaseConfig.getInstance();
await database.connect();

// CORS configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:4200",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Middleware to parse JSON bodies
app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
    const dbInfo = database.getConnectionInfo();
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        database: {
            connected: dbInfo.isConnected,
            readyState: dbInfo.readyState,
        },
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/simple-auth", simpleAuthRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/production-questions", productionQuestionsRoutes);

// 404 handler for undefined routes
app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use(errorHandler);
