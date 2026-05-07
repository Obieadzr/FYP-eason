// routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, verifyEmail, resendOtp, getCurrentUser, updateProfile, updatePassword, forgotPassword, resetPassword } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { registerSchema, loginSchema } from "../validators/schemas.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/login", validate(loginSchema), loginUser);
router.get("/me", authMiddleware, getCurrentUser);
router.put("/profile", authMiddleware, updateProfile);
router.put("/password", authMiddleware, updatePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;