// backend/controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Add these two models to persist tutor profile + uploaded files
const Tutor = require("../models/Tutor");
const Document = require("../models/Document");

// REGISTER (handles student and tutor; tutor supports multipart file uploads)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validate role (lowercase to match your existing user schema usage)
    if (!["student", "tutor"].includes((role || "").toLowerCase())) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Deduplicate
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role.toLowerCase(), // "student" | "tutor"
      isVerified: false,        // admin must verify
      status: "ACTIVE",
    });
    await newUser.save();

    // If tutor, create profile + save documents (studentId, educationDocument)
    if (newUser.role === "tutor") {
      // Ensure Tutor model exists with fields: user, phone, documents: [ObjectId]
      const tutor = await Tutor.create({
        user: newUser._id,
        phone: phone || "",
        documents: [],
      });

      // Multer .fields() puts files at req.files.{fieldName}[0]
      const studentIdFile = req.files?.studentId?.[0];
      const eduDocFile = req.files?.educationDocument?.[0];

      const createdDocs = [];

      if (studentIdFile) {
        const d = await Document.create({
          owner: newUser._id,
          kind: "STUDENT_ID",
          originalName: studentIdFile.originalname,
          mimeType: studentIdFile.mimetype,
          size: studentIdFile.size,
          path: studentIdFile.path,                  // absolute path on disk
          url: `/uploads/${studentIdFile.filename}`, // served statically
        });
        createdDocs.push(d._id);
      }

      if (eduDocFile) {
        const d = await Document.create({
          owner: newUser._id,
          kind: "EDUCATION_DOC",
          originalName: eduDocFile.originalname,
          mimeType: eduDocFile.mimetype,
          size: eduDocFile.size,
          path: eduDocFile.path,
          url: `/uploads/${eduDocFile.filename}`,
        });
        createdDocs.push(d._id);
      }

      if (createdDocs.length) {
        tutor.documents.push(...createdDocs);
        await tutor.save();
      }
    }

    return res
      .status(201)
      .json({ message: "User registered successfully. Awaiting admin verification." });
  } catch (err) {
    console.error("registerUser error:", err);
    res.status(500).json({ message: err.message || "Registration failed" });
  }
};

// LOGIN (unchanged logic; returns isVerified so frontend can gate dashboards)
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if account is active
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account is not active" });
    }

    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, isVerified: user.isVerified },
      process.env.JWT_SECRET,
      { expiresIn: "2d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
      },
    });
  } catch (err) {
    console.error("loginUser error:", err);
    res.status(500).json({ message: err.message || "Login failed" });
  }
};

// GET Profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to load profile" });
  }
};

// UPDATE Profile
const updateProfile = async (req, res) => {
  try {
    // Whitelist allowed fields
    const allowedFields = ["name", "phone"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
    }).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update profile" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
};
