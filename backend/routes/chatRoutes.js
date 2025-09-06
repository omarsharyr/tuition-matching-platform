// backend/routes/chatRoutes.js
import { Router } from "express";
import { protect, requireVerified } from "../middleware/authMiddleware.js";
import {
  getChatRooms, createChatRoom, getChatRoom, sendMessage, getChatMessages
} from "../controllers/chatController.js";

const router = Router();

router.use(protect, requireVerified); // both roles can access their own chats

// Get all chat rooms for the user
router.get("/rooms", getChatRooms);

// Create a new chat room
router.post("/rooms", createChatRoom);

// Get specific chat room with messages - Updated routes for frontend compatibility
router.get("/:chatId", getChatRoom);

// Send message to chat room
router.post("/:chatId/message", sendMessage);

// Get messages (for real-time updates)
router.get("/:chatId/messages", getChatMessages);

export default router;
