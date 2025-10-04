# Curriculum Data Package

Centralized package for curriculum data management, question ingestion, and vector database operations. This package consolidates all scattered curriculum-related files and provides a unified API for data operations.

## Overview

This package was created to address the scattered curriculum files throughout the repository by providing:

-   **Centralized Data Management**: Single location for all curriculum and question data operations
-   **Vector Database Integration**: Complete OpenSearch integration with vector similarity search
-   **Bulk Ingestion Pipeline**: Automated ingestion of existing question files from across the repository
-   **Curriculum Standards Management**: CRUD operations for curriculum standards and learning objectives
-   **Question-to-Curriculum Alignment**: AI-powered alignment of questions to curriculum objectives

## Package Structure

```
packages/curriculum-data/
├── src/
│   ├── services/           # Core services
│   │   ├── opensearch.service.ts       # OpenSearch integration
│   │   └── curriculum-data.service.ts  # Curriculum management
│   ├── vector-db/          # Vector database operations
│   │   ├── embedding.service.ts        # Embedding generation
│   │   └── vector-database.service.ts  # High-level vector operations
│   ├── ingestion/          # Data ingestion pipeline
│   │   └── bulk-question-ingester.ts   # Bulk question import
│   └── index.ts            # Main package exports
├── scripts/                # Utility scripts
│   ├── bulk-ingest.js      # Run bulk question ingestion
│   └── opensearch-status.js # Check OpenSearch health
├── data/                   # Data storage
│   ├── curriculum/         # Curriculum standards
│   └── questions/          # Question data
└── package.json
```

## Services

### OpenSearchService

Core service for all OpenSearch operations including vector database management, question indexing, and curriculum data storage.

```typescript
import { OpenSearchService } from "@learning-hub/curriculum-data";

const openSearchService = new OpenSearchService();
await openSearchService.initializeIndices();
```

### EmbeddingService

Service for generating vector embeddings using various providers (Ollama, OpenAI, HuggingFace).

```typescript
import { EmbeddingService } from "@learning-hub/curriculum-data";

const embeddingService = new EmbeddingService({
    provider: "ollama",
    model: "nomic-embed-text",
});

const embedding = await embeddingService.generateEmbedding("What is 2 + 2?");
```

### VectorDatabaseService

High-level service for vector database operations including similarity search and content recommendations.

```typescript
import { VectorDatabaseService } from "@learning-hub/curriculum-data";

const vectorDB = new VectorDatabaseService(openSearchService, embeddingService);
const similarQuestions = await vectorDB.findSimilarQuestions(
    "algebra problems",
    { k: 10 }
);
```

### BulkQuestionIngester

Service for ingesting questions from various sources including the scattered JSON files throughout the repository.

```typescript
import { BulkQuestionIngester } from "@learning-hub/curriculum-data";

const ingester = new BulkQuestionIngester(openSearchService, embeddingService);
const stats = await ingester.ingestExistingQuestions();
```

### CurriculumDataService

Service for managing curriculum data including objectives, learning outcomes, and educational standards.

```typescript
import { CurriculumDataService } from "@learning-hub/curriculum-data";

const curriculumService = new CurriculumDataService(
    openSearchService,
    embeddingService
);
const alignments = await curriculumService.alignQuestionToCurriculum(
    "What is photosynthesis?"
);
```

## Environment Configuration

Create a `.env` file in the project root with the following variables:

```env
# OpenSearch Configuration
OPENSEARCH_NODE=http://localhost:9200
OPENSEARCH_USERNAME=admin
OPENSEARCH_PASSWORD=admin
VECTOR_INDEX_NAME=enhanced_questions
VECTOR_DIMENSION=768

# Embedding Service Configuration
OLLAMA_BASE_URL=http://localhost:11434
OPENAI_API_KEY=your-openai-key-here

# Optional: Hugging Face
HUGGINGFACE_API_KEY=your-hf-key-here
```

## Getting Started

### 1. Install Dependencies

```bash
cd packages/curriculum-data
npm install
```

### 2. Build the Package

```bash
npm run build
```

### 3. Check OpenSearch Status

```bash
npm run opensearch:status
```

### 4. Run Bulk Ingestion

```bash
npm run questions:bulk-ingest
```

## Scripts

### Data Operations

-   `npm run data:ingest` - Run data ingestion pipeline
-   `npm run questions:bulk-ingest` - Bulk ingest existing questions
-   `npm run curriculum:import` - Import curriculum standards

### Vector Operations

-   `npm run vector:index` - Index questions for vector search
-   `npm run vector:search` - Test vector similarity search
-   `npm run vector:validate` - Validate vector operations

### OpenSearch Operations

-   `npm run opensearch:status` - Check cluster health
-   `npm run opensearch:backup` - Backup indices

### Development

-   `npm run build` - Build TypeScript to JavaScript
-   `npm run dev` - Development mode with watch
-   `npm run test` - Run tests
-   `npm run lint` - Lint code

## File Patterns Supported

The bulk ingester automatically detects and processes these file patterns:

-   `grade*-questions*.json` - Grade-specific question files
-   `grade*-template.json` - Question templates by grade
-   `curriculum-*.json` - Curriculum data files
-   `sample-curriculum-*.json` - Sample curriculum files
-   `**/question_bank/**/*.json` - Question bank files
-   `**/content/**/*.json` - Content files

## Data Formats

### Question Document Format

```typescript
interface QuestionDocument {
    id: string;
    subject: string;
    grade: number;
    topic: string;
    subtopic?: string;
    question: string;
    answer: string;
    explanation?: string;
    difficulty: "easy" | "medium" | "hard";
    format: "multiple_choice" | "short_answer" | "essay" | "calculation";
    keywords: string[];
    curriculumObjectives?: string[];
    embedding?: number[];
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        source: string;
        validated: boolean;
    };
}
```

### Curriculum Standard Format

```typescript
interface CurriculumStandard {
    id: string;
    framework: string;
    subject: string;
    grade: number;
    strand: string;
    objective: string;
    description: string;
    learningOutcomes: string[];
    prerequisites: string[];
    keywords: string[];
    difficulty: "basic" | "intermediate" | "advanced";
}
```

## Integration with Main Application

### Using in Core API

```typescript
// In packages/core-api/src/services/
import {
    OpenSearchService,
    VectorDatabaseService,
    CurriculumDataService,
} from "@learning-hub/curriculum-data";

// Initialize services
const openSearchService = new OpenSearchService();
const vectorService = new VectorDatabaseService(
    openSearchService,
    embeddingService
);
```

### Adding to Controllers

```typescript
// In your controllers
import { VectorDatabaseService } from "@learning-hub/curriculum-data";

class QuestionController {
    async findSimilarQuestions(req: Request, res: Response) {
        const { query } = req.body;
        const similar = await this.vectorService.findSimilarQuestions(query);
        res.json(similar);
    }
}
```

## Migration from Scattered Files

The package includes utilities to migrate from the existing scattered file structure:

1. **Grade 3-8 Questions**: Automatically detects `grade3-questions.json`, `grade4-template.json`, etc.
2. **Curriculum Batches**: Processes `curriculum-batch-grades3-8.json` and similar files
3. **Sample Data**: Includes `sample-curriculum-grade5.json` and other sample files
4. **Legacy Scripts**: Replaces individual `ingest-grade8-*.mjs` scripts with unified ingestion

## Monitoring and Health Checks

### OpenSearch Health

```bash
npm run opensearch:status
```

### Ingestion Statistics

```typescript
const stats = await ingester.ingestExistingQuestions();
console.log(`Processed: ${stats.processedQuestions}`);
console.log(`Failed: ${stats.failedQuestions}`);
console.log(
    `Success rate: ${(
        (stats.processedQuestions / stats.totalQuestions) *
        100
    ).toFixed(1)}%`
);
```

### Vector Search Performance

```typescript
const results = await vectorService.findSimilarQuestions("algebra", { k: 10 });
console.log(`Found ${results.length} similar questions in ${results.took}ms`);
```

## Error Handling

The package includes comprehensive error handling:

-   **Connection Issues**: Automatic retry with exponential backoff
-   **Data Validation**: Schema validation for all imported data
-   **Partial Failures**: Continues processing even if individual items fail
-   **Detailed Logging**: Complete audit trail of all operations

## Future Enhancements

-   [ ] Real-time question similarity suggestions
-   [ ] Curriculum gap analysis
-   [ ] Automated question generation based on curriculum
-   [ ] Learning path recommendations
-   [ ] Question difficulty prediction
-   [ ] Multi-language support

## Contributing

When adding new curriculum files or question sets:

1. Place files in the appropriate `data/` subdirectory
2. Follow the established naming conventions
3. Run validation scripts before committing
4. Update indices after adding new data

## Troubleshooting

### Common Issues

1. **OpenSearch Connection Failed**

    - Check if OpenSearch is running: `docker-compose up opensearch`
    - Verify environment variables in `.env`
    - Check network connectivity

2. **Embedding Generation Slow**

    - Consider using a local embedding model (Ollama)
    - Adjust batch sizes in ingestion config
    - Enable embedding caching

3. **High Memory Usage**

    - Reduce batch sizes for large datasets
    - Enable streaming for large file processing
    - Monitor OpenSearch heap usage

4. **Inconsistent Results**
    - Verify data normalization is working
    - Check embedding model consistency
    - Validate question format compliance

For more detailed troubleshooting, check the logs in `logs/` directory or enable debug mode in development.
