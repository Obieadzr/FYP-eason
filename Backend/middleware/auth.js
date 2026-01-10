// backend/middleware/auth.js
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  // Get token from Authorization header (Bearer token) or cookie
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.eason_token;

  if (!token) {
    return res.status(401).json({ message: "No token provided - unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};