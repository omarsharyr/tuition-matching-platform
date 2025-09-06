import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

async function listStudents() {
  try {
    await connectDB(process.env.MONGO_URI);
    
    console.log('📋 Listing all student accounts...\n');
    
    const students = await User.find({ role: 'student' }).select('name email isVerified createdAt');
    
    if (students.length === 0) {
      console.log('❌ No student accounts found');
    } else {
      console.log(`✅ Found ${students.length} student accounts:\n`);
      students.forEach((student, index) => {
        console.log(`${index + 1}. Name: ${student.name}`);
        console.log(`   Email: ${student.email}`);
        console.log(`   Verified: ${student.isVerified ? '✅' : '❌'}`);
        console.log(`   Created: ${student.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

listStudents();
