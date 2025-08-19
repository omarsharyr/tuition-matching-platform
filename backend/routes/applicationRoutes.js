// backend/routes/applicationRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  applyToPost, tutorApplications, applicationsForPost, shortlist, select, reject,
} from "../controllers/applicationController.js";

const router = express.Router();

// tutor
router.post("/", protect, applyToPost);
router.get("/my", protect, tutorApplications);

// student
router.get("/post/:postId", protect, applicationsForPost);
router.patch("/:id/shortlist", protect, shortlist);
router.patch("/:id/select", protect, select);
router.patch("/:id/reject", protect, reject);

export default router;
