# @learning-hub/core-api

Subject-agnostic educational platform API supporting Mathematics, Science, English, and Social Studies.

## 🎯 Overview

The Core API package provides a unified, subject-agnostic HTTP API for educational content management. It replaces the mathematics-only API with a scalable, multi-subject architecture while maintaining backward compatibility.

## 📚 Supported Subjects

-   **Mathematics** ✅ (Full implementation)
-   **Science** 🚧 (Planned)
-   **English** 🚧 (Planned)
-   **Social Studies** 🚧 (Planned)

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📡 API Endpoints

### Modern Subject-Agnostic Endpoints

#### Generate Educational Content

```http
POST /api/content/generate
Content-Type: application/json

{
  "subject": "mathematics",
  "grade": 5,
  "topic": "addition",
  "difficulty": "easy",
  "format": "calculation",
  "count": 1
}
```

#### Search Content

```http
GET /api/content/search?query=algebra&subject=mathematics&grade=8
```

#### Get Curriculum Info

```http
GET /api/content/curriculum/mathematics/6
```

#### Get Content by ID

```http
GET /api/content/123e4567-e89b-12d3-a456-426614174000
```

### Legacy Mathematics Endpoints (Backward Compatible)

#### Generate Math Question (Legacy)

```http
POST /api/content/math/generate
Content-Type: application/json

{
  "grade": 5,
  "type": "addition",
  "difficulty": "easy",
  "count": 1
}
```

## 🏗️ Architecture

### Subject-Agnostic Design

The API uses a delegation pattern to handle different subjects:

```typescript
// Subject-agnostic request
interface ContentGenerationRequest {
    subject: Subject;
    grade: number;
    topic: string;
    difficulty: DifficultyLevel;
    format: QuestionFormat;
    // ... other fields
}

// Delegated to subject-specific handlers
switch (request.subject) {
    case Subject.MATHEMATICS:
        return this.generateMathematicsContent(request);
    case Subject.SCIENCE:
        return this.generateScienceContent(request);
    // ... other subjects
}
```

### Extension Points

Adding new subjects follows a clear pattern:

1. **Add Subject Type**: Extend `Subject` enum in `@learning-hub/shared`
2. **Subject-Specific Data**: Add interface to `SubjectSpecificData`
3. **Handler Method**: Implement `generate{Subject}Content()` method
4. **Tests**: Add test cases for the new subject

## 🧪 Testing

### Test Structure

```bash
src/__tests__/
├── educational-content.controller.test.ts  # Controller tests
├── content.routes.test.ts                  # Route tests (future)
└── app.test.ts                            # Application tests (future)
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📦 Dependencies

### Runtime Dependencies

-   `express` - HTTP server framework
-   `cors` - Cross-origin resource sharing
-   `helmet` - Security middleware
-   `compression` - Response compression
-   `morgan` - HTTP request logging
-   `@learning-hub/shared` - Shared types and utilities

### Development Dependencies

-   `typescript` - TypeScript compiler
-   `jest` - Testing framework
-   `nodemon` - Development server
-   `ts-node` - TypeScript execution

## 🔧 Configuration

### Environment Variables

```bash
# Server configuration
PORT=3000
NODE_ENV=development

# CORS configuration
CORS_ORIGIN=*

# Database configuration (future)
# DATABASE_URL=...
```

## 🚀 Deployment

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

### Docker (Future)

```bash
docker build -t learning-hub-core-api .
docker run -p 3000:3000 learning-hub-core-api
```

## 📋 Migration from Legacy API

### Automatic Compatibility

The legacy mathematics API endpoints are automatically supported:

-   `POST /api/questions/generate` → `POST /api/content/math/generate`
-   All existing request/response formats preserved
-   No breaking changes for existing clients

### Migration Path

1. **Immediate**: Use legacy endpoints (fully supported)
2. **Recommended**: Migrate to subject-agnostic endpoints
3. **Future**: Legacy endpoints may be deprecated (with advance notice)

### Migration Example

**Legacy Format:**

```javascript
// Old mathematics-only request
POST /api/questions/generate
{
  "grade": 5,
  "type": "addition",
  "difficulty": "easy"
}
```

**Modern Format:**

```javascript
// New subject-agnostic request
POST /api/content/generate
{
  "subject": "mathematics",
  "grade": 5,
  "topic": "addition",
  "difficulty": "easy",
  "format": "calculation"
}
```

## 🎯 Future Enhancements

### Phase 3: Service Integration

-   Integrate with existing mathematics services
-   Connect to vector database for content search
-   Implement quality assurance workflows

### Phase 4: Subject Expansion

-   Science content generation
-   English language content
-   Social Studies curriculum

### Phase 5: Advanced Features

-   Personalized content recommendations
-   Adaptive difficulty adjustment
-   Multi-language support
-   Real-time collaboration

## 🤝 Contributing

### Adding New Subjects

1. **Define Subject Data Structure**

```typescript
interface NewSubjectData {
    subjectType: NewSubjectQuestionType;
    specificField: string;
    // ... other subject-specific fields
}
```

2. **Implement Content Generator**

```typescript
private async generateNewSubjectContent(
    request: ContentGenerationRequest
): Promise<ContentGenerationResponse> {
    // Implementation
}
```

3. **Add Tests**

```typescript
test("should generate new subject content", async () => {
    // Test implementation
});
```

4. **Update Documentation**

### Code Style

-   TypeScript strict mode
-   ESLint configuration
-   Prettier formatting
-   Comprehensive JSDoc comments

## 📚 Related Packages

-   `@learning-hub/shared` - Common types and utilities
-   `@learning-hub/question-engine` - Question generation logic
-   `@learning-hub/content-engine` - Content processing
-   `@learning-hub/curriculum-engine` - Curriculum alignment
-   `@learning-hub/vector-db` - Search and retrieval

---

**Package Version**: 2.0.0  
**Subject Support**: Mathematics (Full), Science/English/Social Studies (Planned)  
**API Compatibility**: Full backward compatibility with legacy mathematics API
