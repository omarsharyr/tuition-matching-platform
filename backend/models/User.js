const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ["student", "tutor", "admin"], default: "student" },
  isVerified: { type: Boolean, default: false },

  // 🧑‍🎓 Student fields
  classLevel: { type: String },
  location: { type: String },
  subjectsNeeded: [{ type: String }],

  // 👨‍🏫 Tutor fields
  qualifications: { type: String },
  subjectsOffered: [{ type: String }],
  hourlyRate: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
