// backend/models/Application.js
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "TuitionPost", required: true, index: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    pitch: String,
    status: {
      type: String,
      enum: ["PENDING", "SHORTLISTED", "SELECTED_BY_STUDENT", "REJECTED"],
      default: "PENDING",
      index: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate applications by same tutor for same post
applicationSchema.index({ post: 1, tutor: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
