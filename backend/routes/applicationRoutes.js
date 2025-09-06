import { Router } from "express";
import { 
  applyToPost, 
  tutorApplications, 
  applicationsForPost, 
  shortlist, 
  reject, 
  select 
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Apply middleware to all routes
router.use(protect);

// Apply to a post (tutors)
router.post("/apply", applyToPost);

// Get tutor's applications
router.get("/tutor/applications", tutorApplications);

// Get applications for a specific post (students)
router.get("/posts/:postId/applications", applicationsForPost);

// Student actions on applications
router.patch("/:id/shortlist", shortlist);
router.patch("/:id/reject", reject);
router.patch("/:id/select", select);

// Test endpoint
router.get("/ping", (_req, res) => res.json({ ok: true }));

export default router;
