// backend/routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, getCurrentUser } from "./authController.js";
import { authMiddleware } from "../middleware/auth.js"; // ← new

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// NEW: Get current logged-in user
router.get("/me", authMiddleware, getCurrentUser);

export default router;