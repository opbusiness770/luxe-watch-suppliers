import express from "express";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    service: "luxe-watch-api",
    status: "ok",
  });
});

export default app;