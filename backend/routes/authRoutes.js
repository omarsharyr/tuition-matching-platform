// backend/routes/authRoutes.js
import { Router } from "express";
import { registerUser, loginUser, getProfile, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { registerUpload } from "../middleware/uploadMiddleware.js";

const router = Router();

// REGISTER (multipart) — accepts studentId, parentNid, educationDocument
router.post("/register", registerUpload, registerUser);

// LOGIN
router.post("/login", loginUser);

// PROFILE (protected)
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

export default router;
