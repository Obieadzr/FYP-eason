// backend/routes/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import zxcvbn from "zxcvbn";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/email.js";

export const registerUser = async (req, res) => {
  try {
    console.log("Register request body:", req.body);

    const { firstName, lastName, email, password, role, businessName } = req.body;

    // Basic required fields check
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ── NEW: Password strength validation ───────────────────────────────────────
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters long",
      });
    }

    const strength = zxcvbn(password);
    if (strength.score < 3) {
      return res.status(400).json({
        message:
          "Password is too weak. Please use a stronger password with a mix of letters, numbers, and symbols (or longer length).",
      });
    }
    // ──────────────────────────────────────────────────────────────────────────────

    let userToSave;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return res.status(400).json({ message: "User already exists." });
      } else {
        // User exists but hasn't verified email. Overwrite their details and continue.
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUser.firstName = firstName;
        existingUser.lastName = lastName;
        existingUser.password = hashedPassword;
        
        // Fix Privilege Escalation: Constrain roles to wholesaler or retailer
        const safeRole = role === "wholesaler" ? "wholesaler" : "retailer";
        existingUser.role = safeRole;
        existingUser.verified = safeRole === "wholesaler" ? false : true;
        if (businessName) existingUser.shopName = businessName;
        userToSave = existingUser;
      }
    } else {
      // New User
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Fix Privilege Escalation: Constrain roles to wholesaler or retailer
      const safeRole = role === "wholesaler" ? "wholesaler" : "retailer";
      
      userToSave = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: safeRole,
        verified: safeRole === "wholesaler" ? false : true,
        isEmailVerified: false,
        shopName: businessName || undefined,
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n\n=========================================`);
    console.log(`🔑 [DEV MODE] EMAIL OTP FOR ${email}: ${otp}`);
    console.log(`=========================================\n\n`);

    userToSave.emailVerificationOtp = otp;
    userToSave.emailVerificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const savedUser = await userToSave.save();
    console.log("User updated/saved:", savedUser.email);

    // Send the OTP email
    await sendVerificationEmail(savedUser.email, otp);

    res.status(201).json({
      message: "User registered successfully. Please verify your email.",
      email: savedUser.email,
      requiresEmailVerification: true,
      user: {
        id: savedUser._id,
        fullName: `${savedUser.firstName} ${savedUser.lastName}`,
        email: savedUser.email,
        role: savedUser.role,
        isEmailVerified: savedUser.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: "Invalid input format" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      // Bypass verification for legacy users created before the OTP feature.
      const isLegacyUser = user.createdAt && user.createdAt < new Date("2026-03-25T00:00:00.000Z");
      
      if (isLegacyUser) {
        user.isEmailVerified = true;
        await user.save();
      } else {
        return res.status(403).json({ 
          message: "Please verify your email to login.",
          requiresEmailVerification: true,
          email: user.email
        });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send token + user data (without password)
    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        verified: user.verified,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string') {
      return res.status(400).json({ message: "Email and OTP are required strings" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    if (user.emailVerificationOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.emailVerificationOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // OTP is valid
    user.isEmailVerified = true;
    user.emailVerificationOtp = undefined;
    user.emailVerificationOtpExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({ 
      message: "Email verified successfully.",
      token,
      user: {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        verified: user.verified,
        isEmailVerified: user.isEmailVerified,
      }
    });
  } catch (error) {
    console.error("Error in verifyEmail:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: "Valid email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Rate limiting: Prevent asking for OTP too frequently (e.g., allow if older than 1 minute)
    if (user.emailVerificationOtpExpires) {
      const timeRemaining = user.emailVerificationOtpExpires.getTime() - Date.now();
      const tenMinutes = 10 * 60 * 1000;
      const timeSinceLastOtp = tenMinutes - timeRemaining;
      
      // If requested within 60 seconds
      if (timeSinceLastOtp < 60000) {
        return res.status(429).json({ message: "Please wait before requesting a new OTP" });
      }
    }

    // Generate a new 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n\n=========================================`);
    console.log(`🔑 [DEV MODE] RESENT OTP FOR ${email}: ${newOtp}`);
    console.log(`=========================================\n\n`);

    user.emailVerificationOtp = newOtp;
    user.emailVerificationOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await user.save();

    // Send the new OTP email
    await sendVerificationEmail(user.email, newOtp);

    res.status(200).json({ message: "A new OTP has been sent to your email." });
  } catch (error) {
    console.error("Error in resendOtp:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get current authenticated user (/api/auth/me)
export const getCurrentUser = async (req, res) => {
  try {
    // req.user comes from authMiddleware
    if (!req.user?.id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        verified: user.verified,
      },
    });
  } catch (err) {
    console.error("getCurrentUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, shopName, panNumber, address, businessType } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (shopName) user.shopName = shopName;
    if (panNumber) user.panNumber = panNumber;
    if (address) user.address = address;
    if (businessType) user.businessType = businessType;

    await user.save();
    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    if (newPassword.length < 8) return res.status(400).json({ message: "Password must be at least 8 chars" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') return res.status(400).json({ message: "Valid email is required" });

    const user = await User.findOne({ email });
    if (!user) {
      // Don't leak if user exists or not, but return 200
      return res.status(200).json({ message: "If your email is registered, an OTP has been sent." });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`\n\n=========================================`);
    console.log(`🔑 [DEV MODE] PASSWORD RESET OTP FOR ${email}: ${otp}`);
    console.log(`=========================================\n\n`);

    user.passwordResetOtp = otp;
    user.passwordResetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    await sendPasswordResetEmail(user.email, otp);

    res.status(200).json({ message: "If your email is registered, an OTP has been sent." });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || typeof email !== 'string' || !otp || typeof otp !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return res.status(400).json({ message: "Email, OTP, and new password must be valid strings" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.passwordResetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.passwordResetOtpExpires < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }
    const strength = zxcvbn(newPassword);
    if (strength.score < 3) {
      return res.status(400).json({ message: "Password is too weak." });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};