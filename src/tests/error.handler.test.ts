import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { ApiError, errorHandler } from "../utils/error.handler.js";
import { Request, Response, NextFunction } from "express";

describe("Error Handler", () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction;

    beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        nextFunction = jest.fn();
    });

    it("should handle ApiError correctly", () => {
        const apiError = new ApiError(400, "Bad Request", { field: "value" });

        errorHandler(
            apiError,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Bad Request",
            details: { field: "value" },
        });
    });

    it("should handle SyntaxError correctly", () => {
        const syntaxError = new SyntaxError("Invalid JSON");
        (syntaxError as any).body = "invalid json";

        errorHandler(
            syntaxError,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Invalid request body",
            details: "Invalid JSON",
        });
    });

    it("should handle unknown errors in development mode", () => {
        process.env.NODE_ENV = "development";
        const error = new Error("Unknown error");

        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Internal server error",
            details: "Unknown error",
        });
    });

    it("should handle unknown errors in production mode", () => {
        process.env.NODE_ENV = "production";
        const error = new Error("Unknown error");

        errorHandler(
            error,
            mockRequest as Request,
            mockResponse as Response,
            nextFunction
        );

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            error: "Internal server error",
            details: undefined,
        });
    });
});
