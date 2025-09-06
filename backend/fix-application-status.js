// Fix application status in database
import connectDB from "./config/db.js";
import Application from "./models/Application.js";
import dotenv from "dotenv";

dotenv.config();

async function fixApplicationStatus() {
    try {
        await connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/tuition-platform");
        
        console.log('🔧 Fixing application statuses...\n');
        
        // Update all "applied" status to "submitted"
        const result = await Application.updateMany(
            { status: "applied" },
            { status: "submitted" }
        );
        
        console.log(`✅ Updated ${result.modifiedCount} applications from 'applied' to 'submitted'`);
        
        // Show updated applications
        const applications = await Application.find({}).populate('tutor', 'name email').populate('post', 'title subject');
        console.log(`\n📋 Updated Applications (${applications.length}):`);
        applications.forEach(app => {
            console.log(`- ${app.tutor?.name} applied to "${app.post?.title}" - Status: ${app.status}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixApplicationStatus();
