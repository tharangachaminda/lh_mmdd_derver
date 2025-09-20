# Math Learning Hub - Project Plan and Dev Log

A math learning application backend powered by LLM for elementary school students, focusing on interactive and adaptive question generation.

## Structure

Units are organized chronologically with clear objectives:

-   01: Project Setup - Basic infrastructure and testing setup
-   02: Question Generation - Core question generation service
-   Upcoming units focus on LLM integration and API development

## About the Project

### What This Is

An intelligent math learning platform that:

-   Generates age-appropriate math questions using LLM
-   Adapts difficulty based on student performance
-   Provides contextual learning using curriculum standards
-   Supports multiple question types and learning paths

### Architecture

```
┌────────────────┐     ┌─────────────────┐     ┌───────────────┐
│  Express.js    │     │   LangChain +   │     │  OpenSearch   │
│   Backend      │ ─── │    LangGraph    │ ─── │  Vector DB    │
└────────────────┘     └─────────────────┘     └───────────────┘
         │                      │                      │
         │                      │                      │
         v                      v                      v
    API Routes          Question Generation      Curriculum RAG
    Test Suites        Learning Workflows     Context Retrieval
```

### Technical Stack

-   **Backend Framework**: Express.js with TypeScript
-   **LLM Integration**: LangChain, LangGraph with Llama model
-   **Vector Database**: OpenSearch for curriculum RAG
-   **Testing**: Jest with TDD approach
-   **Documentation**: MMDD methodology

## Project Status

### Overall Completion

20% - Basic infrastructure and question generation implemented

### Completed Features

1. Project Setup (Unit 01)

    - TypeScript + Express.js configuration
    - Testing infrastructure with Jest
    - Basic health check endpoint
    - Development environment setup

2. Question Generation (Unit 02)
    - Question models and types
    - Basic generation service
    - Grade-appropriate difficulty levels
    - Test coverage at 100%

## Units Implemented

### Completed Units

-   **01**: Project Setup - Basic project infrastructure and testing setup
-   **02**: Question Generation - Core question generation service implementation

### Units In Progress

#### 03. LangChain Integration

**Status:** Planning Phase

-   Designing LLM integration
-   Preparing question templates
-   Planning curriculum context integration

## Planned Units

-   **04**: OpenSearch Integration - Vector database setup and RAG implementation
-   **05**: API Layer - RESTful endpoints and validation
-   **06**: Learning Workflows - LangGraph implementation
-   **07**: Testing & Documentation - Comprehensive testing and API docs
-   **08**: Deployment & Monitoring - Production setup and monitoring

## Development Approach

Following Test-Driven Development (TDD) with MMDD methodology:

1. Write failing tests first
2. Implement minimum code to pass
3. Refactor while maintaining coverage
4. Document decisions and next steps
