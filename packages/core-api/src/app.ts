/**
 * Core Educational Platform API Server
 *
 * Subject-agnostic educational content management API.
 * Supports Mathematics, Science, English, and Social Studies.
 *
 * @fileoverview Main Express application for core-api package
 * @version 2.0.0 - Subject-agnostic refactor
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { setupSwagger } from "./config/swagger.config.js";
import contentRoutes from "./routes/content.routes.js";
import curriculumRoutes from "./routes/curriculum.routes.js";

/**
 * Create and configure Express application
 */
export function createApp(): express.Application {
    const app = express();

    // Security middleware
    app.use(helmet());

    // CORS configuration
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN || "*",
            credentials: true,
        })
    );

    // Compression middleware
    app.use(compression());

    // Logging middleware
    app.use(morgan("combined"));

    // Body parsing middleware
    app.use(express.json({ limit: "10mb" }));
    app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Setup Swagger API documentation
    setupSwagger(app);

    // Health check endpoint
    app.get("/health", (req, res) => {
        res.status(200).json({
            status: "healthy",
            service: "@learning-hub/core-api",
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        });
    });

    // API routes with v1 versioning to match Swagger documentation
    app.use("/api/v1/content", contentRoutes);
    app.use("/api/v1/curriculum", curriculumRoutes);

    // Legacy mathematics endpoint for backward compatibility
    app.use("/api/v1/mathematics", contentRoutes);

    // Alternative access for convenience
    app.use("/api/content", contentRoutes);
    app.use("/api/curriculum", curriculumRoutes);

    // Root endpoint with API information
    app.get("/", (req, res) => {
        res.status(200).json({
            name: "Learning Hub Educational Content API",
            version: "2.1.0",
            description:
                "Subject-agnostic educational content generation and curriculum management platform",
            features: [
                "Subject-agnostic content generation",
                "Vector database enhancement with relevance scoring",
                "Multi-agent workflows for quality assurance",
                "Circuit breaker patterns for reliability",
                "Comprehensive metadata tracking",
                "Curriculum data management and alignment",
                "Question similarity search",
                "Personalized content recommendations",
                "Bulk curriculum data ingestion"
            ],
            subjects: ["MATHEMATICS", "SCIENCE", "ENGLISH", "SOCIAL_STUDIES"],
            api_version: "v1",
            endpoints: {
                health: "/health",
                documentation: {
                    swagger_ui: "/api/v1/docs",
                    alternative_docs: "/docs",
                    openapi_spec: "/api/v1/docs/swagger.json",
                },
                content: {
                    generate: "/api/v1/content/generate",
                    retrieve: "/api/v1/content/{id}",
                    search: "/api/v1/content/search",
                    curriculum: "/api/v1/content/curriculum/{subject}/{grade}",
                },
                curriculum: {
                    search_questions: "/api/v1/curriculum/questions/search",
                    similar_questions: "/api/v1/curriculum/questions/similar",
                    recommendations: "/api/v1/curriculum/recommendations",
                    alignment: "/api/v1/curriculum/alignment",
                    bulk_ingest: "/api/v1/curriculum/admin/ingest",
                    health: "/api/v1/curriculum/admin/health",
                    stats: "/api/v1/curriculum/admin/stats"
                },
                legacy: {
                    mathematics: "/api/v1/mathematics/generate",
                    note: "Use /api/v1/content/generate with subject=MATHEMATICS for new integrations",
                },
            },
            swagger_documentation: "/api/v1/docs",
            repository: "https://github.com/tharangachaminda/lh_mmdd_derver",
            support: "developers@learninghub.nz",
        });
    });

    // 404 handler
    app.use("*", (req, res) => {
        res.status(404).json({
            success: false,
            error: `Route ${req.method} ${req.originalUrl} not found`,
            suggestion: "Visit /api/v1/docs for interactive API documentation",
            available_endpoints: [
                "GET /health - Health check",
                "GET / - API information",
                "GET /api/v1/docs - Interactive Swagger documentation",
                "POST /api/v1/content/generate - Generate educational content",
                "GET /api/v1/content/:id - Retrieve specific content",
                "GET /api/v1/content/search - Search educational content",
                "GET /api/v1/content/curriculum/:subject/:grade - Curriculum info",
                "POST /api/v1/mathematics/generate - Legacy mathematics endpoint",
                "GET /api/v1/curriculum/questions/search - Search questions with filters",
                "POST /api/v1/curriculum/questions/similar - Find similar questions",
                "POST /api/v1/curriculum/recommendations - Get content recommendations",
                "POST /api/v1/curriculum/alignment - Align questions to curriculum",
                "POST /api/v1/curriculum/admin/ingest - Bulk ingest curriculum data",
                "GET /api/v1/curriculum/admin/health - System health status",
                "GET /api/v1/curriculum/admin/stats - Ingestion statistics"
            ],
            documentation: "/api/v1/docs",
        });
    });

    // Global error handler
    app.use(
        (
            err: any,
            req: express.Request,
            res: express.Response,
            next: express.NextFunction
        ) => {
            console.error("Unhandled error:", err);

            res.status(err.status || 500).json({
                error: "Internal server error",
                message:
                    process.env.NODE_ENV === "development"
                        ? err.message
                        : "Something went wrong",
                ...(process.env.NODE_ENV === "development" && {
                    stack: err.stack,
                }),
            });
        }
    );

    return app;
}

// Export the app instance for testing
export const app = createApp();

// Note: Server startup moved to server.ts for better separation of concerns
