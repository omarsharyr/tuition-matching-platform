// Quick database check
import connectDB from "./config/db.js";
import User from "./models/User.js";
import TuitionPost from "./models/TuitionPost.js";
import Application from "./models/Application.js";
import dotenv from "dotenv";

dotenv.config();

async function checkData() {
    try {
        await connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/tuition-platform");
        
        console.log('📊 Current Database State:\n');
        
        // Check users
        const users = await User.find({}, 'name email role verificationStatus');
        console.log('👥 Users:');
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - ${user.role} - ${user.verificationStatus}`);
        });
        
        // Check posts
        const posts = await TuitionPost.find({}, 'title subject status student').populate('student', 'name email');
        console.log(`\n📝 Tuition Posts (${posts.length}):`);
        posts.forEach(post => {
            console.log(`- "${post.title}" (${post.subject}) - Status: ${post.status} - Student: ${post.student?.name}`);
        });
        
        // Check applications
        const applications = await Application.find({}).populate('tutor', 'name email').populate('post', 'title subject');
        console.log(`\n📋 Applications (${applications.length}):`);
        applications.forEach(app => {
            console.log(`- ${app.tutor?.name} applied to "${app.post?.title}" - Status: ${app.status}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkData();
