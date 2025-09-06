// backend/controllers/studentController.js
import TuitionPost from "../models/TuitionPost.js";
import Application from "../models/Application.js";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Student from "../models/Student.js";
import { sendNotification } from "./notificationController.js";

// Create a tuition post (enhanced for multi-step wizard)
export const createPost = async (req, res) => {
  try {
    console.log("📝 Creating post with data:", JSON.stringify(req.body, null, 2));
    
    const {
      // New wizard fields (Step 1-6)
      title,
      educationLevel,
      subjects = [],
      syllabus,
      description,
      area,
      exactAddress,
      teachingMode,
      daysPerWeek,
      preferredDays = [],
      preferredTimes = [],
      startDate,
      duration,
      paymentType,
      budgetAmount,
      currency = "BDT",
      paymentNotes,
      preferredGender = "any",
      experience = "any",
      universityPreference = [],
      otherPreferences,
      isDraft = false,
      
      // Legacy fields (for backward compatibility)
      classLevel,
      medium,
      mode,
      location,
      address,
      geo,
      days = [],
      timeSlots = [],
      budget,
      expectedPayment,
      notes = ""
    } = req.body;

    // Build post data using new structure with legacy fallbacks
    const postData = {
      student: req.user._id,
      
      // Step 1: Class & Subjects
      title: title || `${classLevel} tutoring`,
      educationLevel: educationLevel || classLevel,
      subjects: subjects.length > 0 ? subjects : ["General"],
      syllabus: syllabus || medium,
      description: description || notes,
      
      // Step 2: Location  
      area: area || (location?.area) || location,
      exactAddress: exactAddress || (location?.address) || address,
      teachingMode: teachingMode || (mode === "online" ? "online" : "student_home"),
      
      // Step 3: Schedule
      daysPerWeek: daysPerWeek || Math.max(days.length, 1),
      preferredDays: preferredDays.length > 0 ? preferredDays : ["monday", "wednesday", "friday"],
      preferredTimes: preferredTimes.length > 0 ? preferredTimes : ["evening"],
      startDate: startDate ? new Date(startDate) : undefined,
      duration: duration ? parseInt(duration) : undefined,
      
      // Step 4: Budget
      paymentType: paymentType || (budget?.perSession ? "per_session" : "monthly"),
      budgetAmount: budgetAmount || expectedPayment || budget?.max || 5000,
      currency: currency,
      paymentNotes: paymentNotes,
      
      // Step 5: Tutor Preferences
      preferredGender: preferredGender,
      experience: experience,
      universityPreference: universityPreference,
      otherPreferences: otherPreferences,
      
      // Legacy fields (mapped automatically by pre-save middleware)
      classLevel: classLevel,
      medium: medium,
      mode: mode,
      location: (location?.area) || location,
      address: (location?.address) || address,
      geo: geo,
      days: days,
      timeSlots: timeSlots,
      budget: budget,
      expectedPayment: expectedPayment,
      notes: notes,
      
      // Status and metadata
      isDraft: isDraft,
      status: isDraft ? "draft" : "active",
      isActive: !isDraft,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    };

    console.log("📝 Processed post data:", JSON.stringify(postData, null, 2));

    const post = await TuitionPost.create(postData);
    
    console.log("✅ Post created successfully:", post._id);

    return res.status(201).json({
      success: true,
      message: isDraft ? "Post saved as draft" : "Post published successfully",
      post: post
    });
  } catch (err) {
    console.error("createPost error:", err);
    return res.status(500).json({ message: err.message || "Failed to create post" });
  }
};

// My posts (student) with enhanced filtering
export const myPosts = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { student: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const posts = await TuitionPost.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('acceptedTutor', 'name email');

    const total = await TuitionPost.countDocuments(query);

    // Get application counts for each post
    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        const applicationsCount = await Application.countDocuments({ 
          post: post._id, 
          status: { $in: ['submitted', 'shortlisted'] }
        });
        return {
          ...post.toObject(),
          applicationsCount
        };
      })
    );

    return res.json({
      posts: postsWithStats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error("myPosts error:", err);
    return res.status(500).json({ message: err.message || "Failed to load posts" });
  }
};

// Get post status counts
export const getPostStatusCounts = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const counts = await TuitionPost.aggregate([
      { $match: { student: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusCounts = {
      active: 0,
      interviewing: 0,
      accepted: 0,
      fulfilled: 0,
      closed: 0
    };

    // Map database statuses to UI statuses
    counts.forEach(({ _id, count }) => {
      if (_id === 'active') {
        statusCounts.active = count;
      } else if (_id === 'interviewing') {
        statusCounts.interviewing = count;
      } else if (_id === 'accepted') {
        statusCounts.accepted = count;
      } else if (_id === 'fulfilled') {
        statusCounts.fulfilled = count;
      } else if (_id === 'closed') {
        statusCounts.closed = count;
      }
    });

    return res.json(statusCounts);
  } catch (err) {
    console.error("getPostStatusCounts error:", err);
    return res.status(500).json({ message: err.message || "Failed to get status counts" });
  }
};

// Get single post details
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await TuitionPost.findOne({ 
      _id: id, 
      student: req.user._id 
    }).populate('acceptedTutor', 'name email phone');

    if (!post) return res.status(404).json({ message: "Post not found" });

    return res.json(post);
  } catch (err) {
    console.error("getPost error:", err);
    return res.status(500).json({ message: err.message || "Failed to load post" });
  }
};

// Update post (enhanced)
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await TuitionPost.findOne({ _id: id, student: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only allow updates if post is not accepted/fulfilled
    if (['accepted', 'fulfilled', 'closed'].includes(post.status)) {
      return res.status(400).json({ 
        message: "Cannot update post in current status" 
      });
    }

    const allowed = [
      "title", "classLevel", "subjects", "medium", "mode", "location", 
      "address", "geo", "preferredGender", "days", "timeSlots", 
      "budget", "expectedPayment", "notes", "status"
    ];
    
    for (const k of allowed) {
      if (req.body[k] !== undefined) {
        post[k] = req.body[k];
      }
    }

    await post.save();
    return res.json(post);
  } catch (err) {
    console.error("updatePost error:", err);
    return res.status(500).json({ message: err.message || "Failed to update post" });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await TuitionPost.findOne({ _id: id, student: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    // Only allow deletion if no accepted tutor
    if (post.acceptedTutor) {
      return res.status(400).json({ 
        message: "Cannot delete post with accepted tutor" 
      });
    }

    await TuitionPost.findByIdAndDelete(id);
    // Clean up related data
    await Application.deleteMany({ post: id });
    await Chat.deleteMany({ post: id });

    return res.json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("deletePost error:", err);
    return res.status(500).json({ message: err.message || "Failed to delete post" });
  }
};

// Get applications for a post (enhanced)
export const getPostApplications = async (req, res) => {
  try {
    const { id } = req.params; // postId
    const { status } = req.query;
    
    const post = await TuitionPost.findOne({ _id: id, student: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const query = { post: id };
    if (status) query.status = status;

    const applications = await Application.find(query)
      .populate({
        path: 'tutor',
        select: 'name email phone verificationStatus',
        populate: {
          path: 'tutorProfile', // if you have a separate tutor profile
          select: 'bio experienceYears subjects ratingAvg reviewsCount'
        }
      })
      .populate({
        path: 'post',
        select: 'title subjects classLevel mode location budgetAmount'
      })
      .sort({ createdAt: -1 });

    return res.json(applications);
  } catch (err) {
    console.error("getPostApplications error:", err);
    return res.status(500).json({ message: err.message || "Failed to load applications" });
  }
};

// Get all applications for student's posts
export const getAllApplications = async (req, res) => {
  try {
    const { status, post, page = 1, limit = 20 } = req.query;
    
    // Get all student's posts
    const studentPosts = await TuitionPost.find({ student: req.user._id }).select('_id');
    const postIds = studentPosts.map(p => p._id);

    const query = { post: { $in: postIds } };
    if (status) query.status = status;
    if (post) query.post = post;

    const applications = await Application.find(query)
      .populate({
        path: 'tutor',
        select: 'name email phone verificationStatus createdAt bio education experience rating reviewCount specializations location profilePicture'
      })
      .populate({
        path: 'post',
        select: 'title subjects educationLevel location status budgetAmount paymentType area teachingMode'
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log(`Found ${applications.length} applications for student ${req.user._id}`);

    const total = await Application.countDocuments(query);

    // Get application status counts
    const statusCounts = await Application.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const counts = {
      submitted: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };

    statusCounts.forEach(({ _id, count }) => {
      if (counts.hasOwnProperty(_id)) {
        counts[_id] = count;
      }
    });

    return res.json({
      applications,
      counts,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error("getAllApplications error:", err);
    return res.status(500).json({ message: err.message || "Failed to load applications" });
  }
};

// Shortlist application
export const shortlistApplication = async (req, res) => {
  try {
    const { appId } = req.params;
    const { message } = req.body;

    const application = await Application.findById(appId)
      .populate('post')
      .populate('tutor', 'name');
    if (!application) return res.status(404).json({ message: "Application not found" });

    // Verify ownership
    if (String(application.post.student) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (application.status !== 'submitted') {
      return res.status(400).json({ message: "Application already processed" });
    }

    // Update application to shortlisted
    application.status = 'shortlisted';
    application.shortlistedAt = new Date();
    application.responseMessage = message || '';
    await application.save();

    // Update post status to "interviewing" if this is the first shortlisting
    if (application.post.status === 'active') {
      await TuitionPost.findByIdAndUpdate(application.post._id, {
        status: 'interviewing'
      });
    }

    // Create interview chat room
    const chatRoom = await Chat.findOneAndUpdate(
      { 
        post: application.post._id, 
        student: application.post.student, 
        tutor: application.tutor._id 
      },
      { 
        $setOnInsert: { 
          messages: [],
          chatType: 'interview',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days TTL
        } 
      },
      { upsert: true, new: true }
    );

    // Send notification to tutor
    try {
      await sendNotification('shortlisted', application.tutor._id, {
        jobTitle: application.post.title,
        postId: application.post._id,
        chatId: chatRoom._id
      });
    } catch (notifError) {
      console.error("Failed to send shortlist notification:", notifError);
    }

    return res.json(application);
  } catch (err) {
    console.error("shortlistApplication error:", err);
    return res.status(500).json({ message: err.message || "Failed to shortlist application" });
  }
};

// Accept application (hire tutor)
export const acceptApplication = async (req, res) => {
  try {
    const { appId } = req.params;
    const { message } = req.body;

    const application = await Application.findById(appId)
      .populate('post')
      .populate('tutor', 'name');
    if (!application) return res.status(404).json({ message: "Application not found" });

    // Verify ownership
    if (String(application.post.student) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (application.status !== 'shortlisted') {
      return res.status(400).json({ 
        message: "Can only accept shortlisted applications" 
      });
    }

    // Accept this application
    application.status = 'accepted';
    application.responseMessage = message || '';
    await application.save();

    // Update post to "matched" status with accepted tutor
    await TuitionPost.findByIdAndUpdate(application.post._id, {
      status: 'matched',
      acceptedTutor: application.tutor._id
    });

    // Reject all other applications for this post
    await Application.updateMany(
      { 
        post: application.post._id, 
        _id: { $ne: application._id },
        status: { $in: ['submitted', 'shortlisted'] }
      },
      { 
        status: 'rejected',
        responseMessage: 'Position filled by another candidate'
      }
    );

    // Upgrade interview chat to full chat
    await Chat.findOneAndUpdate(
      { 
        post: application.post._id, 
        student: application.post.student, 
        tutor: application.tutor._id 
      },
      { 
        chatType: 'full',
        $unset: { expiresAt: 1 } // Remove expiration
      }
    );

    // Send acceptance notification to tutor
    try {
      await sendNotification('accepted', application.tutor._id, {
        jobTitle: application.post.title,
        postId: application.post._id
      });
    } catch (notifError) {
      console.error("Failed to send acceptance notification:", notifError);
    }

    return res.json(application);
  } catch (err) {
    console.error("acceptApplication error:", err);
    return res.status(500).json({ message: err.message || "Failed to accept application" });
  }
};

// Reject application
export const rejectApplication = async (req, res) => {
  try {
    const { appId } = req.params;
    const { reason } = req.body;

    const application = await Application.findById(appId).populate('post');
    if (!application) return res.status(404).json({ message: "Application not found" });

    // Verify ownership
    if (String(application.post.student) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (application.status === 'accepted') {
      return res.status(400).json({ message: "Cannot reject accepted application" });
    }

    application.status = 'rejected';
    application.responseMessage = reason || '';
    await application.save();

    return res.json(application);
  } catch (err) {
    console.error("rejectApplication error:", err);
    return res.status(500).json({ message: err.message || "Failed to reject application" });
  }
};

// Mark post as fulfilled
export const markPostFulfilled = async (req, res) => {
  try {
    const { id } = req.params; // post id
    const post = await TuitionPost.findOne({ _id: id, student: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.status !== 'accepted') {
      return res.status(400).json({ 
        message: "Can only mark accepted posts as fulfilled" 
      });
    }

    post.status = 'fulfilled';
    await post.save();

    return res.json(post);
  } catch (err) {
    console.error("markPostFulfilled error:", err);
    return res.status(500).json({ message: err.message || "Failed to mark as fulfilled" });
  }
};

// Close a post
export const closePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await TuitionPost.findOne({ _id: id, student: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (['fulfilled', 'closed'].includes(post.status)) {
      return res.status(400).json({ 
        message: "Post is already closed or fulfilled" 
      });
    }

    post.status = 'closed';
    await post.save();

    return res.json(post);
  } catch (err) {
    console.error("closePost error:", err);
    return res.status(500).json({ message: err.message || "Failed to close post" });
  }
};

// Reopen a post
export const reopenPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await TuitionPost.findOne({ _id: id, student: req.user._id });
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.status !== 'closed') {
      return res.status(400).json({ 
        message: "Only closed posts can be reopened" 
      });
    }

    post.status = 'active';
    await post.save();

    return res.json(post);
  } catch (err) {
    console.error("reopenPost error:", err);
    return res.status(500).json({ message: err.message || "Failed to reopen post" });
  }
};

// Leave a review for tutor
export const createReview = async (req, res) => {
  try {
    const { postId } = req.params;
    const { rating, comment = "", tags = [] } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const post = await TuitionPost.findOne({ 
      _id: postId, 
      student: req.user._id, 
      status: "fulfilled" 
    });
    if (!post) {
      return res.status(400).json({ 
        message: "Post not found or not fulfilled" 
      });
    }

    if (!post.acceptedTutor) {
      return res.status(400).json({ message: "No tutor to review" });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      post: postId,
      student: req.user._id,
      tutor: post.acceptedTutor
    });

    if (existingReview) {
      return res.status(400).json({ message: "Review already exists for this tutor" });
    }

    const review = await Review.create({
      post: postId,
      student: req.user._id,
      tutor: post.acceptedTutor,
      rating,
      comment,
      tags,
      visible: true
    });

    // Update tutor's average rating (you might want to do this in a background job)
    // This is a simplified version - in production, consider using aggregation pipeline
    const tutorReviews = await Review.find({ tutor: post.acceptedTutor });
    const avgRating = tutorReviews.reduce((sum, r) => sum + r.rating, 0) / tutorReviews.length;
    
    // Update tutor profile if it exists
    await User.findByIdAndUpdate(post.acceptedTutor, {
      $set: { 
        'meta.averageRating': avgRating,
        'meta.reviewsCount': tutorReviews.length
      }
    });

    return res.status(201).json(review);
  } catch (err) {
    console.error("createReview error:", err);
    return res.status(500).json({ message: err.message || "Failed to create review" });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const studentId = req.user._id;

    const totalPosts = await TuitionPost.countDocuments({ student: studentId });
    const activePosts = await TuitionPost.countDocuments({ 
      student: studentId, 
      status: { $in: ['posted', 'receiving_applications', 'shortlisted'] }
    });
    const fulfilledPosts = await TuitionPost.countDocuments({ 
      student: studentId, 
      status: 'fulfilled' 
    });

    // Get total applications across all posts
    const postIds = await TuitionPost.find({ student: studentId }).distinct('_id');
    const totalApplications = await Application.countDocuments({ 
      post: { $in: postIds } 
    });

    const activeChats = await Chat.countDocuments({
      student: studentId,
      'messages.0': { $exists: true } // has at least one message
    });

    return res.json({
      totalPosts,
      activePosts,
      fulfilledPosts,
      totalApplications,
      activeChats
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({ message: err.message || "Failed to load dashboard stats" });
  }
};

// Get enhanced KPIs for new dashboard
export const getKPIs = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Active Posts (Active + Interviewing)
    const activePosts = await TuitionPost.countDocuments({
      student: studentId,
      status: { $in: ['active', 'interviewing'] }
    });

    // Applicants Waiting (new/unchecked applications)
    const applicantsWaiting = await Application.countDocuments({
      student: studentId,
      status: 'submitted'
    });

    // Open Chats (Interview + Full)
    const openChats = await Chat.countDocuments({
      student: studentId,
      status: { $in: ['interview', 'full'] },
      'messages.0': { $exists: true }
    });

    // Fulfilled Hires
    const fulfilledHires = await TuitionPost.countDocuments({
      student: studentId,
      status: 'fulfilled'
    });

    return res.json({
      activePosts,
      applicantsWaiting, 
      openChats,
      fulfilledHires
    });
  } catch (err) {
    console.error("getKPIs error:", err);
    return res.status(500).json({ message: err.message || "Failed to load KPIs" });
  }
};

// Get activity feed
export const getActivityFeed = async (req, res) => {
  try {
    const studentId = req.user._id;
    const limit = parseInt(req.query.limit) || 20;

    // Mock activity feed for now - in production, you'd have an Activity model
    // or aggregate from various models
    const activities = [];

    // Get recent applications
    const recentApplications = await Application.find({
      student: studentId
    })
    .populate('tutor', 'name')
    .populate('post', 'title')
    .sort({ createdAt: -1 })
    .limit(limit / 4);

    recentApplications.forEach(app => {
      activities.push({
        id: app._id,
        type: 'new_application',
        title: 'New Application Received',
        description: `${app.tutor?.name || 'A tutor'} submitted an application to "${app.post?.title || 'your job'}"`,
        createdAt: app.createdAt,
        jobId: app.post,
        applicationId: app._id
      });
    });

    // Get recent chats with new messages
    const recentChats = await Chat.find({
      student: studentId
    })
    .populate('tutor', 'name') 
    .populate('post', 'title')
    .sort({ updatedAt: -1 })
    .limit(limit / 4);

    // For each chat, get the last message from the Messages collection
    for (const chat of recentChats) {
      try {
        const lastMessage = await Message.findOne({
          chat: chat._id,
          sender: { $ne: studentId } // Only messages from tutors (not from student)
        })
        .populate('sender', 'name')
        .sort({ createdAt: -1 });

        if (lastMessage) {
          activities.push({
            id: chat._id,
            type: 'new_message',
            title: 'New Message',
            description: `${chat.tutor?.name || 'Tutor'} sent you a message about "${chat.post?.title || 'your job'}"`,
            createdAt: lastMessage.createdAt,
            chatId: chat._id
          });
        }
      } catch (msgErr) {
        console.error('Error fetching message for chat:', chat._id, msgErr);
      }
    }

    // Sort all activities by date
    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      activities: activities.slice(0, limit)
    });
  } catch (err) {
    console.error("getActivityFeed error:", err);
    return res.status(500).json({ message: err.message || "Failed to load activity feed" });
  }
}// Get job recommendations (placeholder)
export const getRecommendations = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 6;
    
    // Placeholder for recommendations logic
    // In production, this would analyze user's posting patterns,
    // successful hires, etc. to suggest relevant actions
    
    return res.json({
      recommendations: []
    });
  } catch (err) {
    console.error("getRecommendations error:", err);
    return res.status(500).json({ message: err.message || "Failed to load recommendations" });
  }
};

// PROFILE MANAGEMENT ENDPOINTS

// Get student profile
export const getProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    // Get user data
    const user = await User.findById(studentId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get student profile data
    let student = await Student.findOne({ user: studentId });
    
    // If no student profile exists, create one
    if (!student) {
      student = await Student.create({
        user: studentId,
        phone: user.phone || '',
        city: user.city || ''
      });
    }

    // Combine user and student data
    const profileData = {
      // Personal Information
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone: student.phone || user.phone || '',
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      address: student.address || user.address,
      city: student.city || user.city,
      profileImage: student.profileImage || user.profileImage || user.avatar,
      
      // Academic Information
      currentEducationLevel: student.currentEducationLevel,
      institution: student.institution,
      currentGrade: student.currentGrade,
      targetGrade: student.targetGrade,
      
      // Learning Preferences
      preferredSubjects: student.preferredSubjects || [],
      weakSubjects: student.weakSubjects || [],
      preferredLocations: student.preferredLocations || [],
      preferredTeachingMode: student.preferredTeachingMode || [],
      preferredTutorGender: student.preferredTutorGender,
      budgetRange: student.budgetRange || { min: 0, max: 0, currency: 'BDT' },
      availability: student.availability || {
        monday: { available: false, timeSlots: [] },
        tuesday: { available: false, timeSlots: [] },
        wednesday: { available: false, timeSlots: [] },
        thursday: { available: false, timeSlots: [] },
        friday: { available: false, timeSlots: [] },
        saturday: { available: false, timeSlots: [] },
        sunday: { available: false, timeSlots: [] }
      },
      
      // About Me
      bio: student.bio,
      learningGoals: student.learningGoals,
      interests: student.interests || [],
      hobbies: student.hobbies || [],
      
      // System fields
      isVerified: user.isVerified,
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
      updatedAt: student.updatedAt
    };

    return res.json({
      success: true,
      profile: profileData
    });
  } catch (err) {
    console.error("getProfile error:", err);
    return res.status(500).json({ message: err.message || "Failed to load profile" });
  }
};

// Update student profile
export const updateProfile = async (req, res) => {
  try {
    const studentId = req.user._id;
    const {
      // Personal Information
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      
      // Academic Information
      currentEducationLevel,
      institution,
      currentGrade,
      targetGrade,
      
      // Learning Preferences
      preferredSubjects,
      weakSubjects,
      preferredLocations,
      preferredTeachingMode,
      preferredTutorGender,
      budgetRange,
      availability,
      
      // About Me
      bio,
      learningGoals,
      interests,
      hobbies
    } = req.body;

    // Update User model
    const userUpdateData = {};
    if (firstName !== undefined) userUpdateData.firstName = firstName;
    if (lastName !== undefined) userUpdateData.lastName = lastName;
    if (phone !== undefined) userUpdateData.phone = phone;
    if (dateOfBirth !== undefined) userUpdateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) userUpdateData.gender = gender;
    if (address !== undefined) userUpdateData.address = address;
    if (city !== undefined) userUpdateData.city = city;

    // Update name field for backward compatibility
    if (firstName && lastName) {
      userUpdateData.name = `${firstName} ${lastName}`;
    }

    if (Object.keys(userUpdateData).length > 0) {
      await User.findByIdAndUpdate(studentId, userUpdateData);
    }

    // Update Student model
    const studentUpdateData = {};
    if (phone !== undefined) studentUpdateData.phone = phone;
    if (dateOfBirth !== undefined) studentUpdateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) studentUpdateData.gender = gender;
    if (address !== undefined) studentUpdateData.address = address;
    if (city !== undefined) studentUpdateData.city = city;
    if (currentEducationLevel !== undefined) studentUpdateData.currentEducationLevel = currentEducationLevel;
    if (institution !== undefined) studentUpdateData.institution = institution;
    if (currentGrade !== undefined) studentUpdateData.currentGrade = currentGrade;
    if (targetGrade !== undefined) studentUpdateData.targetGrade = targetGrade;
    if (preferredSubjects !== undefined) studentUpdateData.preferredSubjects = preferredSubjects;
    if (weakSubjects !== undefined) studentUpdateData.weakSubjects = weakSubjects;
    if (preferredLocations !== undefined) studentUpdateData.preferredLocations = preferredLocations;
    if (preferredTeachingMode !== undefined) studentUpdateData.preferredTeachingMode = preferredTeachingMode;
    if (preferredTutorGender !== undefined) studentUpdateData.preferredTutorGender = preferredTutorGender;
    if (budgetRange !== undefined) studentUpdateData.budgetRange = budgetRange;
    if (availability !== undefined) studentUpdateData.availability = availability;
    if (bio !== undefined) studentUpdateData.bio = bio;
    if (learningGoals !== undefined) studentUpdateData.learningGoals = learningGoals;
    if (interests !== undefined) studentUpdateData.interests = interests;
    if (hobbies !== undefined) studentUpdateData.hobbies = hobbies;

    // Update or create student profile
    const student = await Student.findOneAndUpdate(
      { user: studentId },
      studentUpdateData,
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile: student
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: err.message || "Failed to update profile" });
  }
};

// Upload profile image
export const updateProfileImage = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // The image URL should be available in req.file.path (set by cloudinary middleware)
    const imageUrl = req.file.path;

    // Update both User and Student models
    await User.findByIdAndUpdate(studentId, { 
      profileImage: imageUrl,
      avatar: imageUrl // For backward compatibility
    });

    await Student.findOneAndUpdate(
      { user: studentId },
      { profileImage: imageUrl },
      { upsert: true }
    );

    return res.json({
      success: true,
      message: "Profile image updated successfully",
      imageUrl: imageUrl
    });
  } catch (err) {
    console.error("updateProfileImage error:", err);
    return res.status(500).json({ message: err.message || "Failed to update profile image" });
  }
};

// Get profile completion percentage
export const getProfileCompletion = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const user = await User.findById(studentId);
    const student = await Student.findOne({ user: studentId });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate completion percentage
    const fields = {
      // Required fields (higher weight)
      firstName: user.firstName ? 10 : 0,
      lastName: user.lastName ? 10 : 0,
      phone: (student?.phone || user.phone) ? 10 : 0,
      
      // Personal information
      dateOfBirth: student?.dateOfBirth ? 5 : 0,
      gender: student?.gender ? 5 : 0,
      address: (student?.address || user.address) ? 5 : 0,
      city: (student?.city || user.city) ? 5 : 0,
      profileImage: (student?.profileImage || user.profileImage) ? 5 : 0,
      
      // Academic information
      currentEducationLevel: student?.currentEducationLevel ? 10 : 0,
      institution: student?.institution ? 5 : 0,
      
      // Preferences
      preferredSubjects: (student?.preferredSubjects?.length > 0) ? 10 : 0,
      preferredTeachingMode: (student?.preferredTeachingMode?.length > 0) ? 5 : 0,
      budgetRange: (student?.budgetRange?.max > 0) ? 5 : 0,
      
      // About me
      bio: student?.bio ? 10 : 0,
      learningGoals: student?.learningGoals ? 5 : 0
    };

    const totalScore = Object.values(fields).reduce((sum, score) => sum + score, 0);
    const maxScore = 100;
    const completionPercentage = Math.round((totalScore / maxScore) * 100);

    // Get missing fields
    const missingFields = Object.keys(fields).filter(field => fields[field] === 0);

    return res.json({
      success: true,
      completionPercentage,
      missingFields,
      recommendations: getMissingFieldRecommendations(missingFields)
    });
  } catch (err) {
    console.error("getProfileCompletion error:", err);
    return res.status(500).json({ message: err.message || "Failed to calculate profile completion" });
  }
};

// Helper function for profile completion recommendations
const getMissingFieldRecommendations = (missingFields) => {
  const recommendations = [];
  
  if (missingFields.includes('firstName') || missingFields.includes('lastName')) {
    recommendations.push("Complete your name for better profile visibility");
  }
  if (missingFields.includes('phone')) {
    recommendations.push("Add your phone number to enable direct contact");
  }
  if (missingFields.includes('profileImage')) {
    recommendations.push("Upload a profile picture to build trust");
  }
  if (missingFields.includes('currentEducationLevel')) {
    recommendations.push("Specify your education level to get better tutor matches");
  }
  if (missingFields.includes('preferredSubjects')) {
    recommendations.push("Select your preferred subjects to find relevant tutors");
  }
  if (missingFields.includes('bio')) {
    recommendations.push("Write a brief bio to introduce yourself to tutors");
  }
  
  return recommendations;
};
