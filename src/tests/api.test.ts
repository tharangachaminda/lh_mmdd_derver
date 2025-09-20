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

        it("should return 400 for invalid grade", async () => {
            const response = await request(app)
                .get("/api/questions/generate")
                .query({ grade: "invalid" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
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
                    answer: 10, // This is a dummy answer
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

        it("should return 400 for missing answer", async () => {
            const response = await request(app)
                .post("/api/questions/validate")
                .send({ questionId: "123" });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });

        it("should return 400 for missing questionId", async () => {
            const response = await request(app)
                .post("/api/questions/validate")
                .send({ answer: 42 });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });

        it("should handle validation errors gracefully", async () => {
            const response = await request(app)
                .post("/api/questions/validate")
                .send({ questionId: "123", answer: "not a number" });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("correct", false);
        });
    });
});
