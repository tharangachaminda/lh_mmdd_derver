/**
 * Simple Development Server for Testing Swagger Documentation
 * 
 * @fileoverview Quick test server for API documentation
 * @version 1.0.0
 */

const express = require('express');

// Create basic app
function createApp() {
    const app = express();

    // Basic middleware
    app.use(express.json());
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });

    // === TRY TO SETUP SWAGGER (if available) ===
    try {
        const swaggerJSDoc = require('swagger-jsdoc');
        const swaggerUi = require('swagger-ui-express');

        const swaggerOptions = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Learning Hub Educational Content API',
                    version: '2.1.0',
                    description: 'Subject-agnostic educational content generation and management API'
                },
                servers: [
                    {
                        url: 'http://localhost:3000',
                        description: 'Development server'
                    }
                ]
            },
            apis: [] // We'll add endpoints programmatically
        };

        const specs = swaggerJSDoc(swaggerOptions);
        
        // Add manual endpoint definitions
        specs.paths = {
            '/api/v1/health': {
                get: {
                    summary: 'Health check endpoint',
                    responses: {
                        '200': {
                            description: 'Service is healthy',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string' },
                                            timestamp: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/content/generate': {
                post: {
                    summary: 'Generate educational content',
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        subject: { type: 'string', enum: ['MATHEMATICS', 'SCIENCE', 'ENGLISH', 'SOCIAL_STUDIES'] },
                                        grade: { type: 'integer', minimum: 1, maximum: 12 },
                                        topic: { type: 'string' },
                                        count: { type: 'integer', default: 1 }
                                    },
                                    required: ['subject', 'grade', 'topic']
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Content generated successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: { type: 'array' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };

        // Setup Swagger UI
        app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(specs));
        app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
        
        console.log('✅ Swagger documentation setup complete');
    } catch (error) {
        console.warn('⚠️  Swagger not available:', error.message);
        
        // Fallback documentation endpoint
        app.get('/api/v1/docs', (req, res) => {
            res.json({
                message: 'Learning Hub Educational Content API',
                note: 'Swagger UI not available - install swagger dependencies',
                endpoints: {
                    health: '/api/v1/health',
                    generate: '/api/v1/content/generate (POST)',
                    search: '/api/v1/content/search'
                },
                install_command: 'npm install swagger-jsdoc swagger-ui-express'
            });
        });
    }

    // === HEALTH ENDPOINTS ===
    app.get('/api/v1/health', (req, res) => {
        res.json({
            status: 'healthy',
            service: 'Learning Hub Educational Content API',
            version: '2.1.0',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    app.get('/health', (req, res) => {
        res.json({ status: 'ok', timestamp: new Date().toISOString() });
    });

    // === API ENDPOINTS ===
    app.post('/api/v1/content/generate', (req, res) => {
        console.log('📝 Generate content request:', req.body);
        
        const { subject = 'MATHEMATICS', grade = 8, topic = 'algebra', count = 1 } = req.body;
        
        // Mock response
        const mockQuestions = [];
        for (let i = 0; i < count; i++) {
            mockQuestions.push({
                id: `mock_${Date.now()}_${i}`,
                subject,
                grade,
                topic,
                question: `Sample ${subject.toLowerCase()} question about ${topic} for grade ${grade}`,
                answer: 'Sample answer',
                difficulty: 'MEDIUM',
                metadata: {
                    generated_at: new Date().toISOString(),
                    source: 'mock_generator'
                }
            });
        }

        res.json({
            success: true,
            message: `Generated ${count} ${subject.toLowerCase()} question(s)`,
            data: mockQuestions,
            count: mockQuestions.length
        });
    });

    app.get('/api/v1/content/search', (req, res) => {
        const { query, subject, grade } = req.query;
        console.log('🔍 Search request:', { query, subject, grade });
        
        res.json({
            success: true,
            message: 'Search completed (mock response)',
            data: [],
            query: { query, subject, grade },
            count: 0
        });
    });

    app.get('/api/v1/content/:id', (req, res) => {
        const { id } = req.params;
        console.log('📖 Get content request:', id);
        
        res.json({
            success: true,
            data: {
                id,
                subject: 'MATHEMATICS',
                question: 'Sample question content',
                answer: 'Sample answer',
                retrieved_at: new Date().toISOString()
            }
        });
    });

    // === ROOT ENDPOINT ===
    app.get('/', (req, res) => {
        res.json({
            message: 'Learning Hub Educational Content API - Test Server',
            version: '2.1.0',
            status: 'running',
            endpoints: {
                docs: '/api/v1/docs',
                health: '/api/v1/health',
                generate: '/api/v1/content/generate (POST)',
                search: '/api/v1/content/search',
                get_content: '/api/v1/content/{id}'
            },
            swagger_urls: [
                'http://localhost:3000/api/v1/docs',
                'http://localhost:3000/docs'
            ]
        });
    });

    // === ERROR HANDLING ===
    app.use('*', (req, res) => {
        res.status(404).json({
            success: false,
            error: `Route ${req.method} ${req.originalUrl} not found`,
            suggestion: 'Visit /api/v1/docs for API documentation'
        });
    });

    app.use((error, req, res, next) => {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    });

    return app;
}

// === START SERVER ===
function startServer() {
    const app = createApp();
    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
        console.log('\n🌟 Learning Hub API Test Server Started!');
        console.log(`📡 Server: http://localhost:${PORT}`);
        console.log(`📚 Documentation: http://localhost:${PORT}/api/v1/docs`);
        console.log(`💚 Health Check: http://localhost:${PORT}/api/v1/health`);
        console.log(`🎯 Test Generate: http://localhost:${PORT}/api/v1/content/generate`);
        console.log('\n📋 Try these URLs:');
        console.log(`   • Main API: http://localhost:${PORT}/`);
        console.log(`   • Swagger UI: http://localhost:${PORT}/docs`);
        console.log(`   • Health: http://localhost:${PORT}/health`);
        console.log('\n🚀 Ready for testing!\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 Shutting down server...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });
}

// Start if this file is run directly
if (require.main === module) {
    startServer();
}

module.exports = { createApp, startServer };