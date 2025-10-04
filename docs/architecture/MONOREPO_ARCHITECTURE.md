# Learning Hub Monorepo Architecture

**Version**: 2.0.0  
**Architecture**: Subject-Agnostic Educational Platform  
**Last Updated**: 2025-10-04

## 🎯 Vision

Transform from a mathematics-focused application to a comprehensive, multi-subject educational platform that can scale to support Mathematics, Science, English, Social Studies, and future subjects.

## 🏗️ Architecture Overview

### Core Principles

1. **Subject Agnostic Core**: Common functionality that works across all subjects
2. **Subject-Specific Extensions**: Specialized handling for unique subject requirements
3. **Curriculum Flexibility**: Support for multiple educational frameworks (NZ, AU, UK, US)
4. **Scalable Content Organization**: Clear structure for adding new subjects and grades
5. **Shared Infrastructure**: Common services, utilities, and development tools

### Package Architecture

```
learning-hub-monorepo/
├── apps/                          # Application entry points
│   ├── web-ui/                    # Angular frontend (future)
│   └── api-gateway/               # Main API orchestration
├── packages/                      # Core business logic packages
│   ├── shared/                    # Common types, utilities, constants
│   ├── core-api/                  # Subject-agnostic API foundation
│   ├── question-engine/           # Question generation & management
│   ├── content-engine/            # Content generation & processing
│   ├── curriculum-engine/         # Curriculum alignment & standards
│   └── vector-db/                 # Vector database operations
├── content/                       # Subject-organized educational content
│   ├── mathematics/               # Current math content
│   ├── science/                   # Future expansion
│   ├── english/                   # Future expansion
│   └── social-studies/            # Future expansion
├── infrastructure/                # Deployment, monitoring, DevOps
├── tools/                         # Development tools, generators, migration
└── docs/                          # Architecture, API, subject documentation
```

## 📦 Package Responsibilities

### Core Packages

**`@learning-hub/shared`**

-   Common TypeScript types and interfaces
-   Shared utilities and constants
-   Educational domain models
-   Cross-package type definitions

**`@learning-hub/core-api`**

-   HTTP API endpoints and controllers
-   Authentication and authorization
-   Request/response handling
-   Subject-agnostic business logic

**`@learning-hub/question-engine`**

-   Question generation algorithms
-   Question storage and retrieval
-   Question validation and quality assurance
-   Subject-specific question formatters

**`@learning-hub/content-engine`**

-   Content generation workflows
-   Content processing and transformation
-   Multi-subject content validation
-   Content versioning and management

**`@learning-hub/curriculum-engine`**

-   Curriculum framework management
-   Standards alignment verification
-   Grade-level progression tracking
-   Subject-specific curriculum rules

**`@learning-hub/vector-db`**

-   Vector embedding generation
-   Semantic search operations
-   Content indexing and retrieval
-   Search result ranking and filtering

### Application Packages

**`apps/api-gateway`**

-   Main API entry point
-   Service orchestration
-   External integrations
-   Load balancing and routing

**`apps/web-ui`** (Future)

-   Angular frontend application
-   Subject-specific UI components
-   User authentication interface
-   Educational content presentation

## 🎓 Subject Support

### Current Support

-   **Mathematics**: Complete implementation with 11 curriculum phases
    -   Grade 3-8 comprehensive coverage
    -   New Zealand curriculum alignment
    -   Vector database integration

### Planned Support

-   **Science**: Physics, Chemistry, Biology, Earth Science
-   **English**: Reading, Writing, Grammar, Literature
-   **Social Studies**: History, Geography, Civics, Economics

### Extension Framework

Adding new subjects follows this pattern:

1. **Content Structure**: `content/{subject}/grade{X}/`
2. **Subject Types**: Add to `Subject` enum in shared types
3. **Specific Data**: Extend `SubjectSpecificData` interface
4. **Generators**: Create subject-specific content generators
5. **Curriculum**: Add curriculum framework mappings

## 🔄 Migration Strategy

### Phase 1: Foundation ✅

-   [x] Create monorepo structure
-   [x] Design subject-agnostic types
-   [x] Set up package architecture

### Phase 2: Core API Extraction (Next)

-   [ ] Extract current API to `core-api` package
-   [ ] Implement subject-agnostic controllers
-   [ ] Create educational domain services

### Phase 3: Content Engine

-   [ ] Generalize question generation
-   [ ] Create subject-specific generators
-   [ ] Implement content validation

### Phase 4: Content Migration

-   [ ] Move mathematics content to new structure
-   [ ] Update all import paths
-   [ ] Ensure backward compatibility

### Phase 5: Infrastructure & Tools

-   [ ] Move Docker setup to infrastructure
-   [ ] Create development tools
-   [ ] Set up monorepo build pipeline

## 🚀 Development Workflow

### Getting Started

```bash
# Install all dependencies
npm run bootstrap

# Start development environment
npm run dev

# Run all tests
npm run test

# Build all packages
npm run build

# Start infrastructure
npm run docker:up
```

### Adding New Subjects

```bash
# Generate new subject structure
npm run subjects:add -- --subject=science --grades=3,4,5,6,7,8

# Migrate existing content
npm run content:migrate -- --from=legacy --to=monorepo
```

## 📊 Success Metrics

### Technical Quality

-   ✅ Zero breaking changes during migration
-   ✅ 100% test coverage maintained
-   ✅ Type safety across all packages
-   ✅ Clear separation of concerns

### Scalability

-   ✅ Easy addition of new subjects
-   ✅ Flexible curriculum framework support
-   ✅ Maintainable package structure
-   ✅ Efficient shared infrastructure

### Developer Experience

-   ✅ Clear package responsibilities
-   ✅ Consistent development patterns
-   ✅ Comprehensive documentation
-   ✅ Automated tools and generators

---

**Architecture Status**: Foundation Complete ✅  
**Next Phase**: Core API Extraction  
**Estimated Completion**: 4-6 development sessions
