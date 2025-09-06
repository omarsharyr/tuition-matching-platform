// backend/middleware/uploadMiddleware.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists at project root: /uploads
const uploadsRoot = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsRoot)) {
  fs.mkdirSync(uploadsRoot, { recursive: true });
}

// Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsRoot);
  },
  filename: function (req, file, cb) {
    const safe = file.originalname.replace(/\s+/g, "_");
    const stamp = Date.now();
    cb(null, `${stamp}_${safe}`);
  },
});

// Basic type guard (pdf/images)
const fileFilter = (req, file, cb) => {
  const mimetype = (file.mimetype || "").toLowerCase();
  const ok =
    mimetype === "application/pdf" ||
    mimetype.startsWith("image/");
  if (!ok) return cb(new Error("Unsupported file type"), false);
  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
  },
});

// Convenience field map used in authRoutes (register)
export const registerUpload = upload.fields([
  // Common names you use on the frontend for BOTH roles
  { name: "studentId", maxCount: 1 },            // single
  { name: "parentNid", maxCount: 1 },            // student only (single)
  { name: "educationDocument", maxCount: 12 },   // multiple
]);
