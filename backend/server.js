import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import tutorRoutes from "./routes/tutorRoutes.js";            // placeholder ok
import adminRoutes from "./routes/adminRoutes.js";

import studentRoutes from "./routes/studentRoutes.js";        // placeholder ok
import applicationRoutes from "./routes/applicationRoutes.js";// placeholder ok
import chatRoutes from "./routes/chatRoutes.js";              // placeholder ok
import notificationRoutes from "./routes/notificationRoutes.js";
import documentRoutes from "./routes/documentRoutes.js";

import { notFound, errorHandler } from "./utils/errorHandler.js";

dotenv.config();
const app = express();

// ----- Paths for static /uploads -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "..", "uploads");

// ----- CORS -----
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// Production-ready CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    // Allow vercel.app domains for production
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    // Allow specific frontend URL from environment
    if (origin === FRONTEND_URL) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// ----- Parsers -----
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// ----- Request Logging -----
app.use((req, res, next) => {
  console.log(`📡 ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ----- Static: uploaded files -----
app.use("/uploads", express.static(uploadsDir));

// ----- Routes -----
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working!", timestamp: new Date() });
});

app.use("/api/auth", authRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/student", studentRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/documents", documentRoutes);

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Errors
app.use(notFound);
app.use(errorHandler);

// ----- DB + Start -----
const port = process.env.PORT || 5000;
(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => console.log(`🚀 Server on :${port}`));
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
})();
