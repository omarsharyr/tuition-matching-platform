import dotenv from "dotenv";
import connectDB from "./config/db.js";
import User from "./models/User.js";

dotenv.config();

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Update all pending users to verified for testing
    const result = await User.updateMany(
      { verificationStatus: "pending" },
      { verificationStatus: "verified" }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to verified status`);
    
    // List all users
    const users = await User.find({}, 'name email role verificationStatus');
    console.log("\nCurrent users:");
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role} - ${user.verificationStatus}`);
    });
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
