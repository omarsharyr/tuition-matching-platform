// backend/models/Student.js
import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    
    // Personal Information
    phone: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    address: String,
    city: String,
    profileImage: String, // Cloudinary URL
    
    // Academic Information
    currentEducationLevel: String,
    institution: String,
    currentGrade: String,
    targetGrade: String,
    
    // Learning Preferences
    preferredSubjects: [String],
    weakSubjects: [String],
    preferredLocations: [String],
    preferredTeachingMode: [{ type: String, enum: ["online", "offline", "both"] }],
    preferredTutorGender: { type: String, enum: ["male", "female", "any"], default: "any" },
    budgetRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: "BDT" }
    },
    availability: {
      monday: { available: Boolean, timeSlots: [String] },
      tuesday: { available: Boolean, timeSlots: [String] },
      wednesday: { available: Boolean, timeSlots: [String] },
      thursday: { available: Boolean, timeSlots: [String] },
      friday: { available: Boolean, timeSlots: [String] },
      saturday: { available: Boolean, timeSlots: [String] },
      sunday: { available: Boolean, timeSlots: [String] }
    },
    
    // About Me
    bio: String,
    learningGoals: String,
    interests: [String],
    hobbies: [String],
    
    // Documents and Verification
    documents: {
      studentIdUrl: String,
      parentNidUrl: String,
      transcriptUrl: String,
    },
    
    // Legacy fields (for backward compatibility)
    location: String,
  },
  { timestamps: true }
);

export default mongoose.model("Student", studentSchema);
