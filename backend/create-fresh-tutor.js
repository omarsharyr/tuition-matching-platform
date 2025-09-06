// Create a new test tutor
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Tutor from './models/Tutor.js';
import { config } from 'dotenv';

config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tuition-platform');
    console.log('✅ Mongo connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const createFreshTutor = async () => {
  await connectDB();
  
  try {
    const email = 'tutor2@test.com';
    
    // Delete if exists
    await User.findOneAndDelete({ email });
    
    // Create new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const user = new User({
      name: 'Fresh Test Tutor',
      email: email,
      password: hashedPassword,
      role: 'tutor',
      isVerified: true,
      verificationStatus: 'verified',
      location: {
        type: 'Point',
        coordinates: [90.3563, 23.7465] // Dhaka coordinates
      }
    });
    
    const savedUser = await user.save();
    
    // Create tutor profile
    const tutorProfile = new Tutor({
      user: savedUser._id,
      education: [{
        degree: 'Bachelor of Science',
        institution: 'Test University',
        year: '2020'
      }],
      subjects: ['Mathematics', 'Physics'],
      experience: '2 years',
      hourlyRate: 1000,
      availability: ['Monday', 'Tuesday', 'Wednesday']
    });
    
    await tutorProfile.save();
    
    console.log('✅ Created fresh tutor:', {
      id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      isVerified: savedUser.isVerified
    });
    
  } catch (error) {
    console.error('❌ Error creating tutor:', error);
  } finally {
    mongoose.connection.close();
  }
};

createFreshTutor();
