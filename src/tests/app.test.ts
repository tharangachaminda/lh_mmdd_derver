import request from "supertest";
import { app } from "../app";

describe("Server Setup", () => {
    it("should return 200 OK for health check endpoint", async () => {
        const response = await request(app).get("/health");
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: "OK" });
    });
});
