import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Create test users with known credentials
    const testUsers = [
      {
        name: "Test Student",
        email: "teststudent@example.com",
        password: "password123",
        role: "student"
      },
      {
        name: "Test Tutor", 
        email: "testtutor@example.com",
        password: "password123",
        role: "tutor"
      }
    ];

    for (const userData of testUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        const hashed = await bcrypt.hash(userData.password, 10);
        await User.create({
          name: userData.name,
          email: userData.email,
          password: hashed,
          role: userData.role,
          isVerified: true,
          verificationStatus: "verified",
          status: "ACTIVE",
        });
        console.log(`✅ Created ${userData.role}: ${userData.email} / password123`);
      } else {
        console.log(`ℹ️ User already exists: ${userData.email}`);
      }
    }
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
