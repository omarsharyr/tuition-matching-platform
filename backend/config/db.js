// backend/config/db.js
import mongoose from "mongoose";

export default async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { dbName: "tuition_matching" });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ Mongo connection error:", err.message);
    process.exit(1);
  }
}
