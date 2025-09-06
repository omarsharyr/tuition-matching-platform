// Check for orphaned applications
import connectDB from "./config/db.js";
import Application from "./models/Application.js";
import TuitionPost from "./models/TuitionPost.js";
import dotenv from "dotenv";

dotenv.config();

async function cleanupOrphanedApplications() {
    try {
        await connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/tuition-platform");
        
        console.log('🧹 Checking for orphaned applications...\n');
        
        // Get all applications
        const applications = await Application.find({});
        console.log(`Found ${applications.length} applications`);
        
        let orphanedCount = 0;
        const orphanedApps = [];
        
        for (const app of applications) {
            const post = await TuitionPost.findById(app.post);
            if (!post) {
                orphanedCount++;
                orphanedApps.push(app);
                console.log(`❌ Orphaned application found: ${app._id} (post ${app.post} not found)`);
            } else {
                console.log(`✅ Valid application: ${app._id} for post "${post.title}"`);
            }
        }
        
        if (orphanedCount > 0) {
            console.log(`\n⚠️ Found ${orphanedCount} orphaned applications`);
            console.log('Would you like me to remove them? (This script will remove them)');
            
            // Remove orphaned applications
            const result = await Application.deleteMany({ 
                _id: { $in: orphanedApps.map(app => app._id) }
            });
            
            console.log(`✅ Removed ${result.deletedCount} orphaned applications`);
        } else {
            console.log('\n✅ No orphaned applications found');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

cleanupOrphanedApplications();
