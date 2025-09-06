// backend/models/TuitionPost.js
import mongoose from "mongoose";

const TuitionPostSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // creator
    
    // Step 1: Class & Subjects
    title: { type: String, required: true, minlength: 6, maxlength: 80 },
    educationLevel: { 
      type: String, 
      required: true,
      enum: ["Primary", "Secondary", "SSC", "HSC", "A-Levels", "O-Levels", "Admission", "Univ 1st-2nd yr", "Other"]
    },
    subjects: [{ type: String, trim: true, required: true }],
    syllabus: { 
      type: String,
      enum: ["Bangla", "English", "Edexcel", "Cambridge", "IB", "Madrasa", "Other"]
    },
    description: { type: String, maxlength: 600 },
    
    // Step 2: Location
    area: { type: String, required: true },
    exactAddress: { type: String }, // private, not shown to tutors
    teachingMode: { 
      type: String, 
      required: true,
      enum: ["student_home", "tutor_place", "online", "hybrid"]
    },
    
    // Step 3: Schedule
    daysPerWeek: { type: Number, required: true, min: 1, max: 7 },
    preferredDays: [{ 
      type: String,
      enum: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]
    }],
    preferredTimes: [{
      type: String,
      enum: ["morning", "afternoon", "evening", "night"]
    }],
    startDate: { type: Date },
    duration: { type: Number }, // in weeks
    
    // Step 4: Budget
    paymentType: { 
      type: String, 
      required: true,
      enum: ["hourly", "monthly", "per_session", "package"]
    },
    budgetAmount: { type: Number, required: true, min: 500, max: 200000 },
    currency: { type: String, default: "BDT" },
    paymentNotes: { type: String },
    
    // Step 5: Tutor Preferences
    preferredGender: { 
      type: String, 
      enum: ["any", "male", "female"], 
      default: "any" 
    },
    experience: { 
      type: String,
      enum: ["any", "0-1", "1-3", "3-5", "5+"],
      default: "any"
    },
    universityPreference: [{ type: String }],
    otherPreferences: { type: String },
    
    // Legacy fields (for backward compatibility)
    classLevel: { type: String }, // mapped from educationLevel
    medium: { type: String }, // mapped from syllabus
    mode: { type: String }, // mapped from teachingMode
    location: { type: String }, // mapped from area
    address: { type: String }, // mapped from exactAddress
    expectedPayment: { type: Number }, // mapped from budgetAmount
    notes: { type: String }, // mapped from description + paymentNotes
    days: [{ type: String }], // mapped from preferredDays
    timeSlots: [{ type: String }], // mapped from preferredTimes
    budget: {
      min: { type: Number },
      max: { type: Number },
      perSession: { type: Boolean, default: false }
    },
    
    // Geo location (for future enhancement)
    geo: {
      lat: { type: Number },
      lng: { type: Number }
    },

    // Status and Management
    status: { 
      type: String, 
      enum: ["draft", "active", "interviewing", "matched", "fulfilled", "closed", "archived"], 
      default: "active" 
    },
    isDraft: { type: Boolean, default: false },
    acceptedTutor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiresAt: { type: Date },
    applicationsCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }, // legacy field
  },
  { timestamps: true }
);

// Pre-save middleware to map new fields to legacy fields for backward compatibility
TuitionPostSchema.pre('save', function(next) {
  // Map new fields to legacy fields
  if (this.educationLevel) this.classLevel = this.educationLevel;
  if (this.syllabus) this.medium = this.syllabus === 'Bangla' ? 'Bangla' : 'English';
  if (this.teachingMode) {
    this.mode = this.teachingMode === 'online' ? 'online' : 'home';
  }
  if (this.area) this.location = this.area;
  if (this.exactAddress) this.address = this.exactAddress;
  if (this.budgetAmount) this.expectedPayment = this.budgetAmount;
  
  // Combine notes
  let combinedNotes = [];
  if (this.description) combinedNotes.push(this.description);
  if (this.paymentNotes) combinedNotes.push(`Payment: ${this.paymentNotes}`);
  this.notes = combinedNotes.join('. ');
  
  // Map days
  if (this.preferredDays && this.preferredDays.length > 0) {
    const dayMap = {
      saturday: 'Saturday', sunday: 'Sunday', monday: 'Monday',
      tuesday: 'Tuesday', wednesday: 'Wednesday', thursday: 'Thursday', friday: 'Friday'
    };
    this.days = this.preferredDays.map(day => dayMap[day]).filter(Boolean);
  }
  
  // Map time slots
  if (this.preferredTimes && this.preferredTimes.length > 0) {
    const timeMap = {
      morning: 'Morning (6 AM - 12 PM)',
      afternoon: 'Afternoon (12 PM - 5 PM)',
      evening: 'Evening (5 PM - 9 PM)',
      night: 'Night (9 PM - 11 PM)'
    };
    this.timeSlots = this.preferredTimes.map(time => timeMap[time]).filter(Boolean);
  }
  
  // Set budget range
  if (this.budgetAmount && this.paymentType) {
    this.budget = {
      min: this.budgetAmount,
      max: this.budgetAmount,
      perSession: this.paymentType === 'per_session' || this.paymentType === 'hourly'
    };
  }
  
  // Set status based on isDraft
  if (this.isDraft) {
    this.status = 'draft';
    this.isActive = false;
  } else {
    this.status = 'active';
    this.isActive = true;
  }
  
  next();
});

// Add indexes for search performance
TuitionPostSchema.index({ educationLevel: 1, subjects: 1, area: 1, status: 1 });
TuitionPostSchema.index({ student: 1, status: 1 });
TuitionPostSchema.index({ createdAt: -1 });
TuitionPostSchema.index({ area: 1, teachingMode: 1 });
TuitionPostSchema.index({ paymentType: 1, budgetAmount: 1 });

const TuitionPost = mongoose.model("TuitionPost", TuitionPostSchema);
export default TuitionPost;
