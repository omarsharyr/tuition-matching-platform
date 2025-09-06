// backend/routes/adminRoutes.js
import { Router } from "express";
import { protect, requireRole } from "../middleware/authMiddleware.js";
import {
  getVerificationQueue, verifyUser, rejectUser, getDashboardStats, getAllUsers, deleteUser,
  listPosts, deletePostAdmin, listApplications, cleanupApplicationConflicts
} from "../controllers/adminController.js";

const router = Router();

router.use(protect, requireRole("admin"));

// Verification management
router.get("/verification-queue", getVerificationQueue);
router.post("/users/:userId/verify", verifyUser);
router.post("/users/:userId/reject", rejectUser);

// Analytics and user management
router.get("/dashboard/stats", getDashboardStats);
router.get("/metrics", getDashboardStats); // Alias for frontend compatibility
router.get("/users", getAllUsers);
router.delete("/users/:userId", deleteUser);

// Legacy routes - keeping for backward compatibility
router.get("/users/pending", getVerificationQueue); // alias

// Content moderation
router.get("/posts", listPosts);
router.delete("/posts/:id", deletePostAdmin);
router.get("/applications", listApplications);

// Database cleanup (for fixing application conflicts)
router.post("/cleanup/applications", cleanupApplicationConflicts);

export default router;
