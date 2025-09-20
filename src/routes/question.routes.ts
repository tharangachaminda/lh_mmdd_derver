import { Router } from "express";
import { QuestionController } from "../controllers/question.controller";

const router = Router();
const questionController = new QuestionController();

// Question generation endpoint
router.get("/generate", questionController.generateQuestion);

// Answer validation endpoint
router.post("/validate", questionController.validateAnswer);

export default router;
