const express = require("express");
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ New: Profile routes
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
