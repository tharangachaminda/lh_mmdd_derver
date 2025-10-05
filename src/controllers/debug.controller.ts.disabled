import { Request, Response } from "express";
import { AgenticQuestionService } from "../services/agentic-question.service.js";
import { QuestionType, DifficultyLevel } from "../models/question.js";

/**
 * Debug endpoint to check environment variables
 */
export const testEnvironmentVariables = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const envInfo = {
            OLLAMA_MODEL_NAME: process.env.OLLAMA_MODEL_NAME,
            OLLAMA_ALTERNATIVE_MODEL: process.env.OLLAMA_ALTERNATIVE_MODEL,
            OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
        };

        res.json({
            success: true,
            environmentVariables: envInfo,
            message: "Environment variables check completed",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
            message: "Environment variables check failed",
        });
    }
};

/**
 * Debug endpoint to test agentic workflow directly
 */
export const testAgenticWorkflow = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        console.log("🧪 Testing Agentic Workflow...");

        const agenticService = new AgenticQuestionService();
        console.log("✅ AgenticQuestionService instantiated");

        // Get workflow info first
        const workflowInfo = agenticService.getWorkflowInfo();
        console.log("📊 Workflow Info:", JSON.stringify(workflowInfo, null, 2));

        // Test simple question generation
        console.log("🔄 Testing single question generation...");
        const singleResult = await agenticService.generateSingleQuestion({
            type: QuestionType.ADDITION,
            difficulty: DifficultyLevel.EASY,
            grade: 2,
        });

        console.log(
            "📝 Single Question Result:",
            JSON.stringify(singleResult, null, 2)
        );

        res.json({
            success: true,
            workflowInfo: workflowInfo,
            singleQuestionTest: singleResult,
            message: "Agentic workflow test completed successfully",
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        const errorStack =
            error instanceof Error ? error.stack : "No stack trace";

        console.error("❌ Agentic workflow test failed:", error);
        console.error("Stack trace:", errorStack);

        res.status(500).json({
            success: false,
            error: errorMessage,
            stack: errorStack,
            message: "Agentic workflow test failed",
        });
    }
};

export const debugEnvironment = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        // Reset the singleton to force reload with current env vars
        const { OllamaLanguageModel } = await import(
            "../services/ollama-language.service.js"
        );
        OllamaLanguageModel.resetInstance();

        const envVars = {
            OLLAMA_BASE_URL: process.env.OLLAMA_BASE_URL,
            OLLAMA_MODEL_NAME: process.env.OLLAMA_MODEL_NAME,
            OLLAMA_ALTERNATIVE_MODEL: process.env.OLLAMA_ALTERNATIVE_MODEL,
            NODE_ENV: process.env.NODE_ENV,
            PORT: process.env.PORT,
        };

        // Get fresh instance with current env vars
        const ollamaService = OllamaLanguageModel.getInstance();

        res.json({
            success: true,
            environmentVariables: envVars,
            message: "Environment debug complete. Singleton reset.",
        });
    } catch (error) {
        console.error("Environment debug error:", error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
