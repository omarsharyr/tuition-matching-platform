import mongoose from "mongoose";

const connectDB = async (uri) => {
  if (!uri) throw new Error("MONGO_URI missing");
  await mongoose.connect(uri, { maxPoolSize: 10 });
  console.log("✅ Mongo connected");
};

export default connectDB;
