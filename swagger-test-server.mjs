/**
 * Simple Development Server for Testing Swagger Documentation - ES Module Version
 * 
 * @fileoverview Quick test server for API documentation
 * @version 1.0.0
 */

import express from 'express';

// Create basic app
async function createApp() {
    const app = express();

    // Basic middleware
    app.use(express.json());
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
        next();
    });

    // === TRY TO SETUP SWAGGER (if available) ===
    let swaggerSetupSuccess = false;
    try {
        // Dynamic import for swagger dependencies
        const { default: swaggerJSDoc } = await import('swagger-jsdoc');
        const { default: swaggerUi } = await import('swagger-ui-express');

        const swaggerOptions = {
            definition: {
                openapi: '3.0.0',
                info: {
                    title: 'Learning Hub Educational Content API',
                    version: '2.1.0',
                    description: 'Subject-agnostic educational content generation and management API with comprehensive Swagger documentation'
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
        
        // Add comprehensive manual endpoint definitions
        specs.paths = {
            '/api/v1/health': {
                get: {
                    summary: 'Health check endpoint',
                    description: 'Returns the current health status of the Learning Hub API service',
                    tags: ['Health'],
                    responses: {
                        '200': {
                            description: 'Service is healthy and operational',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            status: { type: 'string', example: 'healthy' },
                                            service: { type: 'string', example: 'Learning Hub Educational Content API' },
                                            version: { type: 'string', example: '2.1.0' },
                                            timestamp: { type: 'string', format: 'date-time' },
                                            uptime: { type: 'number', description: 'Server uptime in seconds' }
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
                    description: 'Generate educational questions and content for specified subject, grade, and topic',
                    tags: ['Content Generation'],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        subject: { 
                                            type: 'string', 
                                            enum: ['MATHEMATICS', 'SCIENCE', 'ENGLISH', 'SOCIAL_STUDIES'],
                                            description: 'Educational subject area'
                                        },
                                        grade: { 
                                            type: 'integer', 
                                            minimum: 1, 
                                            maximum: 12,
                                            description: 'Grade level (1-12)'
                                        },
                                        topic: { 
                                            type: 'string',
                                            description: 'Specific topic within the subject'
                                        },
                                        count: { 
                                            type: 'integer', 
                                            default: 1,
                                            minimum: 1,
                                            maximum: 10,
                                            description: 'Number of questions to generate'
                                        }
                                    },
                                    required: ['subject', 'grade', 'topic'],
                                    example: {
                                        subject: 'MATHEMATICS',
                                        grade: 8,
                                        topic: 'algebraic expressions',
                                        count: 3
                                    }
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
                                            success: { type: 'boolean', example: true },
                                            message: { type: 'string', example: 'Generated 3 mathematics questions' },
                                            data: { 
                                                type: 'array',
                                                items: {
                                                    type: 'object',
                                                    properties: {
                                                        id: { type: 'string' },
                                                        subject: { type: 'string' },
                                                        grade: { type: 'integer' },
                                                        topic: { type: 'string' },
                                                        question: { type: 'string' },
                                                        answer: { type: 'string' },
                                                        difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'] },
                                                        metadata: { type: 'object' }
                                                    }
                                                }
                                            },
                                            count: { type: 'integer' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': {
                            description: 'Invalid request parameters',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean', example: false },
                                            error: { type: 'string' }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/content/search': {
                get: {
                    summary: 'Search educational content',
                    description: 'Search for educational content using vector database and relevance scoring',
                    tags: ['Content Search'],
                    parameters: [
                        {
                            name: 'query',
                            in: 'query',
                            description: 'Search query text',
                            required: true,
                            schema: { type: 'string' }
                        },
                        {
                            name: 'subject',
                            in: 'query',
                            description: 'Filter by subject',
                            schema: { 
                                type: 'string',
                                enum: ['MATHEMATICS', 'SCIENCE', 'ENGLISH', 'SOCIAL_STUDIES']
                            }
                        },
                        {
                            name: 'grade',
                            in: 'query',
                            description: 'Filter by grade level',
                            schema: { 
                                type: 'integer',
                                minimum: 1,
                                maximum: 12
                            }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Search completed successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            message: { type: 'string' },
                                            data: { type: 'array' },
                                            query: { type: 'object' },
                                            count: { type: 'integer' },
                                            relevance_scores: { 
                                                type: 'array',
                                                description: 'Relevance scores for vector database effectiveness tracking'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/v1/content/{id}': {
                get: {
                    summary: 'Get specific educational content',
                    description: 'Retrieve educational content by unique identifier',
                    tags: ['Content Retrieval'],
                    parameters: [
                        {
                            name: 'id',
                            in: 'path',
                            required: true,
                            description: 'Unique content identifier',
                            schema: { type: 'string' }
                        }
                    ],
                    responses: {
                        '200': {
                            description: 'Content retrieved successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            success: { type: 'boolean' },
                                            data: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'string' },
                                                    subject: { type: 'string' },
                                                    question: { type: 'string' },
                                                    answer: { type: 'string' },
                                                    retrieved_at: { type: 'string', format: 'date-time' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        '404': {
                            description: 'Content not found'
                        }
                    }
                }
            }
        };

        // Setup Swagger UI with enhanced configuration
        const swaggerUiOptions = {
            explorer: true,
            swaggerOptions: {
                displayRequestDuration: true,
                tryItOutEnabled: true,
                filter: true,
                showCommonExtensions: true
            }
        };

        app.use('/api/v1/docs', swaggerUi.serve);
        app.get('/api/v1/docs', swaggerUi.setup(specs, swaggerUiOptions));
        
        app.use('/docs', swaggerUi.serve);
        app.get('/docs', swaggerUi.setup(specs, swaggerUiOptions));
        
        console.log('✅ Swagger documentation setup complete with comprehensive API specs');
        swaggerSetupSuccess = true;
    } catch (error) {
        console.warn('⚠️  Swagger dependencies not available:', error.message);
        swaggerSetupSuccess = false;
    }

    // Fallback documentation endpoint if Swagger isn't available
    if (!swaggerSetupSuccess) {
        app.get('/api/v1/docs', (req, res) => {
            res.json({
                message: 'Learning Hub Educational Content API',
                note: 'Swagger UI not available - install swagger dependencies',
                status: 'swagger_fallback',
                endpoints: {
                    health: '/api/v1/health',
                    generate: '/api/v1/content/generate (POST)',
                    search: '/api/v1/content/search',
                    get_content: '/api/v1/content/{id}'
                },
                install_command: 'npm install swagger-jsdoc swagger-ui-express',
                swagger_dependencies_available: false
            });
        });
        
        app.get('/docs', (req, res) => res.redirect('/api/v1/docs'));
    }

    // === HEALTH ENDPOINTS ===
    app.get('/api/v1/health', (req, res) => {
        res.json({
            status: 'healthy',
            service: 'Learning Hub Educational Content API',
            version: '2.1.0',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            swagger_available: swaggerSetupSuccess,
            node_version: process.version,
            environment: process.env.NODE_ENV || 'development'
        });
    });

    app.get('/health', (req, res) => {
        res.json({ 
            status: 'ok', 
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    });

    // === API ENDPOINTS ===
    app.post('/api/v1/content/generate', (req, res) => {
        console.log('📝 Generate content request:', req.body);
        
        const { subject = 'MATHEMATICS', grade = 8, topic = 'algebra', count = 1 } = req.body;
        
        // Validate input
        if (!subject || !grade || !topic) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: subject, grade, topic'
            });
        }

        if (count > 10) {
            return res.status(400).json({
                success: false,
                error: 'Maximum count is 10 questions per request'
            });
        }

        // Mock response with realistic data
        const mockQuestions = [];
        for (let i = 0; i < count; i++) {
            mockQuestions.push({
                id: `mock_${Date.now()}_${i}`,
                subject,
                grade,
                topic,
                question: `Sample ${subject.toLowerCase()} question about ${topic} for grade ${grade} (Question ${i + 1})`,
                answer: `Sample detailed answer for question ${i + 1}`,
                difficulty: ['EASY', 'MEDIUM', 'HARD'][Math.floor(Math.random() * 3)],
                metadata: {
                    generated_at: new Date().toISOString(),
                    source: 'mock_generator',
                    relevance_score: Math.random() * 0.5 + 0.5, // 0.5-1.0
                    estimated_time_minutes: Math.floor(Math.random() * 10) + 5
                }
            });
        }

        res.json({
            success: true,
            message: `Generated ${count} ${subject.toLowerCase()} question(s) for ${topic}`,
            data: mockQuestions,
            count: mockQuestions.length,
            request_metadata: {
                processed_at: new Date().toISOString(),
                processing_time_ms: Math.floor(Math.random() * 100) + 50
            }
        });
    });

    app.get('/api/v1/content/search', (req, res) => {
        const { query, subject, grade, limit = 10 } = req.query;
        console.log('🔍 Search request:', { query, subject, grade, limit });
        
        // Mock search results with relevance scores
        const mockResults = [];
        if (query) {
            for (let i = 0; i < Math.min(limit, 5); i++) {
                mockResults.push({
                    id: `search_result_${i}`,
                    subject: subject || 'MATHEMATICS',
                    grade: grade || 8,
                    question: `Search result ${i + 1} for query: "${query}"`,
                    relevance_score: Math.random() * 0.4 + 0.6, // 0.6-1.0 for good matches
                    matched_terms: query.split(' ').slice(0, 2)
                });
            }
        }
        
        res.json({
            success: true,
            message: 'Search completed (mock response)',
            data: mockResults,
            query: { query, subject, grade, limit },
            count: mockResults.length,
            relevance_scores: mockResults.map(r => r.relevance_score),
            search_metadata: {
                search_time_ms: Math.floor(Math.random() * 50) + 10,
                total_available: 1000,
                search_algorithm: 'mock_vector_search'
            }
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
                grade: 8,
                topic: 'algebraic expressions',
                question: `Sample question content for ID: ${id}`,
                answer: 'Sample detailed answer with step-by-step solution',
                difficulty: 'MEDIUM',
                metadata: {
                    created_at: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                    retrieved_at: new Date().toISOString(),
                    view_count: Math.floor(Math.random() * 100),
                    last_modified: new Date(Date.now() - Math.random() * 3600000).toISOString()
                }
            }
        });
    });

    // === LEGACY MATHEMATICS ENDPOINTS ===
    app.post('/api/v1/mathematics/generate', (req, res) => {
        console.log('📐 Legacy math generate request:', req.body);
        
        const { grade = 5, type = 'addition', difficulty = 'medium', count = 1, context } = req.body;
        
        // Convert legacy request to modern format
        const modernResponse = {
            id: `legacy_math_${Date.now()}`,
            subject: 'MATHEMATICS',
            grade: Number(grade),
            question: `Legacy ${type} question for grade ${grade}: What is the ${type} result?`,
            answer: `${Math.floor(Math.random() * 100) + 1}`,
            explanation: `This question was generated using legacy mathematics endpoint with ${difficulty} difficulty.`,
            difficulty: difficulty.toUpperCase(),
            format: 'CALCULATION',
            topic: type,
            metadata: {
                generated_at: new Date().toISOString(),
                source: 'legacy_math_generator',
                legacy_endpoint: true,
                relevance_score: Math.random() * 0.3 + 0.7, // 0.7-1.0 for legacy compat
                service_used: 'LegacyMathematicsService'
            }
        };

        // Return single question or array based on count
        if (count > 1) {
            const questions = [];
            for (let i = 0; i < count; i++) {
                questions.push({
                    ...modernResponse,
                    id: `legacy_math_${Date.now()}_${i}`,
                    question: `Legacy ${type} question ${i + 1} for grade ${grade}`,
                    answer: `${Math.floor(Math.random() * 100) + 1}`
                });
            }
            res.json(questions);
        } else {
            res.json(modernResponse);
        }
    });

    app.post('/api/v1/math/generate', (req, res) => {
        // Alternative legacy endpoint
        console.log('📐 Alternative legacy math generate request:', req.body);
        // Redirect to main legacy endpoint
        res.redirect(307, '/api/v1/mathematics/generate');
    });

    // === ROOT ENDPOINT ===
    app.get('/', (req, res) => {
        res.json({
            message: 'Learning Hub Educational Content API - Test Server',
            version: '2.1.0',
            status: 'running',
            swagger_documentation: swaggerSetupSuccess,
            features: [
                'Subject-agnostic content generation',
                'Vector database search with relevance scoring',
                'Comprehensive Swagger/OpenAPI documentation',
                'Mock data for testing and development'
            ],
            endpoints: {
                docs: '/api/v1/docs',
                alternative_docs: '/docs',
                health: '/api/v1/health',
                generate: '/api/v1/content/generate (POST)',
                search: '/api/v1/content/search',
                get_content: '/api/v1/content/{id}'
            },
            swagger_urls: [
                'http://localhost:3000/api/v1/docs',
                'http://localhost:3000/docs'
            ],
            test_examples: {
                generate_post: {
                    url: '/api/v1/content/generate',
                    body: {
                        subject: 'MATHEMATICS',
                        grade: 8,
                        topic: 'linear equations',
                        count: 2
                    }
                },
                search_get: '/api/v1/content/search?query=algebra&subject=MATHEMATICS&grade=8'
            }
        });
    });

    // === ERROR HANDLING ===
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            error: `Route ${req.method} ${req.originalUrl} not found`,
            suggestion: 'Visit /api/v1/docs for interactive API documentation',
            available_endpoints: [
                'GET /',
                'GET /api/v1/docs',
                'GET /api/v1/health',
                'POST /api/v1/content/generate',
                'GET /api/v1/content/search',
                'GET /api/v1/content/{id}'
            ]
        });
    });

    app.use((error, req, res, next) => {
        console.error('Server error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
            timestamp: new Date().toISOString()
        });
    });

    return app;
}

// === START SERVER ===
async function startServer() {
    const app = await createApp();
    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
        console.log('\n🌟 Learning Hub API Test Server Started!');
        console.log('=' .repeat(60));
        console.log(`📡 Server: http://localhost:${PORT}`);
        console.log(`📚 Swagger Documentation: http://localhost:${PORT}/api/v1/docs`);
        console.log(`📖 Alternative Docs: http://localhost:${PORT}/docs`);
        console.log(`💚 Health Check: http://localhost:${PORT}/api/v1/health`);
        console.log(`🎯 Test Generate: http://localhost:${PORT}/api/v1/content/generate`);
        console.log('=' .repeat(60));
        console.log('\n📋 Quick Test URLs:');
        console.log(`   • Main API Info: http://localhost:${PORT}/`);
        console.log(`   • Interactive Swagger: http://localhost:${PORT}/api/v1/docs`);
        console.log(`   • Health Status: http://localhost:${PORT}/health`);
        console.log(`   • Search Test: http://localhost:${PORT}/api/v1/content/search?query=algebra`);
        console.log('\n🚀 Ready for testing! Visit Swagger docs to explore the API!\\n');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('🛑 Shutting down server...');
        server.close(() => {
            console.log('✅ Server closed gracefully');
            process.exit(0);
        });
    });

    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, shutting down gracefully...');
        server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
        });
    });

    return server;
}

// Start if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
    startServer().catch(console.error);
}

export { createApp, startServer };