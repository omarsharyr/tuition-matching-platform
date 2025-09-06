// backend/routes/tutorRoutes.js
import { Router } from "express";
import { protect, requireRole, requireVerified } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  getJobBoard, getJobDetails, applyToJob, updateApplication, withdrawApplication,
  getMyApplications, getMyJobs, getMyChats, getMyReviews, getDashboardStats,
  getProfile, updateProfile, updateProfileImage, getProfileCompletion,
  addWorkExperience, updateWorkExperience, deleteWorkExperience
} from "../controllers/tutorController.js";

const router = Router();

router.use(protect, requireRole("tutor"));

// Dashboard
router.get("/dashboard/stats", requireVerified, getDashboardStats);

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/image", upload.single('image'), updateProfileImage);
router.get("/profile/completion", getProfileCompletion);

// Work experience management
router.post("/profile/work-experience", addWorkExperience);
router.put("/profile/work-experience/:experienceId", updateWorkExperience);
router.delete("/profile/work-experience/:experienceId", deleteWorkExperience);

// Job browsing
router.get("/jobs", requireVerified, getJobBoard);
router.get("/jobs/:postId", requireVerified, getJobDetails);

// Applications
router.post("/jobs/:postId/apply", requireVerified, applyToJob);
router.put("/applications/:appId", requireVerified, updateApplication);
router.post("/applications/:appId/withdraw", requireVerified, withdrawApplication);
router.get("/applications", requireVerified, getMyApplications);

// Accepted work
router.get("/my-jobs", requireVerified, getMyJobs);

// Communication
router.get("/chats", requireVerified, getMyChats);

// Reviews
router.get("/reviews", requireVerified, getMyReviews);

export default router;
