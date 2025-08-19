// backend/routes/studentRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPost, myPosts, updatePost, deletePost, browsePosts,
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/posts/browse", protect, browsePosts);    // tutors browse
router.post("/posts", protect, createPost);
router.get("/posts/my", protect, myPosts);
router.patch("/posts/:id", protect, updatePost);
router.delete("/posts/:id", protect, deletePost);

export default router;
