/**
 * Swagger/OpenAPI Configuration for Learning Hub Educational Content API
 *
 * Comprehensive API documentation for the subject-agnostic educational content platform
 * supporting Mathematics, Science, English, and Social Studies.
 *
 * @fileoverview OpenAPI 3.0 specification and Swagger UI setup
 * @version 1.0.0 - Initial documentation for refactored API
 */

import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

/**
 * OpenAPI 3.0 Specification Options
 */
const swaggerOptions: swaggerJSDoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Learning Hub Educational Content API",
            version: "2.1.0",
            description: `
# Learning Hub Educational Content API

A comprehensive, subject-agnostic educational content generation and management platform for New Zealand curriculum.

## Features

### 🎯 **Subject-Agnostic Architecture**
- **Mathematics**: Advanced multi-agent question generation with vector database enhancement
- **Science**: Physics, Chemistry, Biology content (coming soon)  
- **English**: Literature, grammar, writing skills (coming soon)
- **Social Studies**: History, geography, civics (coming soon)

### 🧠 **AI-Powered Content Generation**
- **Vector Database Integration**: Enhanced relevance scoring for contextual content
- **Multi-Agent Workflows**: Advanced question generation with quality assurance
- **Adaptive Difficulty**: Automatic adjustment based on grade level and learning objectives
- **Real-World Context**: Application-based questions with practical examples

### 📊 **Analytics & Performance Monitoring**
- **Relevance Scoring**: Track vector database retrieval effectiveness (0-1 scale)
- **Quality Metrics**: Comprehensive content quality assessment
- **Service Performance**: Generation time, success rates, fallback usage
- **Learning Analytics**: Student engagement and learning outcome tracking

### 🔄 **Service Integration**
- **Backward Compatibility**: Seamless integration with existing mathematics services
- **Circuit Breaker Patterns**: Robust fallback mechanisms for service reliability
- **Performance Optimization**: Caching, batching, and optimized metadata calculations
- **Error Handling**: Graceful degradation with emergency fallback content

## Architecture

### Request Flow
1. **API Gateway** → Content validation and routing
2. **Subject Delegation** → Route to appropriate subject handler  
3. **Service Integration** → Connect to specialized generation services
4. **Vector Enhancement** → Retrieve and score relevant context
5. **Quality Assurance** → Validate and score generated content
6. **Response Assembly** → Format with comprehensive metadata

### Data Models
- **EducationalQuestion**: Standardized question format across all subjects
- **VectorContext**: Enhanced relevance scoring and retrieval metrics
- **ServiceMetadata**: Performance tracking and service attribution
- **CurriculumAlignment**: New Zealand curriculum framework compliance

## Authentication
Currently using development mode. Production deployment will include:
- API key authentication
- Rate limiting per client
- Role-based access control
- Audit logging

## Rate Limits
- **Development**: 100 requests/minute per IP
- **Production**: 1000 requests/minute per authenticated client
- **Bulk Generation**: Maximum 10 questions per request

## Support
For technical support and integration assistance:
- Email: support@learninghub.nz
- Documentation: https://docs.learninghub.nz
- GitHub: https://github.com/learninghub/api

---
*Built with ❤️ for New Zealand educators*
            `,
            contact: {
                name: "Learning Hub Development Team",
                email: "developers@learninghub.nz",
                url: "https://learninghub.nz",
            },
            license: {
                name: "MIT",
                url: "https://opensource.org/licenses/MIT",
            },
            termsOfService: "https://learninghub.nz/terms",
        },
        servers: [
            {
                url: "http://localhost:3000/api/v1",
                description: "Development server",
            },
            {
                url: "https://api.learninghub.nz/v1",
                description: "Production server",
            },
            {
                url: "https://staging-api.learninghub.nz/v1",
                description: "Staging server",
            },
        ],
        tags: [
            {
                name: "Content Generation",
                description:
                    "Subject-agnostic educational content generation endpoints",
            },
            {
                name: "Mathematics",
                description:
                    "Mathematics-specific content generation and management",
            },
            {
                name: "Science",
                description:
                    "Science content generation (Physics, Chemistry, Biology)",
            },
            {
                name: "English",
                description: "English language arts content generation",
            },
            {
                name: "Social Studies",
                description:
                    "Social studies content (History, Geography, Civics)",
            },
            {
                name: "Content Management",
                description:
                    "Content retrieval, search, and management operations",
            },
            {
                name: "Curriculum",
                description: "New Zealand curriculum information and alignment",
            },
            {
                name: "Analytics",
                description: "Performance metrics and learning analytics",
            },
            {
                name: "Legacy Support",
                description:
                    "Backward compatibility endpoints for existing integrations",
            },
        ],
        components: {
            schemas: {
                // Core Domain Models
                Subject: {
                    type: "string",
                    enum: [
                        "MATHEMATICS",
                        "SCIENCE",
                        "ENGLISH",
                        "SOCIAL_STUDIES",
                    ],
                    description: "Educational subject categories",
                },
                DifficultyLevel: {
                    type: "string",
                    enum: ["EASY", "MEDIUM", "HARD"],
                    description: "Content difficulty levels",
                },
                QuestionFormat: {
                    type: "string",
                    enum: [
                        "MULTIPLE_CHOICE",
                        "SHORT_ANSWER",
                        "ESSAY",
                        "CALCULATION",
                        "TRUE_FALSE",
                    ],
                    description: "Question presentation formats",
                },
                GradeLevel: {
                    type: "integer",
                    minimum: 1,
                    maximum: 13,
                    description: "New Zealand school grade levels (1-13)",
                },

                // Content Generation Models
                ContentGenerationRequest: {
                    type: "object",
                    required: [
                        "subject",
                        "grade",
                        "topic",
                        "difficulty",
                        "format",
                    ],
                    properties: {
                        subject: { $ref: "#/components/schemas/Subject" },
                        grade: { $ref: "#/components/schemas/GradeLevel" },
                        topic: {
                            type: "string",
                            description:
                                "Specific topic within the subject area",
                            example: "addition",
                        },
                        subtopic: {
                            type: "string",
                            description: "More specific subtopic (optional)",
                            example: "two-digit addition",
                        },
                        difficulty: {
                            $ref: "#/components/schemas/DifficultyLevel",
                        },
                        format: { $ref: "#/components/schemas/QuestionFormat" },
                        count: {
                            type: "integer",
                            minimum: 1,
                            maximum: 10,
                            default: 1,
                            description: "Number of questions to generate",
                        },
                        context: {
                            type: "string",
                            description:
                                "Additional context for question generation",
                            example: "real-world applications",
                        },
                        curriculum: {
                            type: "string",
                            default: "new_zealand",
                            description: "Curriculum framework to align with",
                        },
                        enhanceWithVectorDB: {
                            type: "boolean",
                            default: true,
                            description:
                                "Enable vector database enhancement for relevance",
                        },
                    },
                },

                // Enhanced Response Models with Vector Analytics
                VectorRetrievalMetrics: {
                    type: "object",
                    properties: {
                        totalRetrieved: {
                            type: "integer",
                            description:
                                "Total number of documents retrieved from vector database",
                        },
                        aboveThreshold: {
                            type: "integer",
                            description:
                                "Number of documents above relevance threshold",
                        },
                        relevanceThreshold: {
                            type: "number",
                            format: "float",
                            minimum: 0,
                            maximum: 1,
                            description:
                                "Relevance score threshold for quality filtering",
                        },
                        retrievalTime: {
                            type: "integer",
                            description:
                                "Vector database retrieval time in milliseconds",
                        },
                        contextSources: {
                            type: "array",
                            items: { type: "string" },
                            description:
                                "Sources of retrieved context documents",
                        },
                    },
                },

                VectorContext: {
                    type: "object",
                    properties: {
                        used: {
                            type: "boolean",
                            description:
                                "Whether vector database enhancement was used",
                        },
                        similarQuestionsFound: {
                            type: "integer",
                            description:
                                "Number of similar questions found in vector database",
                        },
                        curriculumAlignment: {
                            type: "boolean",
                            description:
                                "Whether content aligns with curriculum standards",
                        },
                        averageRelevanceScore: {
                            type: "number",
                            format: "float",
                            minimum: 0,
                            maximum: 1,
                            description:
                                "Average relevance score of retrieved context",
                        },
                        topRelevanceScore: {
                            type: "number",
                            format: "float",
                            minimum: 0,
                            maximum: 1,
                            description:
                                "Highest relevance score from vector retrieval",
                        },
                        retrievalMetrics: {
                            $ref: "#/components/schemas/VectorRetrievalMetrics",
                        },
                    },
                },

                ServiceIntegrationMetadata: {
                    type: "object",
                    properties: {
                        serviceUsed: {
                            type: "string",
                            description:
                                "Primary service used for content generation",
                        },
                        servicesUsed: {
                            type: "array",
                            items: { type: "string" },
                            description:
                                "All services involved in generation process",
                        },
                        totalQuestions: {
                            type: "integer",
                            description: "Total number of questions generated",
                        },
                        averageGenerationTime: {
                            type: "number",
                            description:
                                "Average generation time per question (ms)",
                        },
                        averageRelevanceScore: {
                            type: "number",
                            format: "float",
                            minimum: 0,
                            maximum: 1,
                            description:
                                "Average relevance score across all generated content",
                        },
                        fallbackUsed: {
                            type: "boolean",
                            description:
                                "Whether fallback service was used due to primary service failure",
                        },
                    },
                },

                ContentMetadata: {
                    type: "object",
                    properties: {
                        generationTime: {
                            type: "integer",
                            description:
                                "Total time taken for content generation (ms)",
                        },
                        qualityScore: {
                            type: "number",
                            format: "float",
                            minimum: 0,
                            maximum: 1,
                            description:
                                "AI-assessed quality score of generated content",
                        },
                        relevanceScore: {
                            type: "number",
                            format: "float",
                            minimum: 0,
                            maximum: 1,
                            description:
                                "Vector database relevance score for content context",
                        },
                        curriculumAlignment: {
                            type: "boolean",
                            description:
                                "Whether content aligns with specified curriculum",
                        },
                        vectorContext: {
                            $ref: "#/components/schemas/VectorContext",
                        },
                        serviceIntegration: {
                            $ref: "#/components/schemas/ServiceIntegrationMetadata",
                        },
                    },
                },

                // Educational Content Models
                EducationalQuestion: {
                    type: "object",
                    required: [
                        "id",
                        "subject",
                        "grade",
                        "title",
                        "question",
                        "answer",
                    ],
                    properties: {
                        id: {
                            type: "string",
                            description: "Unique identifier for the question",
                        },
                        subject: { $ref: "#/components/schemas/Subject" },
                        grade: { $ref: "#/components/schemas/GradeLevel" },
                        title: {
                            type: "string",
                            description: "Descriptive title for the question",
                        },
                        question: {
                            type: "string",
                            description: "The actual question text",
                        },
                        answer: {
                            type: "string",
                            description: "Correct answer or solution",
                        },
                        explanation: {
                            type: "string",
                            description: "Detailed explanation of the solution",
                        },
                        difficulty: {
                            $ref: "#/components/schemas/DifficultyLevel",
                        },
                        format: { $ref: "#/components/schemas/QuestionFormat" },
                        topic: {
                            type: "string",
                            description: "Primary topic area",
                        },
                        subtopic: {
                            type: "string",
                            description: "Specific subtopic",
                        },
                        framework: {
                            type: "string",
                            default: "new_zealand",
                            description: "Curriculum framework",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            description: "Question creation timestamp",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            description: "Last modification timestamp",
                        },
                        metadata: {
                            type: "object",
                            description:
                                "Additional metadata including service information and quality scores",
                        },
                    },
                },

                // Response Models
                ContentGenerationResponse: {
                    type: "object",
                    required: ["success"],
                    properties: {
                        success: {
                            type: "boolean",
                            description:
                                "Indicates if the operation was successful",
                        },
                        data: {
                            oneOf: [
                                {
                                    $ref: "#/components/schemas/EducationalQuestion",
                                },
                                {
                                    type: "array",
                                    items: {
                                        $ref: "#/components/schemas/EducationalQuestion",
                                    },
                                },
                            ],
                            description:
                                "Generated educational content (single question or array)",
                        },
                        metadata: {
                            $ref: "#/components/schemas/ContentMetadata",
                        },
                        error: {
                            type: "string",
                            description: "Error message if operation failed",
                        },
                    },
                },

                // Error Models
                ErrorResponse: {
                    type: "object",
                    required: ["success", "error"],
                    properties: {
                        success: {
                            type: "boolean",
                            enum: [false],
                            description: "Always false for error responses",
                        },
                        error: {
                            type: "string",
                            description: "Human-readable error message",
                        },
                        code: {
                            type: "string",
                            description: "Machine-readable error code",
                        },
                        details: {
                            type: "object",
                            description:
                                "Additional error context and debugging information",
                        },
                    },
                },

                // Search and Filtering Models
                ContentSearchRequest: {
                    type: "object",
                    required: ["query"],
                    properties: {
                        query: {
                            type: "string",
                            description: "Search query string",
                        },
                        subject: { $ref: "#/components/schemas/Subject" },
                        grade: { $ref: "#/components/schemas/GradeLevel" },
                        difficulty: {
                            $ref: "#/components/schemas/DifficultyLevel",
                        },
                        limit: {
                            type: "integer",
                            minimum: 1,
                            maximum: 50,
                            default: 10,
                            description: "Maximum number of results to return",
                        },
                        offset: {
                            type: "integer",
                            minimum: 0,
                            default: 0,
                            description:
                                "Number of results to skip (for pagination)",
                        },
                    },
                },

                // Curriculum Data Models
                QuestionDocument: {
                    type: "object",
                    description:
                        "Educational question document from curriculum database",
                    properties: {
                        id: {
                            type: "string",
                            description: "Unique question identifier",
                        },
                        question: {
                            type: "string",
                            description: "The question text",
                        },
                        content: {
                            type: "string",
                            description: "Additional question content",
                        },
                        subject: {
                            type: "string",
                            description: "Educational subject",
                        },
                        grade: {
                            type: "integer",
                            minimum: 1,
                            maximum: 13,
                            description: "Grade level",
                        },
                        topic: {
                            type: "string",
                            description: "Question topic",
                        },
                        subtopic: {
                            type: "string",
                            description: "Question subtopic",
                        },
                        difficulty: {
                            type: "string",
                            enum: ["easy", "medium", "hard"],
                            description: "Difficulty level",
                        },
                        format: {
                            type: "string",
                            description: "Question format/type",
                        },
                        answers: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            description: "Possible answers",
                        },
                        correctAnswer: {
                            type: "string",
                            description: "Correct answer",
                        },
                        explanation: {
                            type: "string",
                            description: "Answer explanation",
                        },
                        keywords: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            description: "Question keywords for search",
                        },
                        embedding: {
                            type: "array",
                            items: {
                                type: "number",
                            },
                            description:
                                "Vector embedding for similarity search",
                        },
                        metadata: {
                            type: "object",
                            description: "Additional question metadata",
                            properties: {
                                createdAt: {
                                    type: "string",
                                    format: "date-time",
                                },
                                updatedAt: {
                                    type: "string",
                                    format: "date-time",
                                },
                                source: {
                                    type: "string",
                                    description: "Data source",
                                },
                                validated: {
                                    type: "boolean",
                                    description:
                                        "Whether question has been validated",
                                },
                                qualityScore: {
                                    type: "number",
                                    minimum: 0,
                                    maximum: 1,
                                    description: "Quality assessment score",
                                },
                            },
                        },
                    },
                },
            },

            responses: {
                BadRequest: {
                    description: "Bad request - invalid parameters",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                            example: {
                                success: false,
                                error: "Invalid subject. Supported subjects: MATHEMATICS, SCIENCE, ENGLISH, SOCIAL_STUDIES",
                                code: "INVALID_SUBJECT",
                            },
                        },
                    },
                },
                InternalServerError: {
                    description: "Internal server error",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                            example: {
                                success: false,
                                error: "Internal server error during content generation",
                                code: "GENERATION_FAILED",
                            },
                        },
                    },
                },
                NotImplemented: {
                    description: "Feature not yet implemented",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse",
                            },
                            example: {
                                success: false,
                                error: "Science content generation not yet implemented",
                                code: "NOT_IMPLEMENTED",
                            },
                        },
                    },
                },
            },

            parameters: {
                SubjectParam: {
                    name: "subject",
                    in: "path",
                    required: true,
                    schema: { $ref: "#/components/schemas/Subject" },
                    description: "Educational subject",
                },
                GradeParam: {
                    name: "grade",
                    in: "path",
                    required: true,
                    schema: { $ref: "#/components/schemas/GradeLevel" },
                    description: "Grade level",
                },
                ContentIdParam: {
                    name: "id",
                    in: "path",
                    required: true,
                    schema: { type: "string" },
                    description: "Unique content identifier",
                },
            },
        },

        // Security Definitions (for future implementation)
        security: [
            {
                ApiKeyAuth: [],
            },
        ],
    },

    // API documentation sources
    apis: ["./src/controllers/*.ts", "./src/routes/*.ts", "./src/types/*.ts"],
};

/**
 * Generate OpenAPI specification
 */
export const swaggerSpec = swaggerJSDoc(swaggerOptions);

/**
 * Configure Swagger UI with custom styling and features
 */
export const swaggerUiOptions = {
    customCss: `
        .swagger-ui .topbar { display: none; }
        .swagger-ui .info .title { color: #2c3e50; }
        .swagger-ui .info .description { color: #34495e; }
        .swagger-ui .scheme-container { background: #ecf0f1; }
    `,
    customSiteTitle: "Learning Hub API Documentation",
    customfavIcon: "/favicon.ico",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        docExpansion: "list",
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        tryItOutEnabled: true,
    },
};

/**
 * Setup Swagger documentation for Express app
 */
export function setupSwagger(app: Express): void {
    // Serve OpenAPI spec as JSON
    app.get("/api/v1/docs/swagger.json", (req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.send(swaggerSpec);
    });

    // Serve Swagger UI
    app.use(
        "/api/v1/docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );

    // Alternative paths for convenience
    app.use(
        "/docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );
    app.use(
        "/api-docs",
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );

    console.log("📚 Swagger documentation available at:");
    console.log("   - http://localhost:3000/api/v1/docs");
    console.log("   - http://localhost:3000/docs");
    console.log("   - http://localhost:3000/api-docs");
    console.log(
        "   - OpenAPI spec: http://localhost:3000/api/v1/docs/swagger.json"
    );
}

export default {
    swaggerSpec,
    swaggerUiOptions,
    setupSwagger,
};
