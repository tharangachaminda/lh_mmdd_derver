# Math Learning Hub

A comprehensive math learning application with LLM-powered question generation and complete user authentication for elementary school students.

## Features

### 🎓 Educational Features

-   Generates age-appropriate math questions using LLM
-   Supports multiple categories: addition, multiplication, division, and pattern recognition
-   Provides contextual learning based on curriculum standards
-   Adapts to student performance and learning pace

### 🔐 Authentication System

-   **User Management**: Student and Admin registration with role-based access
-   **JWT Authentication**: Secure token-based authentication with refresh tokens
-   **Password Security**: bcryptjs hashing with salt rounds
-   **Profile Management**: User profile access and management
-   **Role-based Authorization**: Separate access levels for students and administrators

### 🎨 Frontend Integration

-   **Angular Frontend**: Complete user interface with authentication flows
-   **Responsive Design**: Mobile-friendly registration and login forms
-   **Role-based Routing**: Automatic redirection based on user roles
-   **Dashboard Systems**: Separate dashboards for students and administrators

## Tech Stack

### Backend

-   **Framework**: Express.js with TypeScript
-   **Database**: MongoDB with Mongoose ODM
-   **Authentication**: JWT with bcryptjs password hashing
-   **Validation**: Zod schema validation
-   **LLM Provider**: Ollama REST API (default) with factory pattern support
-   **Vector Database**: OpenSearch for curriculum RAG and semantic search
-   **Architecture**: Factory pattern for flexible LLM provider switching
-   **Testing**: Jest with comprehensive TDD coverage

### Frontend

-   **Framework**: Angular 18+ with standalone components
-   **UI Library**: Angular Material
-   **State Management**: RxJS with BehaviorSubject patterns
-   **Routing**: Angular Router with guards for authentication
-   **HTTP Client**: Angular HttpClient with interceptors

### Development Tools

-   **TypeScript**: Full type safety across frontend and backend
-   **Development**: Hot reload with nodemon and Angular CLI
-   **Testing**: Jest for backend, Angular testing utilities for frontend

## Getting Started

### Prerequisites

-   Node.js (v14 or higher)
-   npm

### Installation

1. Clone the repository
2. Install dependencies:

    ```bash
    # Backend dependencies
    npm install

    # Frontend dependencies
    cd learning-hub-frontend
    npm install
    cd ..
    ```

3. Configure environment variables (create `.env` file):

    ```bash
    # Server Settings
    PORT=3000
    NODE_ENV=development

    # Database Configuration
    MONGODB_URI=mongodb://localhost:27017/learning-hub

    # JWT Authentication
    JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
    JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
    JWT_EXPIRES_IN=1h
    JWT_REFRESH_EXPIRES_IN=7d

    # Frontend Configuration
    FRONTEND_URL=http://localhost:4200

    # Ollama Configuration (Default LLM Provider)
    OLLAMA_BASE_URL=http://127.0.0.1:11434
    OLLAMA_MODEL_NAME=llama3.1:latest

    # OpenSearch Configuration (for RAG/Vector Database)
    OPENSEARCH_NODE=https://localhost:9200
    OPENSEARCH_USERNAME=admin
    OPENSEARCH_PASSWORD="your-opensearch-password"
    ```

4. Start MongoDB:

    ```bash
    # Using Docker
    docker run -d -p 27017:27017 --name mongodb mongo:latest

    # Or using local MongoDB installation
    mongod
    ```

### Development

#### Backend Development

Run the backend development server:

```bash
npm run dev
```

Server will start at: http://localhost:3000

#### Frontend Development

Run the Angular development server:

```bash
cd learning-hub-frontend
npm start
```

Frontend will start at: http://localhost:4200

#### Full Stack Development

For complete development with both servers:

```bash
# Terminal 1: Backend
npm run dev

# Terminal 2: Frontend
cd learning-hub-frontend && npm start
```

### API Endpoints

#### Authentication Endpoints

-   `POST /api/auth/register/student` - Student registration
-   `POST /api/auth/register/admin` - Admin registration (requires admin privileges)
-   `POST /api/auth/login` - User login
-   `GET /api/auth/profile` - Get user profile (requires authentication)
-   `POST /api/auth/logout` - User logout (requires authentication)
-   `POST /api/auth/refresh` - Refresh authentication token

#### Question Generation Endpoints

-   `GET /api/questions/generate` - Generate math questions
-   `GET /health` - Health check endpoint

### Testing

Run backend tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Build for production:

```bash
# Backend
npm run build

# Frontend
cd learning-hub-frontend
npm run build
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
