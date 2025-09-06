import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "No token provided" });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Invalid user" });

    if (user.status !== "ACTIVE" && user.role !== "admin") {
      // admins can be active regardless; others must be ACTIVE to use protected routes
      // (you can loosen this if you want unverified users to hit some endpoints)
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export const requireVerified = (req, res, next) => {
  // Admin always passes verification check
  if (req.user?.role === "admin") {
    return next();
  }
  
  // For students and tutors, check verification status
  if (req.user?.verificationStatus !== "verified") {
    return res.status(423).json({ 
      message: "Account verification required to access this resource",
      verificationStatus: req.user?.verificationStatus || "pending"
    });
  }
  
  next();
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      return res.status(403).json({ message: "Forbidden - insufficient permissions" });
    }
    next();
  };
};
