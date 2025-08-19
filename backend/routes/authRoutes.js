// backend/routes/authRoutes.js
const express = require("express");
const { registerUser, loginUser } = require("../controllers/authController");
const { upload } = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post(
  "/register",
  upload.fields([
    { name: "studentId", maxCount: 1 },
    { name: "educationDocument", maxCount: 1 },
  ]),
  registerUser
);

router.post("/login", loginUser);

module.exports = router;
