// backend/controllers/tutorController.js
import TuitionPost from "../models/TuitionPost.js";
import Application from "../models/Application.js";
import Chat from "../models/Chat.js";
import Review from "../models/Review.js";
import User from "../models/User.js";
import Tutor from "../models/Tutor.js";
import { sendNotification } from "./notificationController.js";

// Enhanced job board with filters and search
export const getJobBoard = async (req, res) => {
  try {
    const {
      classLevel,
      subject,
      location,
      minPay,
      maxPay,
      mode,
      medium,
      preferredGender,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { 
      status: { $in: ['active'] },
      isActive: true
    };

    // Apply filters
    if (classLevel) query.classLevel = classLevel;
    if (location) query.location = new RegExp(location, "i");
    if (subject) query.subjects = { $in: [new RegExp(subject, "i")] };
    if (mode) query.mode = mode;
    if (medium) query.medium = medium;
    if (preferredGender && preferredGender !== 'Any') {
      query.preferredGender = { $in: [preferredGender, 'Any'] };
    }

    // Payment range filter
    if (minPay || maxPay) {
      query.expectedPayment = {};
      if (minPay) query.expectedPayment.$gte = Number(minPay);
      if (maxPay) query.expectedPayment.$lte = Number(maxPay);
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const posts = await TuitionPost.find(query)
      .populate('student', 'name location')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await TuitionPost.countDocuments(query);

    // Add application status for current tutor
    const postsWithStatus = await Promise.all(
      posts.map(async (post) => {
        const application = await Application.findOne({
          post: post._id,
          tutor: req.user._id
        });

        return {
          ...post.toObject(),
          applicationStatus: application?.status || null,
          applicationId: application?._id || null
        };
      })
    );

    return res.json({
      posts: postsWithStatus,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error("getJobBoard error:", err);
    return res.status(500).json({ message: err.message || "Failed to load job board" });
  }
};

// Get single job details
export const getJobDetails = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const post = await TuitionPost.findOne({
      _id: postId,
      status: { $in: ['active'] },
      isActive: true
    }).populate('student', 'name location phone');

    if (!post) {
      return res.status(404).json({ message: "Job not found or no longer available" });
    }

    // Check if tutor has already submitted
    const application = await Application.findOne({
      post: postId,
      tutor: req.user._id
    });

    // Increment view count
    await TuitionPost.findByIdAndUpdate(postId, {
      $inc: { viewsCount: 1 }
    });

    return res.json({
      ...post.toObject(),
      applicationStatus: application?.status || null,
      applicationId: application?._id || null
    });
  } catch (err) {
    console.error("getJobDetails error:", err);
    return res.status(500).json({ message: err.message || "Failed to load job details" });
  }
};

// Apply to a job posting
export const applyToJob = async (req, res) => {
  try {
    const { postId } = req.params;
    const { pitch = "", proposedRate, availability = [] } = req.body;

    console.log(`🎯 ApplyToJob: Tutor ${req.user._id} applying to post ${postId}`);

    // Validate the job post exists and is active
    const post = await TuitionPost.findById(postId);
    if (!post) {
      console.log(`❌ Post ${postId} not found`);
      return res.status(404).json({ message: "Job not found" });
    }

    if (!['active'].includes(post.status) || !post.isActive) {
      console.log(`❌ Post ${postId} not active (status: ${post.status}, isActive: ${post.isActive})`);
      return res.status(400).json({ 
        message: "This job is no longer accepting applications" 
      });
    }

    // Prevent self-application
    if (String(post.student) === String(req.user._id)) {
      console.log(`❌ Self-application prevented for post ${postId}`);
      return res.status(400).json({ 
        message: "Cannot apply to your own job posting" 
      });
    }

    // COMPLETELY DELETE any existing applications first (aggressive cleanup)
    console.log(`🧹 Cleaning up any existing applications for tutor ${req.user._id} to post ${postId}`);
    const deleteResult = await Application.deleteMany({
      post: postId,
      tutor: req.user._id
    });
    console.log(`   Deleted ${deleteResult.deletedCount} existing applications`);

    // Create new application with retry mechanism
    let application;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        console.log(`📝 Creating application (attempt ${retryCount + 1}/${maxRetries})`);
        
        application = await Application.create({
          post: postId,
          tutor: req.user._id,
          pitch,
          proposedRate,
          availability,
          status: "submitted",
          createdAt: new Date(),
          updatedAt: new Date()
        });

        console.log(`✅ Application created successfully: ${application._id}`);
        break; // Success - exit retry loop
        
      } catch (createError) {
        retryCount++;
        console.log(`❌ Application creation failed (attempt ${retryCount}): ${createError.message}`);
        
        if (createError.code === 11000) {
          // Duplicate key error - clean up more aggressively
          console.log(`🧹 Duplicate key error - aggressive cleanup (attempt ${retryCount})`);
          await Application.deleteMany({
            post: postId,
            tutor: req.user._id
          });
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (retryCount >= maxRetries) {
            console.log(`❌ Max retries reached - giving up`);
            return res.status(409).json({ 
              message: "Unable to submit application due to database conflict. Please try again.",
              error: "MAX_RETRIES_EXCEEDED"
            });
          }
        } else {
          // Non-duplicate error - don't retry
          throw createError;
        }
      }
    }

    if (!application) {
      console.log(`❌ Application creation failed after all retries`);
      return res.status(500).json({ 
        message: "Failed to create application after multiple attempts",
        error: "APPLICATION_CREATION_FAILED"
      });
    }

    // Increment applications count
    console.log(`📊 Incrementing applications count for post ${postId}`);
    await TuitionPost.findByIdAndUpdate(postId, {
      $inc: { applicationsCount: 1 }
    });

    // Send notification to student about new application
    try {
      console.log(`📧 Sending notification to student ${post.student}`);
      const tutorInfo = await User.findById(req.user._id, 'name');
      await sendNotification('new_application', post.student, {
        jobTitle: post.title,
        postId: postId,
        tutorName: tutorInfo.name
      });
      console.log(`✅ Notification sent successfully`);
    } catch (notifError) {
      console.error("📧 Failed to send application notification:", notifError);
      // Don't fail the application because notification failed
    }

    console.log(`🎉 Application process completed successfully: ${application._id}`);
    return res.status(201).json({
      ...application.toObject(),
      message: "Application submitted successfully!"
    });

  } catch (err) {
    console.error("💥 ApplyToJob unexpected error:", err);
    return res.status(500).json({ 
      message: "An unexpected error occurred while submitting your application. Please try again.",
      error: err.message
    });
  }
};

// Update application (before shortlisted)
export const updateApplication = async (req, res) => {
  try {
    const { appId } = req.params;
    const { pitch, proposedRate, availability } = req.body;

    const application = await Application.findOne({
      _id: appId,
      tutor: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== 'submitted') {
      return res.status(400).json({ 
        message: "Cannot update application after it has been processed" 
      });
    }

    if (pitch !== undefined) application.pitch = pitch;
    if (proposedRate !== undefined) application.proposedRate = proposedRate;
    if (availability !== undefined) application.availability = availability;

    await application.save();
    return res.json(application);
  } catch (err) {
    console.error("updateApplication error:", err);
    return res.status(500).json({ message: err.message || "Failed to update application" });
  }
};

// Withdraw application
export const withdrawApplication = async (req, res) => {
  try {
    const { appId } = req.params;

    const application = await Application.findOne({
      _id: appId,
      tutor: req.user._id
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status === 'accepted') {
      return res.status(400).json({ 
        message: "Cannot withdraw accepted application" 
      });
    }

    application.status = 'withdrawn';
    await application.save();

    return res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.error("withdrawApplication error:", err);
    return res.status(500).json({ message: err.message || "Failed to withdraw application" });
  }
};

// Get my applications with enhanced filtering
export const getMyApplications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { tutor: req.user._id };
    
    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate({
        path: 'post',
        populate: {
          path: 'student',
          select: 'name location'
        }
      })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Application.countDocuments(query);

    return res.json({
      applications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error("getMyApplications error:", err);
    return res.status(500).json({ message: err.message || "Failed to load applications" });
  }
};

// Get accepted jobs (ongoing work)
export const getMyJobs = async (req, res) => {
  try {
    const acceptedApplications = await Application.find({
      tutor: req.user._id,
      status: 'accepted'
    }).populate({
      path: 'post',
      populate: {
        path: 'student',
        select: 'name email phone location'
      }
    }).sort({ createdAt: -1 });

    return res.json(acceptedApplications);
  } catch (err) {
    console.error("getMyJobs error:", err);
    return res.status(500).json({ message: err.message || "Failed to load jobs" });
  }
};

// Get my chats
export const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({ tutor: req.user._id })
      .populate('post', 'title classLevel subjects')
      .populate('student', 'name')
      .sort({ updatedAt: -1 });

    return res.json(chats);
  } catch (err) {
    console.error("getMyChats error:", err);
    return res.status(500).json({ message: err.message || "Failed to load chats" });
  }
};

// Get my reviews
export const getMyReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const reviews = await Review.find({ 
      tutor: req.user._id,
      visible: true 
    })
      .populate('student', 'name')
      .populate('post', 'title classLevel subjects')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Review.countDocuments({ 
      tutor: req.user._id,
      visible: true 
    });

    // Calculate average rating
    const ratingStats = await Review.aggregate([
      { $match: { tutor: req.user._id, visible: true } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const stats = ratingStats.length > 0 ? ratingStats[0] : {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: []
    };

    return res.json({
      reviews,
      stats,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (err) {
    console.error("getMyReviews error:", err);
    return res.status(500).json({ message: err.message || "Failed to load reviews" });
  }
};

// Get dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const tutorId = req.user._id;

    const totalApplications = await Application.countDocuments({ tutor: tutorId });
    const pendingApplications = await Application.countDocuments({ 
      tutor: tutorId, 
      status: 'submitted' 
    });
    const shortlistedApplications = await Application.countDocuments({ 
      tutor: tutorId, 
      status: 'shortlisted' 
    });
    const acceptedJobs = await Application.countDocuments({ 
      tutor: tutorId, 
      status: 'accepted' 
    });

    const totalReviews = await Review.countDocuments({ 
      tutor: tutorId, 
      visible: true 
    });

    // Calculate average rating
    const ratingResult = await Review.aggregate([
      { $match: { tutor: tutorId, visible: true } },
      { $group: { _id: null, averageRating: { $avg: '$rating' } } }
    ]);
    
    const averageRating = ratingResult.length > 0 ? ratingResult[0].averageRating : 0;

    const activeChats = await Chat.countDocuments({
      tutor: tutorId,
      'messages.0': { $exists: true }
    });

    // Available jobs count (not submitted to)
    const submittedPostIds = await Application.find({ tutor: tutorId }).distinct('post');
    const availableJobs = await TuitionPost.countDocuments({
      _id: { $nin: submittedPostIds },
      status: 'active',
      isActive: true
    });

    return res.json({
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      acceptedJobs,
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10, // round to 1 decimal
      activeChats,
      availableJobs
    });
  } catch (err) {
    console.error("getDashboardStats error:", err);
    return res.status(500).json({ message: err.message || "Failed to load dashboard stats" });
  }
};

// TUTOR PROFILE MANAGEMENT ENDPOINTS

// Get tutor profile
export const getProfile = async (req, res) => {
  try {
    const tutorId = req.user._id;
    
    // Get user data
    const user = await User.findById(tutorId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get tutor profile data
    let tutor = await Tutor.findOne({ user: tutorId });
    
    // If no tutor profile exists, create one
    if (!tutor) {
      tutor = await Tutor.create({
        user: tutorId,
        phone: user.phone || ''
      });
    }

    // Combine user and tutor data
    const profileData = {
      // Personal Information
      firstName: user.firstName || user.name?.split(' ')[0] || '',
      lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email,
      phone: tutor.phone || user.phone || '',
      dateOfBirth: tutor.dateOfBirth || user.dateOfBirth,
      gender: tutor.gender || user.gender,
      address: tutor.address || user.address,
      city: tutor.city || user.city,
      profileImage: tutor.profileImage || user.profileImage || user.avatar,
      
      // Professional Information
      education: tutor.education,
      institution: tutor.institution,
      graduationYear: tutor.graduationYear,
      currentStatus: tutor.currentStatus,
      yearsOfExperience: tutor.yearsOfExperience,
      professionalTitle: tutor.professionalTitle,
      
      // Teaching Information
      subjects: tutor.subjects || [],
      educationLevels: tutor.educationLevels || [],
      preferredLocations: tutor.preferredLocations || [],
      teachingMode: tutor.teachingMode || [],
      hourlyRate: tutor.hourlyRate,
      currency: tutor.currency || 'BDT',
      languages: tutor.languages || [],
      
      // Availability
      availability: tutor.availability || {
        monday: { available: false, timeSlots: [] },
        tuesday: { available: false, timeSlots: [] },
        wednesday: { available: false, timeSlots: [] },
        thursday: { available: false, timeSlots: [] },
        friday: { available: false, timeSlots: [] },
        saturday: { available: false, timeSlots: [] },
        sunday: { available: false, timeSlots: [] }
      },
      
      // Portfolio & Experience
      bio: tutor.bio,
      teachingPhilosophy: tutor.teachingPhilosophy,
      achievements: tutor.achievements,
      certifications: tutor.certifications || [],
      portfolio: tutor.portfolio || {
        workExperience: [],
        sampleWorks: [],
        testimonials: []
      },
      
      // Statistics and Verification
      rating: tutor.rating || { average: 0, totalReviews: 0 },
      isVerified: tutor.isVerified || user.isVerified,
      verificationBadges: tutor.verificationBadges || [],
      stats: tutor.stats || {
        totalStudents: 0,
        totalSessions: 0,
        successRate: 0,
        responseTime: 0
      },
      
      // System fields
      verificationStatus: user.verificationStatus,
      createdAt: user.createdAt,
      updatedAt: tutor.updatedAt
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

// Update tutor profile
export const updateProfile = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const {
      // Personal Information
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      
      // Professional Information
      education,
      institution,
      graduationYear,
      currentStatus,
      yearsOfExperience,
      professionalTitle,
      
      // Teaching Information
      subjects,
      educationLevels,
      preferredLocations,
      teachingMode,
      hourlyRate,
      currency,
      languages,
      
      // Availability
      availability,
      
      // Portfolio & Experience
      bio,
      teachingPhilosophy,
      achievements,
      certifications,
      portfolio
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
      await User.findByIdAndUpdate(tutorId, userUpdateData);
    }

    // Update Tutor model
    const tutorUpdateData = {};
    
    // Personal Information
    if (phone !== undefined) tutorUpdateData.phone = phone;
    if (dateOfBirth !== undefined) tutorUpdateData.dateOfBirth = dateOfBirth;
    if (gender !== undefined) tutorUpdateData.gender = gender;
    if (address !== undefined) tutorUpdateData.address = address;
    if (city !== undefined) tutorUpdateData.city = city;
    
    // Professional Information
    if (education !== undefined) tutorUpdateData.education = education;
    if (institution !== undefined) tutorUpdateData.institution = institution;
    if (graduationYear !== undefined) tutorUpdateData.graduationYear = graduationYear;
    if (currentStatus !== undefined) tutorUpdateData.currentStatus = currentStatus;
    if (yearsOfExperience !== undefined) tutorUpdateData.yearsOfExperience = yearsOfExperience;
    if (professionalTitle !== undefined) tutorUpdateData.professionalTitle = professionalTitle;
    
    // Teaching Information
    if (subjects !== undefined) tutorUpdateData.subjects = subjects;
    if (educationLevels !== undefined) tutorUpdateData.educationLevels = educationLevels;
    if (preferredLocations !== undefined) tutorUpdateData.preferredLocations = preferredLocations;
    if (teachingMode !== undefined) tutorUpdateData.teachingMode = teachingMode;
    if (hourlyRate !== undefined) tutorUpdateData.hourlyRate = hourlyRate;
    if (currency !== undefined) tutorUpdateData.currency = currency;
    if (languages !== undefined) tutorUpdateData.languages = languages;
    
    // Availability
    if (availability !== undefined) tutorUpdateData.availability = availability;
    
    // Portfolio & Experience
    if (bio !== undefined) tutorUpdateData.bio = bio;
    if (teachingPhilosophy !== undefined) tutorUpdateData.teachingPhilosophy = teachingPhilosophy;
    if (achievements !== undefined) tutorUpdateData.achievements = achievements;
    if (certifications !== undefined) tutorUpdateData.certifications = certifications;
    if (portfolio !== undefined) tutorUpdateData.portfolio = portfolio;

    // Update or create tutor profile
    const tutor = await Tutor.findOneAndUpdate(
      { user: tutorId },
      tutorUpdateData,
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "Profile updated successfully",
      profile: tutor
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ message: err.message || "Failed to update profile" });
  }
};

// Upload profile image
export const updateProfileImage = async (req, res) => {
  try {
    const tutorId = req.user._id;
    
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    // The image URL should be available in req.file.path (set by cloudinary middleware)
    const imageUrl = req.file.path;

    // Update both User and Tutor models
    await User.findByIdAndUpdate(tutorId, { 
      profileImage: imageUrl,
      avatar: imageUrl // For backward compatibility
    });

    await Tutor.findOneAndUpdate(
      { user: tutorId },
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
    const tutorId = req.user._id;
    
    const user = await User.findById(tutorId);
    const tutor = await Tutor.findOne({ user: tutorId });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate completion percentage for tutor
    const fields = {
      // Required fields (higher weight)
      firstName: user.firstName ? 8 : 0,
      lastName: user.lastName ? 8 : 0,
      phone: (tutor?.phone || user.phone) ? 8 : 0,
      
      // Personal information
      dateOfBirth: (tutor?.dateOfBirth || user.dateOfBirth) ? 4 : 0,
      gender: (tutor?.gender || user.gender) ? 4 : 0,
      address: (tutor?.address || user.address) ? 4 : 0,
      city: (tutor?.city || user.city) ? 4 : 0,
      profileImage: (tutor?.profileImage || user.profileImage) ? 6 : 0,
      
      // Professional information
      education: tutor?.education ? 10 : 0,
      institution: tutor?.institution ? 6 : 0,
      currentStatus: tutor?.currentStatus ? 6 : 0,
      yearsOfExperience: tutor?.yearsOfExperience ? 6 : 0,
      
      // Teaching information
      subjects: (tutor?.subjects?.length > 0) ? 12 : 0,
      educationLevels: (tutor?.educationLevels?.length > 0) ? 8 : 0,
      teachingMode: (tutor?.teachingMode?.length > 0) ? 6 : 0,
      hourlyRate: (tutor?.hourlyRate > 0) ? 6 : 0,
      
      // Portfolio
      bio: tutor?.bio ? 8 : 0
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
      recommendations: getTutorMissingFieldRecommendations(missingFields)
    });
  } catch (err) {
    console.error("getProfileCompletion error:", err);
    return res.status(500).json({ message: err.message || "Failed to calculate profile completion" });
  }
};

// Add work experience to portfolio
export const addWorkExperience = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { title, institution, duration, description, startDate, endDate, current } = req.body;

    const workExperience = {
      title,
      institution,
      duration,
      description,
      startDate,
      endDate,
      current: current || false
    };

    const tutor = await Tutor.findOneAndUpdate(
      { user: tutorId },
      { $push: { 'portfolio.workExperience': workExperience } },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: "Work experience added successfully",
      workExperience: tutor.portfolio.workExperience
    });
  } catch (err) {
    console.error("addWorkExperience error:", err);
    return res.status(500).json({ message: err.message || "Failed to add work experience" });
  }
};

// Update work experience
export const updateWorkExperience = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { experienceId } = req.params;
    const { title, institution, duration, description, startDate, endDate, current } = req.body;

    const tutor = await Tutor.findOneAndUpdate(
      { user: tutorId, 'portfolio.workExperience._id': experienceId },
      {
        $set: {
          'portfolio.workExperience.$.title': title,
          'portfolio.workExperience.$.institution': institution,
          'portfolio.workExperience.$.duration': duration,
          'portfolio.workExperience.$.description': description,
          'portfolio.workExperience.$.startDate': startDate,
          'portfolio.workExperience.$.endDate': endDate,
          'portfolio.workExperience.$.current': current || false
        }
      },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({ message: "Work experience not found" });
    }

    return res.json({
      success: true,
      message: "Work experience updated successfully"
    });
  } catch (err) {
    console.error("updateWorkExperience error:", err);
    return res.status(500).json({ message: err.message || "Failed to update work experience" });
  }
};

// Delete work experience
export const deleteWorkExperience = async (req, res) => {
  try {
    const tutorId = req.user._id;
    const { experienceId } = req.params;

    const tutor = await Tutor.findOneAndUpdate(
      { user: tutorId },
      { $pull: { 'portfolio.workExperience': { _id: experienceId } } },
      { new: true }
    );

    if (!tutor) {
      return res.status(404).json({ message: "Tutor not found" });
    }

    return res.json({
      success: true,
      message: "Work experience deleted successfully"
    });
  } catch (err) {
    console.error("deleteWorkExperience error:", err);
    return res.status(500).json({ message: err.message || "Failed to delete work experience" });
  }
};

// Helper function for tutor profile completion recommendations
const getTutorMissingFieldRecommendations = (missingFields) => {
  const recommendations = [];
  
  if (missingFields.includes('firstName') || missingFields.includes('lastName')) {
    recommendations.push("Complete your name for professional appearance");
  }
  if (missingFields.includes('phone')) {
    recommendations.push("Add your phone number for student contact");
  }
  if (missingFields.includes('profileImage')) {
    recommendations.push("Upload a professional photo to build trust with students");
  }
  if (missingFields.includes('education')) {
    recommendations.push("Add your education details to showcase qualifications");
  }
  if (missingFields.includes('subjects')) {
    recommendations.push("Select subjects you can teach to appear in relevant searches");
  }
  if (missingFields.includes('hourlyRate')) {
    recommendations.push("Set your hourly rate to help students understand your pricing");
  }
  if (missingFields.includes('bio')) {
    recommendations.push("Write a compelling bio to attract more students");
  }
  if (missingFields.includes('currentStatus')) {
    recommendations.push("Specify your current professional status");
  }
  
  return recommendations;
};
