import dotenv from "dotenv";
import connectDB from "./config/db.js";
import TuitionPost from "./models/TuitionPost.js";

dotenv.config();

(async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    
    // List all posts without populate
    const allPosts = await TuitionPost.find({});
    console.log('\nCurrent tuition posts:');
    allPosts.forEach(post => {
      console.log(`- ${post.title} (${post.classLevel || post.educationLevel}) - Status: ${post.status}`);
    });

    process.exit(0);
  } catch (e) {
    console.error('Error:', e);
    process.exit(1);
  }
})();
