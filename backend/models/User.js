import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true },
    firstName: String, // Split name for better profile management
    lastName: String,
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["student", "tutor", "admin"], required: true },
    
    // Profile Enhancement
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    profileImage: String, // Cloudinary URL
    
    // Verification and Status
    isVerified: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verificationReason: { type: String }, // reason for rejection or notes
    status: {
      type: String,
      enum: ["PENDING_VERIFICATION", "ACTIVE", "BANNED", "DELETED"],
      default: "ACTIVE", // user is active but may not be verified
    },
    
    // Location
    city: { type: String },
    address: String,
    location: { // For geo-queries
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0]
      }
    },
    
    // Legacy and Media
    avatar: { type: String }, // URL to profile image (legacy)
    
    // Preferences and Settings
    preferences: {
      language: { type: String, default: "en" },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
      },
      privacy: {
        showPhone: { type: Boolean, default: false },
        showEmail: { type: Boolean, default: false },
        showLocation: { type: Boolean, default: true }
      }
    },
    
    // Activity Tracking
    lastActive: { type: Date, default: Date.now },
    loginCount: { type: Number, default: 0 },
    
    // Admin and Meta Information
    meta: {
      adminNote: { type: String, default: "" },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reviewedAt: { type: Date },
      source: { type: String, default: "web" }, // web, mobile, social
      referralCode: String,
      referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
  },
  { timestamps: true }
);

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ location: "2dsphere" }); // For geospatial queries

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`;
  }
  return this.name;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model("User", userSchema);
export default User;
