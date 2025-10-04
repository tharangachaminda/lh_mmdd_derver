# Educational Platform Monorepo Refactoring Analysis

**Work Item**: LS-REFACTOR-CODEBASE  
**Date**: 2025-10-04  
**Objective**: Transform mathematics-focused codebase to subject-agnostic educational platform

## 🔍 Current State Analysis

### Mathematics-Specific Components (Need Generalization)

-   `src/models/question.ts` - Hardcoded math question types
-   `question_bank/` - Mathematics-only datasets
-   Test files with math-specific assertions
-   Ingestion scripts focused on math curriculum
-   Documentation referencing only mathematics

### Subject-Agnostic Components (Can Be Reused)

-   `src/services/opensearch.service.ts` - Generic vector operations
-   `src/controllers/` - HTTP request handling (adaptable)
-   Docker infrastructure
-   Testing framework setup
-   MMDD session logging system

### Files Requiring Major Transformation

1. **Models** (`src/models/question.ts`)

    - Current: Math-specific enums (ADDITION, SUBTRACTION, etc.)
    - Target: Subject-agnostic base with subject extensions

2. **Question Bank** (`question_bank/`)

    - Current: `grade*/` with math questions only
    - Target: `subjects/mathematics/grade*/` structure

3. **Services** (`src/services/`)

    - Current: Math curriculum service
    - Target: Generic curriculum engine with subject plugins

4. **Tests** (`src/tests/`)
    - Current: Math-specific validations
    - Target: Subject-agnostic test patterns with math examples

## 🎯 Target Architecture: Subject-Agnostic Educational Platform

### Core Principles

-   **Subject Extensibility**: Easy addition of new subjects
-   **Curriculum Flexibility**: Support multiple educational frameworks
-   **Content Scalability**: Structured growth across subjects and grades
-   **Shared Infrastructure**: Common services across all subjects

### Package Structure Design

```
learning-hub-monorepo/
├── apps/
│   ├── web-ui/                    # Angular frontend (future)
│   └── api-gateway/               # Main API orchestration
├── packages/
│   ├── core-api/                  # Subject-agnostic educational API
│   ├── content-engine/            # Multi-subject content generation
│   ├── question-engine/           # Generic question management
│   ├── curriculum-engine/         # Curriculum alignment & standards
│   ├── vector-db/                 # Educational content search
│   └── shared/                    # Common types & utilities
├── content/                       # Subject-organized datasets
│   ├── mathematics/               # Current math content
│   ├── science/                   # Future expansion
│   ├── english/                   # Future expansion
│   └── social-studies/            # Future expansion
├── infrastructure/                # Deployment & monitoring
├── tools/                         # Build tools & generators
└── docs/                          # Architecture & API docs
```

## 🚀 Migration Strategy

### Phase 1: Foundation (Current)

-   Create monorepo structure
-   Design subject-agnostic models
-   Plan content organization

### Phase 2: Core API Package

-   Extract and generalize current API
-   Implement subject-agnostic question models
-   Create educational framework types

### Phase 3: Content Engine Package

-   Generalize question generation
-   Create subject-specific generators
-   Implement curriculum alignment

### Phase 4: Content Migration

-   Reorganize mathematics content
-   Prepare structure for new subjects
-   Update all references

### Phase 5: Infrastructure & Tools

-   Move Docker setup to infrastructure package
-   Create development tools
-   Set up build pipeline

## 📊 Success Metrics

### Technical Goals

-   ✅ Subject-agnostic core API
-   ✅ Mathematics content fully migrated
-   ✅ Test coverage maintained (100%)
-   ✅ Zero breaking changes to existing functionality
-   ✅ Clear path for new subject addition

### Architectural Quality

-   ✅ Separation of concerns by subject
-   ✅ Shared infrastructure efficiency
-   ✅ Modular package design
-   ✅ Scalable content organization
-   ✅ Maintainable codebase structure

## 🎯 Immediate Next Steps

1. **Create Package Directories**: Set up monorepo structure
2. **Design Subject Model**: Create educational domain models
3. **Extract Core API**: Begin API generalization
4. **Test Migration**: Maintain 100% test coverage
5. **Content Reorganization**: Restructure mathematics content

---

**MMDD Phase**: Analysis Complete ✅  
**Next Phase**: Foundation Setup  
**Estimated Duration**: 4-6 hours total refactoring
