import { LangChainService } from "./langchain.service.js";
import { OllamaLanguageModel } from "./ollama-language.service.js";
export var LanguageModelType;
(function (LanguageModelType) {
    LanguageModelType["LLAMA_CPP"] = "llama-cpp";
    LanguageModelType["OLLAMA"] = "ollama";
})(LanguageModelType || (LanguageModelType = {}));
export class LanguageModelFactory {
    constructor() { }
    static getInstance() {
        if (!LanguageModelFactory.instance) {
            LanguageModelFactory.instance = new LanguageModelFactory();
        }
        return LanguageModelFactory.instance;
    }
    createModel(type = LanguageModelType.OLLAMA) {
        switch (type) {
            case LanguageModelType.OLLAMA:
                return OllamaLanguageModel.getInstance();
            case LanguageModelType.LLAMA_CPP:
            default:
                return LangChainService.getInstance();
        }
    }
}
