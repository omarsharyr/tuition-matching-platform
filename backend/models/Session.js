// backend/models/Session.js
import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "TuitionPost", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
    // Session details
    title: { type: String, required: true, maxlength: 100 },
    subject: { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    startTime: { type: String, required: true }, // "14:30"
    endTime: { type: String, required: true }, // "16:00"
    duration: { type: Number, required: true }, // in minutes
    
    // Location/Mode
    mode: {
      type: String,
      required: true,
      enum: ["student_home", "tutor_place", "online", "hybrid"]
    },
    location: { type: String }, // address for physical sessions
    meetingLink: { type: String }, // for online sessions
    
    // Session management
    status: {
      type: String,
      enum: ["proposed", "confirmed", "completed", "missed", "cancelled"],
      default: "proposed"
    },
    proposedBy: {
      type: String,
      enum: ["student", "tutor"],
      required: true
    },
    confirmedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    
    // Attendance
    studentAttendance: {
      type: String,
      enum: ["present", "absent", "late"],
      default: null
    },
    tutorAttendance: {
      type: String,
      enum: ["present", "absent", "late"],
      default: null
    },
    attendanceMarkedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    attendanceMarkedAt: { type: Date },
    
    // Session content
    topics: [{ type: String }],
    notes: { type: String, maxlength: 1000 },
    homework: { type: String, maxlength: 500 },
    
    // Payment
    rate: { type: Number }, // session rate
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    
    // Feedback
    studentRating: { type: Number, min: 1, max: 5 },
    tutorRating: { type: Number, min: 1, max: 5 },
    studentFeedback: { type: String, maxlength: 500 },
    tutorFeedback: { type: String, maxlength: 500 }
  },
  { timestamps: true }
);

// Indexes
SessionSchema.index({ post: 1, scheduledDate: 1 });
SessionSchema.index({ student: 1, scheduledDate: 1 });
SessionSchema.index({ tutor: 1, scheduledDate: 1 });
SessionSchema.index({ status: 1, scheduledDate: 1 });

// Prevent overlapping sessions for the same tutor
SessionSchema.index(
  { tutor: 1, scheduledDate: 1, startTime: 1 },
  { 
    unique: true,
    partialFilterExpression: { status: { $in: ["proposed", "confirmed"] } }
  }
);

const Session = mongoose.model("Session", SessionSchema);
export default Session;