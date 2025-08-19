const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true,
    trim: true
  },
  phone: { 
    type: String, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true, 
    minlength: 6 
  },
  role: { 
    type: String, 
    enum: ["student", "tutor", "admin"], 
    default: "student" 
  },
  isVerified: { 
    type: Boolean, 
    default: false 
  },
  status: { 
    type: String, 
    enum: ["ACTIVE", "BANNED", "DELETED"], 
    default: "ACTIVE" 
  },
  
  // Tutor-specific fields (optional)
  tutorProfile: {
    subjects: [{ type: String }],
    classRange: { type: String },
    locations: [{ type: String }],
    bio: { type: String }
  }
}, { timestamps: true });

// Create indexes
userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
