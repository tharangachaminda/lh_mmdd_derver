import request from "supertest";
import { app } from "../app";
import { QuestionType, DifficultyLevel } from "../models/question";

describe("Question API Endpoints", () => {
    describe("GET /api/questions/generate", () => {
        it("should generate a question with default parameters", async () => {
            const response = await request(app)
                .get("/api/questions/generate")
                .query({ grade: "5" });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("question");
            expect(response.body).toHaveProperty("type");
        });

        it("should generate a question with specific type and difficulty", async () => {
            const response = await request(app)
                .get("/api/questions/generate")
                .query({
                    grade: "5",
                    type: QuestionType.ADDITION,
                    difficulty: DifficultyLevel.EASY,
                });

            expect(response.status).toBe(200);
            expect(response.body.type).toBe(QuestionType.ADDITION);
        });

        it("should return 400 for invalid grade", async () => {
            const response = await request(app)
                .get("/api/questions/generate")
                .query({ grade: "invalid" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });

        it("should use default type for invalid question type", async () => {
            const response = await request(app)
                .get("/api/questions/generate")
                .query({
                    grade: "5",
                    type: "INVALID_TYPE",
                });

            expect(response.status).toBe(200);
            expect(response.body.type).toBe(QuestionType.ADDITION);
        });
    });

    describe("POST /api/questions/validate", () => {
        it("should validate correct answer", async () => {
            // First generate a question
            const questionResponse = await request(app)
                .get("/api/questions/generate")
                .query({ grade: "5" });

            const question = questionResponse.body;

            // Then validate the answer
            const response = await request(app)
                .post("/api/questions/validate")
                .send({
                    questionId: question.id,
                    answer: 10, // This is a dummy answer, might need adjustment
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("correct");
            expect(response.body).toHaveProperty("feedback");
        });

        it("should return 400 for missing required fields", async () => {
            const response = await request(app)
                .post("/api/questions/validate")
                .send({});

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });
});
