import cookieParser from "cookie-parser";
import express from "express";

import authRoutes from "./routes/auth.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(express.json({
  limit: "100kb",
}));

app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    service: "luxe-watch-api",
    status: "ok",
  });
});

app.use("/api/auth", authRoutes);

export default app;