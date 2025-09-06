// backend/models/Notification.js
import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      required: true,
      enum: [
        // Student notifications
        "new_application",
        "tutor_withdraws",
        "interview_chat_opened",
        "new_interview_message",
        "acceptance_confirmation",
        "full_chat_opened",
        "schedule_created",
        "session_proposed",
        "session_confirmed",
        "session_changed",
        "session_cancelled",
        "session_starting_soon",
        "review_reminder",
        
        // Tutor notifications
        "shortlisted",
        "accepted",
        "rejected",
        "job_closed",
        "new_message_interview",
        "new_message_full",
        "session_proposed_tutor",
        "session_confirmed_tutor",
        "session_changed_tutor",
        "session_cancelled_tutor",
        "session_starting_soon_tutor",
        "review_received",
        
        // Admin notifications
        "new_user_verification",
        "verification_resubmitted",
        "dispute_reported"
      ]
    },
    title: { type: String, required: true, maxlength: 100 },
    message: { type: String, required: true, maxlength: 500 },
    data: {
      postId: { type: mongoose.Schema.Types.ObjectId, ref: "TuitionPost" },
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: "Application" },
      chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
      sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session" },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      actionUrl: { type: String } // URL to navigate when clicked
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    }
  },
  { timestamps: true }
);

// Indexes for efficient queries
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ type: 1, createdAt: -1 });

// Auto-delete old notifications after 90 days
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
