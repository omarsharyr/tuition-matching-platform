import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    const email = "admin@tuition.local";
    const pass = "Admin123!";
    const exists = await User.findOne({ email });
    if (!exists) {
      const hashed = await bcrypt.hash(pass, 10);
      await User.create({
        name: "Platform Admin",
        email,
        password: hashed,
        role: "admin",
        isVerified: true,
        status: "ACTIVE",
      });
      console.log("✅ Admin seeded:", email, "/", pass);
    } else {
      console.log("ℹ️ Admin already exists:", email);
    }
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
