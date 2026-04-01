import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { connectToDatabase } from "../src/config/db.js";
import authRoutes from "../src/routes/auth.js";
import categoryRoutes from "../src/routes/categories.js";
import unitRoutes from "../src/routes/units.js";
import itemRoutes from "../src/routes/items.js";
import purchaseRoutes from "../src/routes/purchases.js";
import reportRoutes from "../src/routes/reports.js";
import balanceRoutes from "../src/routes/balance.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Initialize database connection (cached for serverless)
let connectionPromise = null;

async function ensureDatabaseConnection() {
  if (!connectionPromise) {
    connectionPromise = connectToDatabase().catch((error) => {
      connectionPromise = null; // Reset on error to allow retry
      throw error;
    });
  } 
  return connectionPromise;
}

// Ensure database connection before handling requests
app.use(async (req, res, next) => {
  try {
    await ensureDatabaseConnection();
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({ message: "Database connection failed" });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/balance", balanceRoutes);

export default app;
