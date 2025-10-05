import { Router } from "express";
import { QuestionController } from "../controllers/question.controller.js";
import {
    testAgenticWorkflow,
    debugEnvironment,
} from "../controllers/debug.controller.js";

const router = Router();
const questionController = new QuestionController();

// Question generation endpoints
router.post("/generate", questionController.generateQuestion);
router.post(
    "/generate/simplified",
    questionController.generateQuestionsSimplified
);

// Question type information
router.get("/types", questionController.getAvailableTypes);

// Answer validation endpoint
router.post("/validate", questionController.validateAnswer);

// Debug endpoints
router.get("/test-agentic", testAgenticWorkflow);
router.get("/debug-env", debugEnvironment);

export default router;
