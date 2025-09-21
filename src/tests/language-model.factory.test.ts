import {
    LanguageModelFactory,
    LanguageModelType,
} from "../services/language-model.factory.js";
import { LangChainService } from "../services/langchain.service.js";
import { OllamaLanguageModel } from "../services/ollama-language.service.js";

describe("LanguageModelFactory", () => {
    let factory: LanguageModelFactory;

    beforeEach(() => {
        factory = LanguageModelFactory.getInstance();
    });

    it("should be a singleton", () => {
        const instance1 = LanguageModelFactory.getInstance();
        const instance2 = LanguageModelFactory.getInstance();
        expect(instance1).toBe(instance2);
    });

    it("should create LangChainService by default", () => {
        const model = factory.createModel();
        expect(model).toBeInstanceOf(LangChainService);
    });

    it("should create LangChainService when specified", () => {
        const model = factory.createModel(LanguageModelType.LLAMA_CPP);
        expect(model).toBeInstanceOf(LangChainService);
    });

    it("should create OllamaLanguageModel when specified", () => {
        const model = factory.createModel(LanguageModelType.OLLAMA);
        expect(model).toBeInstanceOf(OllamaLanguageModel);
    });
});
