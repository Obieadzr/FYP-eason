import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed: No Bearer token provided in Authorization header",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication failed: Token is empty or malformed",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    let message = "Invalid token";

    if (err.name === "TokenExpiredError") {
      message = "Token has expired. Please log in again.";
    } else if (err.name === "JsonWebTokenError") {
      message = "Malformed or invalid token.";
    } else if (err.name === "NotBeforeError") {
      message = "Token not yet valid.";
    }

    return res.status(401).json({
      success: false,
      message,
      error: err.name,
    });
  }
};