// backend/routes/adminRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/adminMiddleware.js";
import {
  getPendingUsers, verifyUser, deleteApplicationByAdmin, deletePostByAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users/pending", protect, isAdmin, getPendingUsers);
router.patch("/users/:id/verify", protect, isAdmin, verifyUser);
router.delete("/applications/:applicationId", protect, isAdmin, deleteApplicationByAdmin);
router.delete("/posts/:postId", protect, isAdmin, deletePostByAdmin);

export default router;
