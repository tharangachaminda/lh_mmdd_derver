/**
 * Integrated Swagger API Server
 * 
 * Production-ready server using the core-api package with comprehensive
 * Swagger documentation integrated into the monorepo structure.
 * 
 * @fileoverview Main server for testing integrated Swagger documentation
 * @version 1.0.0 - Monorepo integration
 */

import { createApp } from "./packages/core-api/src/app.js";

/**
 * Start the integrated API server
 */
async function startIntegratedServer() {
    try {
        const app = createApp();
        const PORT = process.env.PORT || 3001; // Different port to avoid conflicts

        const server = app.listen(PORT, () => {
            console.log('\n🌟 Learning Hub Integrated API Server Started!');
            console.log('=' .repeat(80));
            console.log(`🚀 Server: http://localhost:${PORT}`);
            console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api/v1/docs`);
            console.log(`📖 Alternative Docs: http://localhost:${PORT}/docs`);
            console.log(`💚 Health Check: http://localhost:${PORT}/health`);
            console.log(`📋 API Information: http://localhost:${PORT}/`);
            console.log('=' .repeat(80));
            console.log('\n🎯 API Endpoints:');
            console.log(`   • Content Generation: http://localhost:${PORT}/api/v1/content/generate`);
            console.log(`   • Content Search: http://localhost:${PORT}/api/v1/content/search`);
            console.log(`   • Content Retrieval: http://localhost:${PORT}/api/v1/content/{id}`);
            console.log(`   • Curriculum Info: http://localhost:${PORT}/api/v1/content/curriculum/{subject}/{grade}`);
            console.log(`   • Legacy Math: http://localhost:${PORT}/api/v1/mathematics/generate`);
            console.log('\n🔧 Testing URLs:');
            console.log(`   • Interactive Swagger: http://localhost:${PORT}/api/v1/docs`);
            console.log(`   • Health Status: http://localhost:${PORT}/health`);
            console.log(`   • Search Example: http://localhost:${PORT}/api/v1/content/search?query=algebra`);
            console.log('\n✅ Integrated monorepo Swagger documentation ready!\\n');
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('🛑 Shutting down integrated server...');
            server.close(() => {
                console.log('✅ Integrated server closed gracefully');
                process.exit(0);
            });
        });

        process.on('SIGINT', () => {
            console.log('\\n🛑 Received SIGINT, shutting down gracefully...');
            server.close(() => {
                console.log('✅ Integrated server closed');
                process.exit(0);
            });
        });

        return server;
    } catch (error) {
        console.error('❌ Failed to start integrated server:', error);
        process.exit(1);
    }
}

// Start the integrated server
startIntegratedServer().catch(console.error);