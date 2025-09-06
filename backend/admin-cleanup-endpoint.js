// Create admin cleanup endpoint for application conflicts
import Application from "../models/Application.js";

// Admin-only endpoint to clean up application database issues
export const cleanupApplicationConflicts = async (req, res) => {
  try {
    console.log('🧹 Starting application database cleanup...');
    
    // Find all applications that might have issues
    const allApplications = await Application.find({});
    console.log(`📊 Total applications in database: ${allApplications.length}`);
    
    let cleanupCount = 0;
    const issues = [];
    
    // Check for applications with missing required fields
    for (const app of allApplications) {
      let hasIssue = false;
      const issueDetails = { _id: app._id, problems: [] };
      
      // Check for missing required fields
      if (!app.tutor) {
        issueDetails.problems.push('Missing tutor');
        hasIssue = true;
      }
      if (!app.post) {
        issueDetails.problems.push('Missing post');
        hasIssue = true;
      }
      if (!app.status) {
        issueDetails.problems.push('Missing status');
        hasIssue = true;
      }
      if (!app.createdAt) {
        issueDetails.problems.push('Missing createdAt');
        hasIssue = true;
      }
      
      if (hasIssue) {
        issues.push(issueDetails);
        console.log(`❌ Found problematic application: ${app._id}`, issueDetails.problems);
        
        // Delete the problematic application
        await Application.findByIdAndDelete(app._id);
        cleanupCount++;
      }
    }
    
    // Also clean up any duplicate index issues by rebuilding
    console.log('🔄 Rebuilding application indexes...');
    
    try {
      // Drop and recreate the unique index
      await Application.collection.dropIndex({ post: 1, tutor: 1 });
      console.log('✅ Dropped unique index');
    } catch (dropError) {
      console.log('⚠️  Could not drop index (may not exist):', dropError.message);
    }
    
    // Recreate the index
    await Application.collection.createIndex({ post: 1, tutor: 1 }, { unique: true });
    console.log('✅ Recreated unique index');
    
    const remainingApplications = await Application.find({});
    
    return res.json({
      message: "Application database cleanup completed",
      cleanup: {
        totalApplicationsBefore: allApplications.length,
        totalApplicationsAfter: remainingApplications.length,
        cleanedUpCount: cleanupCount,
        issuesFound: issues.length,
        issues: issues
      }
    });
    
  } catch (err) {
    console.error("cleanupApplicationConflicts error:", err);
    return res.status(500).json({ 
      message: "Cleanup failed", 
      error: err.message 
    });
  }
};
