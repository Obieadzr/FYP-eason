// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, getCurrentUser, updateProfile, updatePassword } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);
router.put("/password", authMiddleware, updatePassword);

export default router;