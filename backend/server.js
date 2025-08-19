// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import studentRoutes from "./routes/studentRoutes.js";         // NEW
import applicationRoutes from "./routes/applicationRoutes.js"; // NEW
import chatRoutes from "./routes/chatRoutes.js";               // NEW

import { notFound, errorHandler } from "./utils/errorHandler.js";

dotenv.config();

const app = express();

// ----- Paths (so we can serve /uploads regardless of where server starts) -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

// ----- CORS -----
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

// ----- Body parsers -----
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ----- Static: serve uploaded files (Multer saves here) -----
app.use("/uploads", express.static(uploadsDir));

// ----- Routes -----
app.use("/api/auth", authRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/student", studentRoutes);           // NEW
app.use("/api/applications", applicationRoutes);  // NEW
app.use("/api/chat", chatRoutes);                 // NEW

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Errors
app.use(notFound);
app.use(errorHandler);

// ----- DB + Start -----
const port = process.env.PORT || 5000;

// If your Node supports top‑level await, you can keep it simple:
// await connectDB(process.env.MONGO_URI);
// app.listen(port, () => console.log(`🚀 Server on :${port}`));

// Otherwise, use an async IIFE to avoid top‑level await issues:
(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`🚀 Server on :${port}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
