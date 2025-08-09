const mongoose = require('mongoose');

const tutorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  university: {
    type: String,
    required: true,
  },
  subjects: {
    type: [String], // e.g., ['Math', 'English']
    required: true,
  },
  classes: {
    type: [String], // e.g., ['Class 5', 'Class 6']
    required: true,
  },
  location: {
    type: String, // e.g., 'Dhanmondi'
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Tutor', tutorSchema);
