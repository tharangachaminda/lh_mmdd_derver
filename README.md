# Math Learning Hub

A math learning application backend powered by LLM for elementary school students.

## Features

-   Generates age-appropriate math questions using LLM
-   Supports multiple categories: addition, multiplication, division, and pattern recognition
-   Provides contextual learning based on curriculum standards
-   Adapts to student performance and learning pace

## Tech Stack

-   **Backend**: Express.js with TypeScript
-   **LLM Provider**: Ollama REST API (default) with factory pattern support
-   **Vector Database**: OpenSearch for curriculum RAG and semantic search
-   **Architecture**: Factory pattern for flexible LLM provider switching
-   **Testing**: Jest with comprehensive TDD coverage
-   **Optional**: LangChain & LangGraph for advanced workflows

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm

### Installation

1. Clone the repository
2. Install dependencies:
    ```bash
    npm install
    ```
3. Configure environment variables (create `.env` file):

    ```bash
    # Ollama Configuration (Default LLM Provider)
    OLLAMA_BASE_URL=http://127.0.0.1:11434  # Optional, defaults to local Ollama
    OLLAMA_MODEL_NAME=llama2                 # Optional, defaults to llama2

    # OpenSearch Configuration (for RAG/Vector Database)
    OPENSEARCH_NODE=http://localhost:9200   # Optional, defaults to local OpenSearch
    OPENSEARCH_USERNAME=admin               # Optional
    OPENSEARCH_PASSWORD=admin               # Optional

    # Legacy Configuration (no longer needed with Ollama default)
    # LLAMA_MODEL_PATH=/path/to/model.gguf  # Only if using LangChain directly
    ```

### Development

Run the development server:

```bash
npm run dev
```

### Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate test coverage:

```bash
npm run test:coverage
```

### Build

Build the project:

```bash
npm run build
```

Run the built version:

```bash
npm start
```

## Project Structure

```
src/
├── config/         # Configuration files
├── models/         # Data models
├── services/       # Business logic
├── controllers/    # Request handlers
├── routes/         # API routes
├── utils/          # Utilities
└── tests/          # Test files
```

## Development Approach

This project follows Test-Driven Development (TDD) principles:

1. Write failing tests first
2. Implement the minimum code to pass tests
3. Refactor while maintaining test coverage
