/**
 * Core API Server Entry Point
 *
 * Starts the educational platform API server with Swagger documentation.
 * Designed for comprehensive API integration testing.
 *
 * @fileoverview Server startup for API integration testing
 * @version 2.0.0 - API Integration Testing
 */

import { createApp } from "./app.js";

const PORT = process.env.PORT || 3001;
const app = createApp();

// Start server
app.listen(PORT, () => {
    console.log("🚀 Core Educational Platform API Server");
    console.log(`📍 Server running on port ${PORT}`);
    console.log(`📚 Swagger docs: http://localhost:${PORT}/api/v1/docs`);
    console.log(`🔍 API info: http://localhost:${PORT}/`);
    console.log(`❤️  Health check: http://localhost:${PORT}/health`);
    console.log("");
    console.log("✅ Ready for API integration testing!");
});

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, shutting down gracefully");
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("🛑 SIGINT received, shutting down gracefully");
    process.exit(0);
});
