// backend/models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    phone: String,
    location: String,
    preferredSubjects: [String],
    documents: {
      studentIdUrl: String,
      parentNidUrl: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
