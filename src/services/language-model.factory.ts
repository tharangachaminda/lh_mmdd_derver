import { ILanguageModel } from "../interfaces/language-model.interface.js";
import { LangChainService } from "./langchain.service.js";
import { OllamaLanguageModel } from "./ollama-language.service.js";

export enum LanguageModelType {
    LLAMA_CPP = "llama-cpp",
    OLLAMA = "ollama",
}

export class LanguageModelFactory {
    private static instance: LanguageModelFactory;

    private constructor() {}

    public static getInstance(): LanguageModelFactory {
        if (!LanguageModelFactory.instance) {
            LanguageModelFactory.instance = new LanguageModelFactory();
        }
        return LanguageModelFactory.instance;
    }

    public createModel(
        type: LanguageModelType = LanguageModelType.OLLAMA
    ): ILanguageModel {
        switch (type) {
            case LanguageModelType.OLLAMA:
                return OllamaLanguageModel.getInstance();
            case LanguageModelType.LLAMA_CPP:
            default:
                return LangChainService.getInstance();
        }
    }
}
