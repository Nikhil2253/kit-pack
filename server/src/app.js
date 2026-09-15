import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import kitRoutes from "./routes/kit.routes.js";
import generationRoutes from "./routes/generation.routes.js";
import builderRoutes from "./routes/builder.routes.js";
import practiceRoutes from "./routes/practice.routes.js";
import rateLimiter from "./utils/rateLimiter.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter());
app.use(errorHandler);

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "AI Interview Prep API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/kits", kitRoutes);
app.use("/api/generation", generationRoutes);
app.use("/api/builder", builderRoutes);
app.use("/api/practice", practiceRoutes);

export default app;