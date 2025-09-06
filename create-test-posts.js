// Test creating some sample tuition posts for testing
const mongoose = require('mongoose');
const TuitionPost = require('./backend/models/TuitionPost.js');
const User = require('./backend/models/User.js');

// Connect to MongoDB
mongoose.connect('mongodb+srv://tuition_user:MyPassword123!@cluster0.tjjdq6p.mongodb.net/tuitionPlatform?retryWrites=true&w=majority&appName=Cluster0');

async function createTestData() {
  try {
    // Find a student user or create one
    let student = await User.findOne({ role: 'student' });
    if (!student) {
      student = new User({
        name: 'Test Student',
        email: 'student@test.com',
        password: 'password123',
        role: 'student',
        isVerified: true,
        location: 'Dhaka'
      });
      await student.save();
      console.log('Created test student');
    }

    // Create some test tuition posts
    const testPosts = [
      {
        student: student._id,
        title: 'Mathematics Tutor Needed - Class 10',
        classLevel: 'Secondary',
        subjects: ['Mathematics'],
        location: 'Dhaka, Bangladesh',
        mode: 'In-person',
        medium: 'English',
        expectedPayment: 5000,
        description: 'Looking for an experienced mathematics tutor for Class 10 student. Need help with algebra and geometry.',
        requirements: 'Bachelor\'s degree in Mathematics or related field',
        preferredGender: 'Any',
        schedule: 'Weekends, 2 hours per day',
        status: 'posted'
      },
      {
        student: student._id,
        title: 'Physics and Chemistry - HSC Level',
        classLevel: 'Higher Secondary',
        subjects: ['Physics', 'Chemistry'],
        location: 'Chittagong, Bangladesh',
        mode: 'Online',
        medium: 'Bengali',
        expectedPayment: 8000,
        description: 'HSC student needs help with Physics and Chemistry. Preparing for university admission.',
        requirements: 'Experience with HSC syllabus required',
        preferredGender: 'Male',
        schedule: 'Weekdays evening, 3 hours per week',
        status: 'posted'
      },
      {
        student: student._id,
        title: 'English Literature Tutor - University Level',
        classLevel: 'University',
        subjects: ['English Literature'],
        location: 'Sylhet, Bangladesh',
        mode: 'Hybrid',
        medium: 'English',
        expectedPayment: 12000,
        description: 'University student needs help with English Literature course work and assignments.',
        requirements: 'Masters in English Literature preferred',
        preferredGender: 'Female',
        schedule: 'Flexible timing, 4 hours per week',
        status: 'posted'
      }
    ];

    // Check if posts already exist
    const existingPosts = await TuitionPost.countDocuments();
    if (existingPosts === 0) {
      await TuitionPost.insertMany(testPosts);
      console.log('Created 3 test tuition posts');
    } else {
      console.log(`Database already has ${existingPosts} tuition posts`);
    }

    console.log('Test data setup complete!');
  } catch (error) {
    console.error('Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestData();
