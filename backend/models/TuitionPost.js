// backend/models/TuitionPost.js
import mongoose from "mongoose";

const tuitionPostSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    classLevel: { type: String, required: true },
    subjects: { type: [String], default: [] },
    location: { type: String, required: true },
    schedule: String,
    payment: { type: Number, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model("TuitionPost", tuitionPostSchema);
