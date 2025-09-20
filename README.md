# Math Learning Hub

A math learning application backend powered by LLM for elementary school students.

## Features

-   Generates age-appropriate math questions using LLM
-   Supports multiple categories: addition, multiplication, division, and pattern recognition
-   Provides contextual learning based on curriculum standards
-   Adapts to student performance and learning pace

## Tech Stack

-   Express.js with TypeScript
-   LangChain & LangGraph for LLM integration
-   OpenSearch for vector storage and RAG
-   Jest for testing

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
