import dotenv from "dotenv";
import connectDB from "./config/db.js";
import TuitionPost from "./models/TuitionPost.js";

dotenv.config();

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    // Update existing posts to have the correct status
    const result = await TuitionPost.updateMany(
      { status: "active" },
      { status: "posted" }
    );

    console.log(`✅ Updated ${result.modifiedCount} posts from 'active' to 'posted' status`);
    
    // List all posts
    const allPosts = await TuitionPost.find({}).populate('student', 'name email');
    console.log('\nCurrent tuition posts:');
    allPosts.forEach(post => {
      console.log(`- ${post.title} (${post.classLevel || post.educationLevel}) - Status: ${post.status} - Student: ${post.student.name}`);
    });

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
