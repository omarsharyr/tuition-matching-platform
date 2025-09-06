// backend/models/Application.js
import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "TuitionPost", required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pitch: { type: String, default: "" }, // tutor's pitch/message
    proposedRate: { type: Number }, // tutor's proposed rate
    availability: [{ type: String }], // available time slots
    status: { 
      type: String, 
      enum: ["submitted", "shortlisted", "accepted", "rejected", "withdrawn"], 
      default: "submitted" 
    },
    shortlistedAt: { type: Date },
    responseMessage: { type: String }, // student's response message
  },
  { timestamps: true }
);

// prevent duplicate apply per tutor+post
ApplicationSchema.index({ post: 1, tutor: 1 }, { unique: true });
ApplicationSchema.index({ tutor: 1, status: 1 });
ApplicationSchema.index({ post: 1, status: 1 });

const Application = mongoose.model("Application", ApplicationSchema);
export default Application;
