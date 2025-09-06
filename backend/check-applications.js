// Check applications in database
import connectDB from "./config/db.js";
import Application from "./models/Application.js";
import User from "./models/User.js";
import TuitionPost from "./models/TuitionPost.js";
import dotenv from "dotenv";

dotenv.config();

async function checkApplications() {
    try {
        await connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/tuition-platform");
        
        console.log('📋 Checking Applications in Database:\n');
        
        // Get all applications
        const applications = await Application.find({})
            .populate('tutor', 'name email')
            .populate('post', 'title');
            
        console.log(`Found ${applications.length} applications:`);
        
        applications.forEach((app, index) => {
            console.log(`${index + 1}. ${app.tutor?.name} (${app.tutor?.email}) applied to "${app.post?.title}"`);
            console.log(`   Status: ${app.status}`);
            console.log(`   Created: ${app.createdAt}`);
            console.log(`   Application ID: ${app._id}`);
            console.log('---');
        });
        
        // Check for potential tutor
        const tutorUser = await User.findOne({ email: 'tut@gmail.com' });
        if (tutorUser) {
            console.log(`\n🧑‍🏫 Tutor User Found: ${tutorUser.name} (${tutorUser._id})\n`);
            
            // Check applications for this tutor
            const tutorApps = await Application.find({ tutor: tutorUser._id })
                .populate('post', 'title');
                
            console.log(`${tutorUser.name} has ${tutorApps.length} applications:`);
            tutorApps.forEach((app) => {
                console.log(`- Applied to: "${app.post?.title}" (Status: ${app.status})`);
            });
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkApplications();
