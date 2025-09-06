// backend/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/User.js";
import Tutor from "../models/Tutor.js";
import Student from "../models/Student.js";
import Document from "../models/Document.js";

// Helper: create JWT
const signToken = (user) =>
  jwt.sign(
    { id: user._id, role: user.role, isVerified: user.isVerified },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );

// REGISTER (Student & Tutor)
// Accepts multipart/form-data from frontend with fields:
// - name, email, phone, password, role
// - Files:
//    studentId (single, required for BOTH roles)
//    parentNid (single, required for STUDENT)
//    educationDocument (multi, required min 1 for BOTH)
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const roleLower = String(role || "").toLowerCase();

    if (!["student", "tutor"].includes(roleLower)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Deduplicate
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    // Required files
    const studentIdFile = req.files?.studentId?.[0] || null;
    const parentNidFile = req.files?.parentNid?.[0] || null; // students only
    const eduDocs = Array.isArray(req.files?.educationDocument)
      ? req.files.educationDocument
      : [];

    if (!studentIdFile) {
      return res.status(400).json({ message: "Student ID is required" });
    }
    if (roleLower === "student" && !parentNidFile) {
      return res.status(400).json({ message: "Parent NID is required for student registration" });
    }
    if (!eduDocs.length) {
      return res.status(400).json({ message: "At least one education document is required" });
    }

    // Create user
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: roleLower,
      isVerified: false,
      verificationStatus: process.env.NODE_ENV === "development" ? "verified" : "pending", // auto-verify in dev
      status: "ACTIVE", // user is active but not verified
    });

    // Save docs
    const createdDocIds = [];

    // Student ID
    const sid = await Document.create({
      userId: user._id,
      type: "STUDENT_ID",
      url: `/uploads/${studentIdFile.filename}`,
      filename: studentIdFile.filename,
      mimetype: studentIdFile.mimetype,
      size: studentIdFile.size,
    });
    createdDocIds.push(sid._id);

    // Parent NID (student only)
    if (roleLower === "student" && parentNidFile) {
      const pnid = await Document.create({
        userId: user._id,
        type: "PARENT_NID",
        url: `/uploads/${parentNidFile.filename}`,
        filename: parentNidFile.filename,
        mimetype: parentNidFile.mimetype,
        size: parentNidFile.size,
      });
      createdDocIds.push(pnid._id);
    }

    // Education docs (multi)
    for (const f of eduDocs) {
      const ed = await Document.create({
        userId: user._id,
        type: "EDU_DOC",
        url: `/uploads/${f.filename}`,
        filename: f.filename,
        mimetype: f.mimetype,
        size: f.size,
      });
      createdDocIds.push(ed._id);
    }

    // Create role profile and attach documents
    if (roleLower === "tutor") {
      const tutor = await Tutor.create({
        user: user._id,
        phone: phone || "",
        documents: createdDocIds,
      });
      // optional back-ref if your schema supports it
      // user.tutorProfile = tutor._id; await user.save();
    } else {
      const student = await Student.create({
        user: user._id,
        phone: phone || "",
        documents: createdDocIds,
      });
      // optional back-ref
      // user.studentProfile = student._id; await user.save();
    }

    return res
      .status(201)
      .json({ message: "User registered successfully. Awaiting admin verification." });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ message: err.message || "Registration failed" });
  }
};

// LOGIN (Student/Tutor/Admin)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account is not active" });
    }

    const ok = await bcrypt.compare(password, user.password || "");
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    // Admin can always log in
    if (user.role === "admin") {
      const token = signToken(user);
      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: true, // admins are always considered verified
          verificationStatus: "verified",
          status: user.status,
        },
      });
    }

    // For students and tutors, check verification status
    if (user.verificationStatus === "pending") {
      return res.status(423).json({ 
        message: "Your account is awaiting admin verification. Please wait for approval.",
        verificationStatus: "pending"
      });
    }

    if (user.verificationStatus === "rejected") {
      return res.status(423).json({ 
        message: "Your account verification was rejected. Please contact support.",
        verificationStatus: "rejected",
        reason: user.verificationReason
      });
    }

    // User is verified, allow login
    const token = signToken(user);
    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        verificationStatus: user.verificationStatus,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ message: err.message || "Login failed" });
  }
};

// GET Profile
export const getProfile = async (req, res) => {
  try {
    const me = await User.findById(req.user.id).select("-password");
    return res.json(me);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to load profile" });
  }
};

// UPDATE Profile
export const updateProfile = async (req, res) => {
  try {
    const allowed = ["name", "phone"];
    const updates = {};
    for (const k of allowed) {
      if (req.body[k] !== undefined) updates[k] = req.body[k];
    }
    const me = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    return res.json(me);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to update profile" });
  }
};
