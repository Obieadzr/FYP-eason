// backend/middleware/auth.js — single unified Bearer token middleware
import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ success: false, message: "Token is empty" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    let message = "Invalid token";
    if (err.name === "TokenExpiredError") message = "Token has expired. Please log in again.";
    else if (err.name === "JsonWebTokenError") message = "Malformed or invalid token.";

    return res.status(401).json({ success: false, message, error: err.name });
  }
};