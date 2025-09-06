import mongoose from "mongoose";

const tutorSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    
    // Personal Information
    phone: { type: String, default: "" },
    dateOfBirth: Date,
    gender: { type: String, enum: ["male", "female", "other"] },
    address: String,
    city: String,
    profileImage: String, // Cloudinary URL
    
    // Professional Information
    education: { type: String, enum: ["bachelors", "masters", "phd", "diploma", "hsc", "alevel"] },
    institution: String,
    graduationYear: Number,
    currentStatus: { type: String, enum: ["student", "working_professional", "freelance_tutor"] },
    yearsOfExperience: String,
    professionalTitle: String,
    
    // Teaching Information
    subjects: [String],
    educationLevels: [String],
    preferredLocations: [String],
    teachingMode: [{ type: String, enum: ["online", "offline", "both"] }],
    hourlyRate: Number,
    currency: { type: String, default: "BDT" },
    languages: [String],
    
    // Availability Schedule
    availability: {
      monday: { available: { type: Boolean, default: false }, timeSlots: [String] },
      tuesday: { available: { type: Boolean, default: false }, timeSlots: [String] },
      wednesday: { available: { type: Boolean, default: false }, timeSlots: [String] },
      thursday: { available: { type: Boolean, default: false }, timeSlots: [String] },
      friday: { available: { type: Boolean, default: false }, timeSlots: [String] },
      saturday: { available: { type: Boolean, default: false }, timeSlots: [String] },
      sunday: { available: { type: Boolean, default: false }, timeSlots: [String] }
    },
    
    // Portfolio & Experience
    bio: String,
    teachingPhilosophy: String,
    achievements: String,
    certifications: [String],
    
    // Portfolio Items
    portfolio: {
      workExperience: [{
        title: String,
        institution: String,
        duration: String,
        description: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false }
      }],
      sampleWorks: [{
        title: String,
        description: String,
        fileUrl: String,
        fileType: String,
        uploadDate: { type: Date, default: Date.now }
      }],
      testimonials: [{
        studentName: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        date: { type: Date, default: Date.now },
        verified: { type: Boolean, default: false }
      }]
    },
    
    // Rating and Statistics
    rating: {
      average: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 }
    },
    
    // Verification and Status
    isVerified: { type: Boolean, default: false },
    verificationBadges: [{ type: String, enum: ["education", "identity", "phone", "email", "background"] }],
    
    // Teaching Statistics
    stats: {
      totalStudents: { type: Number, default: 0 },
      totalSessions: { type: Number, default: 0 },
      successRate: { type: Number, default: 0 },
      responseTime: { type: Number, default: 0 } // in minutes
    }
  },
  { timestamps: true }
);

// Indexes for better query performance
tutorSchema.index({ subjects: 1 });
tutorSchema.index({ educationLevels: 1 });
tutorSchema.index({ preferredLocations: 1 });
tutorSchema.index({ "rating.average": -1 });
tutorSchema.index({ hourlyRate: 1 });

const Tutor = mongoose.model("Tutor", tutorSchema);
export default Tutor;
