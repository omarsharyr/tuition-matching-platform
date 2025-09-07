// backend/controllers/adminController.js
import User from "../models/User.js";
import Tutor from "../models/Tutor.js";
import Student from "../models/Student.js";
import Document from "../models/Document.js";
import TuitionPost from "../models/TuitionPost.js";
import Application from "../models/Application.js";
import Chat from "../models/Chat.js";

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

// Get verification queue - users pending verification with their documents
export const getVerificationQueue = async (req, res) => {
  try {
    const { role } = req.query;
    const query = { verificationStatus: "pending" };
    if (role && ["student", "tutor"].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 });

    const usersWithDocuments = await Promise.all(
      users.map(async (user) => {
        const documents = await Document.find({ userId: user._id });
        const profile = user.role === "tutor" 
          ? await Tutor.findOne({ user: user._id })
          : await Student.findOne({ user: user._id });
        
        return {
          ...user.toObject(),
          documents,
          profile
        };
      })
    );

    return res.json(usersWithDocuments);
  } catch (err) {
    console.error("getVerificationQueue error:", err);
    return res.status(500).json({ message: err.message || "Failed to load verification queue" });
  }
};

// Verify user - approve their account
export const verifyUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminNote } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.verificationStatus === "verified") {
      return res.status(400).json({ message: "User is already verified" });
    }

    user.isVerified = true;
    user.verificationStatus = "verified";
    user.verificationReason = undefined; // clear any previous rejection reason
    user.meta.adminNote = adminNote || "";
    user.meta.reviewedBy = req.user.id;
    user.meta.reviewedAt = new Date();

    await user.save();

    return res.json({
      message: "User verified successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        isVerified: user.isVerified
      }
    });
  } catch (err) {
    console.error("verifyUser error:", err);
    return res.status(500).json({ message: err.message || "Failed to verify user" });
  }
};

// Reject user verification
export const rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, adminNote } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.verificationStatus === "verified") {
      return res.status(400).json({ message: "Cannot reject a verified user" });
    }

    user.isVerified = false;
    user.verificationStatus = "rejected";
    user.verificationReason = reason || "Documents did not meet verification requirements";
    user.meta.adminNote = adminNote || "";
    user.meta.reviewedBy = req.user.id;
    user.meta.reviewedAt = new Date();

    await user.save();

    return res.json({
      message: "User verification rejected",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        verificationReason: user.verificationReason
      }
    });
  } catch (err) {
    console.error("rejectUser error:", err);
    return res.status(500).json({ message: err.message || "Failed to reject user" });
  }
};

// Get analytics/dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const pendingVerification = await User.countDocuments({ verificationStatus: "pending" });
    const verifiedUsers = await User.countDocuments({ verificationStatus: "verified" });
    const totalStudents = await User.countDocuments({ role: "student" });
    const totalTutors = await User.countDocuments({ role: "tutor" });
    const totalJobs = await TuitionPost.countDocuments();
    const activeJobs = await TuitionPost.countDocuments({ status: "open" });

    return res.json({
      totalUsers,
      totalStudents,
      totalTutors,
      verifiedUsers,
      pendingVerification,
      totalJobs,
      activeJobs
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({ message: err.message || "Failed to load dashboard stats" });
  }
};

// Get all users with filters
export const getAllUsers = async (req, res) => {
  try {
    const { role, verificationStatus, page = 1, limit = 50 } = req.query;
    const query = {};
    
    if (role && ["student", "tutor", "admin"].includes(role)) {
      query.role = role;
    }
    if (verificationStatus && ["pending", "verified", "rejected"].includes(verificationStatus)) {
      query.verificationStatus = verificationStatus;
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    return res.json({
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ message: err.message || "Failed to load users" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't allow deleting admin users
    if (user.role === "admin") {
      return res.status(400).json({ message: "Cannot delete admin users" });
    }
    
    // Delete related documents
    await Document.deleteMany({ user: userId });
    
    // Delete related posts if student
    if (user.role === "student") {
      const posts = await TuitionPost.find({ student: userId });
      const postIds = posts.map(p => p._id);
      await Application.deleteMany({ post: { $in: postIds } });
      await TuitionPost.deleteMany({ student: userId });
    }
    
    // Delete related applications if tutor
    if (user.role === "tutor") {
      await Application.deleteMany({ tutor: userId });
    }
    
    // Delete chat messages
    await Chat.deleteMany({ sender: userId });
    
    // Finally delete the user
    await User.findByIdAndDelete(userId);
    
    return res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("deleteUser error:", err);
    return res.status(500).json({ message: err.message || "Failed to delete user" });
  }
};

// Moderate posts
export const listPosts = async (_req, res) => {
  try {
    const posts = await TuitionPost.find({}).sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to load posts" });
  }
};

export const deletePostAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    await TuitionPost.findByIdAndDelete(id);
    await Application.deleteMany({ post: id });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to delete post" });
  }
};

// Applications moderation (view all)
export const listApplications = async (_req, res) => {
  try {
    const apps = await Application.find({}).populate("post tutor", "title name email");
    return res.json(apps);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to load applications" });
  }
};

// Delete application (admin only)
export const deleteApplicationAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the application
    const application = await Application.findById(id);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }
    
    // Delete the application
    await Application.findByIdAndDelete(id);
    
    console.log(`🗑️ Admin deleted application ${id}`);
    
    res.json({ message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ message: error.message || "Failed to delete application" });
  }
};
