# LLM Provider Migration Guide

## Overview

This document describes the migration from local model files (LangChain + node-llama-cpp) to Ollama REST API as the default LLM provider, completed on 2025-09-26.

## What Changed

### Before (Legacy Architecture)

```typescript
// Direct imports and model file dependencies
import { LangChainService } from "./langchain.service.js";

class CurriculumDataService {
    private readonly langchainService: LangChainService;

    constructor(client, langchainService?: LangChainService) {
        this.langchainService =
            langchainService || LangChainService.getInstance();
    }
}

// Required environment variable
LLAMA_MODEL_PATH = /path/ot / model.gguf;
```

### After (New Architecture)

```typescript
// Factory pattern with interface abstraction
import { LanguageModelFactory } from "./language-model.factory.js";
import { ILanguageModel } from "../interfaces/language-model.interface.js";

class CurriculumDataService {
    private readonly langchainService: ILanguageModel;

    constructor(client, langchainService?: ILanguageModel) {
        this.langchainService = langchainService ||
            LanguageModelFactory.getInstance().createModel(); // Defaults to Ollama
    }
}

// Optional environment variables (have defaults)
OLLAMA_BASE_URL=http://127.0.0.1:11434  # Default
OLLAMA_MODEL_NAME=llama2                 # Default
```

## Benefits

### ✅ Improved Architecture

-   **Factory Pattern**: Easy switching between LLM providers
-   **Dependency Injection**: Better testability and flexibility
-   **Interface Abstraction**: Services depend on interface, not concrete implementation

### ✅ Operational Improvements

-   **No Model Files**: No need to download and manage large model files locally
-   **REST API**: Ollama manages model loading, GPU/CPU optimization
-   **Scalability**: Ollama can handle multiple concurrent requests
-   **Updates**: Easy model updates through Ollama without code changes

### ✅ Development Experience

-   **Faster Setup**: No model file downloads required
-   **Environment Flexibility**: Same code works with different Ollama models
-   **Better Testing**: Mock interfaces easier than file dependencies

## Migration Steps (Already Completed)

### 1. Factory Default Change

```typescript
// language-model.factory.ts
public createModel(
    type: LanguageModelType = LanguageModelType.OLLAMA  // Changed from LLAMA_CPP
): ILanguageModel
```

### 2. Service Dependencies Updated

-   `CurriculumDataService`: Now uses factory + ILanguageModel interface
-   `QuestionGenerationService`: Now uses factory + ILanguageModel interface

### 3. Tests Updated

-   Added factory usage validation tests
-   Confirmed Ollama integration tests pass
-   Legacy LangChain tests remain (for backward compatibility)

## Environment Configuration

### New Setup (Ollama - Default)

```bash
# Optional - all have sensible defaults
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL_NAME=llama2

# Start Ollama server
ollama serve

# Pull your preferred model
ollama pull llama2
```

### Legacy Setup (Still Supported)

```bash
# Only needed if explicitly using LangChain provider
LLAMA_MODEL_PATH=/path/to/your/model.gguf

# Use LangChain explicitly
const factory = LanguageModelFactory.getInstance();
const model = factory.createModel(LanguageModelType.LLAMA_CPP);
```

## RAG Architecture Preserved

### Vector Database (Unchanged)

-   ✅ OpenSearch integration intact
-   ✅ Embedding generation still functional
-   ✅ Similarity search operations preserved
-   ✅ KNN vector mappings maintained

### RAG Workflow (Unchanged)

1. **Retrieve**: `searchSimilarContent()` uses vector embeddings
2. **Augment**: Context from OpenSearch curriculum database
3. **Generate**: LLM response (now via Ollama REST API)

### LangChain Support (Optional)

-   🔄 Can still use LangChain for workflow orchestration
-   🔄 RAG patterns work with any ILanguageModel implementation
-   🔄 Only base provider changed (file → REST API)

## Switching Between Providers

### Runtime Switching

```typescript
import {
    LanguageModelFactory,
    LanguageModelType,
} from "./language-model.factory.js";

// Use Ollama (default)
const ollamaModel = factory.createModel(); // or LanguageModelType.OLLAMA

// Use LangChain (if model files available)
const langchainModel = factory.createModel(LanguageModelType.LLAMA_CPP);

// Pass to services
const curriculumService = new CurriculumDataService(client, ollamaModel);
```

### Environment-Based Switching

```typescript
// Could be added in future
const modelType =
    process.env.LLM_PROVIDER === "langchain"
        ? LanguageModelType.LLAMA_CPP
        : LanguageModelType.OLLAMA;

const model = factory.createModel(modelType);
```

## Testing Strategy

### Current Test Coverage

-   ✅ Factory pattern tests
-   ✅ Ollama service tests (comprehensive)
-   ✅ Service constructor tests (validate factory usage)
-   🔶 Legacy LangChain tests (expected to fail without model files)

### Test Commands

```bash
# Test new architecture
npm test -- --testNamePattern="factory|ollama"

# Test specific services
npm test -- curriculumData.test.ts questionGeneration.test.ts

# Full test suite
npm test
```

## Troubleshooting

### Ollama Connection Issues

```bash
# Check Ollama server
curl http://127.0.0.1:11434/api/tags

# Check model availability
ollama list

# Pull model if needed
ollama pull llama2
```

### Switching Back to LangChain

1. Set model path: `LLAMA_MODEL_PATH=/path/to/model.gguf`
2. Change factory default back to `LLAMA_CPP`
3. Or explicitly use: `factory.createModel(LanguageModelType.LLAMA_CPP)`

## Future Considerations

### Potential Additions

-   Environment-based provider selection
-   Configuration validation on startup
-   Health check endpoints for LLM providers
-   Performance monitoring and metrics
-   Support for additional providers (OpenAI, Anthropic, etc.)

### Architecture Benefits

The factory pattern makes it easy to add new providers:

```typescript
enum LanguageModelType {
    LLAMA_CPP = "llama-cpp",
    OLLAMA = "ollama",
    OPENAI = "openai", // Future
    ANTHROPIC = "anthropic", // Future
}
```

---

**Migration completed**: 2025-09-26  
**Work Item**: LS-OPENSEARCH  
**TDD Approach**: Red-Green-Refactor methodology followed  
**Test Coverage**: All critical paths validated
