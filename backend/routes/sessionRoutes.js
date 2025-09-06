// backend/routes/sessionRoutes.js
import express from "express";
import Session from "../models/Session.js";
import TuitionPost from "../models/TuitionPost.js";
import Application from "../models/Application.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a session (after application is accepted)
router.post("/", protect, async (req, res) => {
  try {
    const { applicationId, scheduledAt, duration, sessionType, notes } = req.body;

    // Verify application exists and is accepted
    const application = await Application.findById(applicationId)
      .populate('post')
      .populate('tutor')
      .populate('student');

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== 'accepted') {
      return res.status(400).json({ message: "Application must be accepted to create session" });
    }

    // Verify user is the student or tutor from the application
    const userId = req.user.id;
    if (application.post.student.toString() !== userId && application.tutor._id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to create session for this application" });
    }

    const session = new Session({
      application: applicationId,
      tutor: application.tutor._id,
      student: application.post.student,
      post: application.post._id,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      sessionType: sessionType || 'individual',
      notes,
      status: 'scheduled'
    });

    await session.save();
    await session.populate(['tutor', 'student', 'post', 'application']);

    res.status(201).json({
      message: "Session created successfully",
      session
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({ message: "Failed to create session", error: error.message });
  }
});

// Get sessions for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, upcoming, past } = req.query;

    let query = {
      $or: [
        { student: userId },
        { tutor: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (upcoming === 'true') {
      query.scheduledAt = { $gte: new Date() };
    }

    if (past === 'true') {
      query.scheduledAt = { $lt: new Date() };
    }

    const sessions = await Session.find(query)
      .populate('tutor', 'name email phone')
      .populate('student', 'name email phone')
      .populate('post', 'title subject')
      .populate('application')
      .sort({ scheduledAt: -1 });

    res.json({
      message: "Sessions retrieved successfully",
      sessions
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ message: "Failed to retrieve sessions", error: error.message });
  }
});

// Get specific session
router.get("/:sessionId", protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await Session.findById(sessionId)
      .populate('tutor', 'name email phone')
      .populate('student', 'name email phone')
      .populate('post', 'title subject location')
      .populate('application');

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Verify user is involved in this session
    if (session.student._id.toString() !== userId && session.tutor._id.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to view this session" });
    }

    res.json({
      message: "Session retrieved successfully",
      session
    });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({ message: "Failed to retrieve session", error: error.message });
  }
});

// Update session
router.put("/:sessionId", protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Verify user is involved in this session
    if (session.student.toString() !== userId && session.tutor.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this session" });
    }

    // Restrict certain updates based on session status
    if (session.status === 'completed' && !['feedback', 'rating'].some(field => field in updates)) {
      return res.status(400).json({ message: "Cannot modify completed session except feedback" });
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        session[key] = updates[key];
      }
    });

    await session.save();
    await session.populate(['tutor', 'student', 'post', 'application']);

    res.json({
      message: "Session updated successfully",
      session
    });
  } catch (error) {
    console.error("Update session error:", error);
    res.status(500).json({ message: "Failed to update session", error: error.message });
  }
});

// Mark attendance
router.put("/:sessionId/attendance", protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { attendance, notes } = req.body;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Only tutor can mark attendance
    if (session.tutor.toString() !== userId) {
      return res.status(403).json({ message: "Only tutor can mark attendance" });
    }

    session.attendance = attendance;
    if (notes) session.notes = notes;

    // Auto-complete session if marked as attended
    if (attendance === 'attended' && session.status === 'in-progress') {
      session.status = 'completed';
      session.completedAt = new Date();
    }

    await session.save();
    await session.populate(['tutor', 'student', 'post']);

    res.json({
      message: "Attendance marked successfully",
      session
    });
  } catch (error) {
    console.error("Mark attendance error:", error);
    res.status(500).json({ message: "Failed to mark attendance", error: error.message });
  }
});

// Start session
router.put("/:sessionId/start", protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Either tutor or student can start session
    if (session.student.toString() !== userId && session.tutor.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to start this session" });
    }

    if (session.status !== 'scheduled') {
      return res.status(400).json({ message: "Session cannot be started" });
    }

    session.status = 'in-progress';
    session.startedAt = new Date();
    await session.save();

    res.json({
      message: "Session started successfully",
      session
    });
  } catch (error) {
    console.error("Start session error:", error);
    res.status(500).json({ message: "Failed to start session", error: error.message });
  }
});

// Cancel session
router.delete("/:sessionId", protect, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Either tutor or student can cancel
    if (session.student.toString() !== userId && session.tutor.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to cancel this session" });
    }

    if (['completed', 'cancelled'].includes(session.status)) {
      return res.status(400).json({ message: "Session cannot be cancelled" });
    }

    session.status = 'cancelled';
    session.cancelledAt = new Date();
    if (reason) session.cancellationReason = reason;
    
    await session.save();

    res.json({
      message: "Session cancelled successfully",
      session
    });
  } catch (error) {
    console.error("Cancel session error:", error);
    res.status(500).json({ message: "Failed to cancel session", error: error.message });
  }
});

export default router;
