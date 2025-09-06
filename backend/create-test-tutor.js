import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";

dotenv.config();

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    
    // Create a test tutor with known password
    const email = "tutor@test.com";
    const password = "123456";
    
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const testTutor = await User.create({
        name: "Test Tutor",
        email: email,
        password: hashedPassword,
        role: "tutor",
        isVerified: true,
        verificationStatus: "verified",
        status: "ACTIVE"
      });
      
      console.log(`✅ Created test tutor:`);
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log(`   Role: tutor`);
      console.log(`   Status: verified`);
    } else {
      console.log(`ℹ️  Test tutor already exists: ${email}`);
    }
    
    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
