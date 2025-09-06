import { protect } from "./authMiddleware.js";

// Middleware to ensure the user has the 'admin' role
const requireAdminRole = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
};

export { requireAdminRole };
