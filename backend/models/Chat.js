// backend/models/Chat.js
import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "TuitionPost", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    chatType: {
      type: String,
      enum: ["interview", "full"],
      default: "interview"
    },
    expiresAt: { type: Date }, // TTL for interview chats (7 days)
    isActive: { type: Boolean, default: true },
    lastMessage: {
      text: String,
      sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      createdAt: Date
    },
    // Chat participants info
    participants: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      lastSeenAt: { type: Date, default: Date.now },
      unreadCount: { type: Number, default: 0 }
    }]
  },
  { timestamps: true }
);

ChatSchema.index({ post: 1, student: 1, tutor: 1 }, { unique: true });
ChatSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL for interview chats

const Chat = mongoose.model("Chat", ChatSchema);
export default Chat;
