import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

async function createTestStudent() {
  try {
    await connectDB(process.env.MONGO_URI);
    
    console.log('🧪 Creating/Updating Test Student Account...\n');
    
    const email = 'teststudent@example.com';
    const password = 'testpass123';
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Update or create the test student
    const testStudent = await User.findOneAndUpdate(
      { email: email },
      {
        name: 'Test Student',
        email: email,
        password: hashedPassword,
        role: 'student',
        isVerified: true
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true 
      }
    );
    
    console.log('✅ Test student account ready:');
    console.log(`   Email: ${testStudent.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role: ${testStudent.role}`);
    console.log(`   Verified: ${testStudent.isVerified}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestStudent();
