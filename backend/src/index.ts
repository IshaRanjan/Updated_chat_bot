import "dotenv/config";
import cors from "cors";
import express from "express";
import nodesRouter from "./routes/nodes";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const frontendOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: [frontendOrigin, "http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/nodes", nodesRouter);

app.listen(PORT, () => {
  console.log(`MoodScale FAQ API running on http://localhost:${PORT}`);
});
