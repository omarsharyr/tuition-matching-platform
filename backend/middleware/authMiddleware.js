const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // Check for Bearer token
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }
    
    // Extract token
    const token = authHeader.split(" ")[1];
    
    // Verify token and decode
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Invalid user" });
    }
    
    // Check if account is active
    if (user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Account not active" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Middleware to require verified users
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({ message: "Account pending verification" });
  }
  next();
};

// Middleware to require specific roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden - insufficient permissions" });
    }
    next();
  };
};

module.exports = { protect, requireVerified, requireRole };
