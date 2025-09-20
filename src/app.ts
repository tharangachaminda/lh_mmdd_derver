import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

// Health check endpoint
app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "OK" });
});

export { app };
