// backend/routes/studentRoutes.js
import { Router } from "express";
import { protect, requireRole, requireVerified } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";
import {
  createPost, myPosts, getPost, updatePost, deletePost, getPostStatusCounts,
  getPostApplications, getAllApplications, shortlistApplication, acceptApplication, rejectApplication,
  markPostFulfilled, closePost, reopenPost, createReview, getDashboardStats, getKPIs, getActivityFeed, getRecommendations,
  getProfile, updateProfile, updateProfileImage, getProfileCompletion
} from "../controllers/studentController.js";

const router = Router();

router.use(protect, requireRole("student"));

// Dashboard
router.get("/dashboard/stats", requireVerified, getDashboardStats);
router.get("/kpis", requireVerified, getKPIs);
router.get("/activity", requireVerified, getActivityFeed);
router.get("/recommendations", requireVerified, getRecommendations);

// Profile management
router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/profile/image", upload.single('image'), updateProfileImage);
router.get("/profile/completion", getProfileCompletion);

// Posts management
router.post("/posts", requireVerified, createPost);
router.get("/posts", requireVerified, myPosts);
router.get("/posts/status-counts", requireVerified, getPostStatusCounts);
router.get("/posts/:id", requireVerified, getPost);
router.put("/posts/:id", requireVerified, updatePost);
router.delete("/posts/:id", requireVerified, deletePost);

// Applications for a post
router.get("/posts/:id/applications", requireVerified, getPostApplications);

// All applications across student's posts  
router.get("/applications", requireVerified, getAllApplications);

// Application decisions
router.post("/applications/:appId/shortlist", requireVerified, shortlistApplication);
router.post("/applications/:appId/accept", requireVerified, acceptApplication);
router.post("/applications/:appId/reject", requireVerified, rejectApplication);

// Post lifecycle
router.post("/posts/:id/fulfill", requireVerified, markPostFulfilled);
router.post("/posts/:id/close", requireVerified, closePost);
router.post("/posts/:id/reopen", requireVerified, reopenPost);

// Reviews
router.post("/posts/:postId/review", requireVerified, createReview);

export default router;
