import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { authMiddleware, requireAuth } from "./middleware/auth";
import summaryRoutes from "./routes/summary";
import quickRoutes from "./routes/quick";
import coachRoutes from "./routes/coach";
import accountRoutes from "./routes/accounts";
import userRoutes from "./routes/user";
import categoryRoutes from "./routes/categories";
import transactionRoutes from "./routes/transactions";
import budgetRoutes from "./routes/budgets";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(authMiddleware);
app.use("/api", requireAuth);
app.use("/api/summary", summaryRoutes);
app.use("/api/quick", quickRoutes);
app.use("/api/coach", coachRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/user", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/budgets", budgetRoutes);

const PORT = process.env.PORT || 10000;
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Backend server listening on port ${PORT}`);
});

