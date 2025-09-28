import { Router } from "express";
import { QuestionController } from "../controllers/question.controller.js";

const router = Router();
const questionController = new QuestionController();

// Question generation endpoint
router.post("/generate", questionController.generateQuestion);

// Answer validation endpoint
router.post("/validate", questionController.validateAnswer);

export default router;
