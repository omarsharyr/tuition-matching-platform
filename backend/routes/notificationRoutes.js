// backend/routes/notificationRoutes.js
import { Router } from "express";
import { protect, requireVerified } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  cleanupNotifications
} from "../controllers/notificationController.js";

const router = Router();

router.use(protect, requireVerified);

// Get user notifications
router.get("/", getNotifications);

// Mark notification as read
router.patch("/:id/read", markAsRead);

// Mark all notifications as read
router.patch("/read-all", markAllAsRead);

// Cleanup old notifications (admin only)
router.delete("/cleanup", cleanupNotifications);

export default router;
