import express from "express";
import cors from "cors";
import authRouter from "./API/auth.js";
import jobsRouter from "./API/jobs.js";
import customersRouter from "./API/customers.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Api Routes with endpoints
app.use("/api/auth", authRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/customers", customersRouter);

// Home page route
app.get("/", (req, res) => {
  res.send({
    message: "Welcome to Doxa Cleaning llc API!",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      docs: "Coming Soon...",
    },
  });
});

// Route to make sure api is ACTUALLY working
app.get("/api/health", (req, res) => {
  res.send({
    message: "Doxa API is alive and well!",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

export default app;
