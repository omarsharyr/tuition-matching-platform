// backend/models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    chat: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Chat", 
      required: true 
    },
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    text: { 
      type: String, 
      required: true,
      maxlength: 1000
    },
    attachments: [{
      url: String,
      filename: String,
      type: String
    }],
    isRead: { 
      type: Boolean, 
      default: false 
    },
    readBy: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      readAt: { type: Date, default: Date.now }
    }],
    isEdited: { 
      type: Boolean, 
      default: false 
    },
    editHistory: [{
      previousText: String,
      editedAt: { type: Date, default: Date.now }
    }]
  },
  { 
    timestamps: true,
    // Automatically remove expired messages based on chat TTL
    index: { createdAt: 1 }
  }
);

// Index for efficient queries
MessageSchema.index({ chat: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ isRead: 1 });

// Virtual for checking if message is from current user
MessageSchema.virtual('isMine').get(function() {
  return this.sender.toString() === this.parent()?.currentUserId?.toString();
});

const Message = mongoose.model("Message", MessageSchema);
export default Message;
