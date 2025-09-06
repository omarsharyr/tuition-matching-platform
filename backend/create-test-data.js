// Create test posts and applications for testing
import connectDB from "./config/db.js";
import User from "./models/User.js";
import TuitionPost from "./models/TuitionPost.js";
import Application from "./models/Application.js";
import dotenv from "dotenv";

dotenv.config();

async function createTestData() {
    try {
        await connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/tuition-platform");
        
        console.log('🏗️ Creating test data...\n');
        
        // Get student and tutor users
        const student = await User.findOne({ email: 'stu@gmail.com' });
        const tutor = await User.findOne({ email: 'tut@gmail.com' });
        
        if (!student || !tutor) {
            console.log('❌ Student or tutor not found');
            process.exit(1);
        }
        
        console.log(`✅ Found student: ${student.name} (${student._id})`);
        console.log(`✅ Found tutor: ${tutor.name} (${tutor._id})`);
        
        // Create a test post if none exists
        let post = await TuitionPost.findOne({ student: student._id });
        if (!post) {
            post = await TuitionPost.create({
                title: "Mathematics Tuition for Class 10",
                description: "Looking for an experienced tutor for Class 10 mathematics",
                subjects: ["Mathematics"],
                classLevel: "Class 10",
                educationLevel: "Secondary",
                location: "Dhaka",
                budgetAmount: 8000,
                paymentType: "monthly",
                currency: "BDT",
                student: student._id,
                status: "active",
                isActive: true
            });
            console.log(`✅ Created test post: ${post.title} (${post._id})`);
        } else {
            console.log(`✅ Found existing post: ${post.title} (${post._id})`);
        }
        
        // Create a test application if none exists
        let application = await Application.findOne({ post: post._id, tutor: tutor._id });
        if (!application) {
            application = await Application.create({
                post: post._id,
                tutor: tutor._id,
                pitch: "I am an experienced mathematics tutor with 5 years of teaching experience.",
                proposedRate: 7500,
                status: "submitted"
            });
            console.log(`✅ Created test application: ${application._id}`);
        } else {
            console.log(`✅ Found existing application: ${application._id} (status: ${application.status})`);
        }
        
        // Test the API call that the frontend makes
        console.log('\n🧪 Testing API call...');
        
        // Find all student's posts
        const studentPosts = await TuitionPost.find({ student: student._id }).select('_id');
        const postIds = studentPosts.map(p => p._id);
        console.log(`Student has ${studentPosts.length} posts`);
        
        // Find applications for those posts
        const applications = await Application.find({ post: { $in: postIds } })
            .populate({
                path: 'tutor',
                select: 'name email phone verificationStatus createdAt'
            })
            .populate({
                path: 'post', 
                select: 'title subjects educationLevel location status budgetAmount paymentType'
            })
            .sort({ createdAt: -1 });
            
        console.log(`\nFound ${applications.length} applications:`);
        applications.forEach((app, index) => {
            console.log(`${index + 1}. ${app.tutor?.name} applied to "${app.post?.title}" (Status: ${app.status})`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

createTestData();
