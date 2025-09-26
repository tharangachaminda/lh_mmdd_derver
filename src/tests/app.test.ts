import request from "supertest";
import { app } from "../app.js";

describe("Server Setup", () => {
    describe("Health Check", () => {
        it("should return 200 OK for health check endpoint", async () => {
            const response = await request(app).get("/health");
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("OK");
            expect(typeof response.body.timestamp).toBe("string");
        });

        it("should include server timestamp in health check response", async () => {
            const response = await request(app).get("/health");
            expect(response.body.timestamp).toBeDefined();
            expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
        });
    });

    describe("Error Handling", () => {
        it("should return 404 for non-existent routes", async () => {
            const response = await request(app).get("/non-existent-route");
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty("error");
        });

        it("should handle JSON parsing errors", async () => {
            const response = await request(app)
                .post("/health")
                .set("Content-Type", "application/json")
                .send('{"invalid": json}');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty("error");
        });
    });
});
