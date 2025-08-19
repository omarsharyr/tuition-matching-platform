// backend/routes/chatRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { myChats, getMessages, sendMessage } from "../controllers/chatController.js";

const router = express.Router();

router.get("/", protect, myChats);
router.get("/:chatId/messages", protect, getMessages);
router.post("/:chatId/messages", protect, sendMessage);

export default router;
