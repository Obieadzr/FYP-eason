// backend/routes/adminRoutes.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Middleware to check if user is admin (add this later if needed, but for MVP we trust route protection)
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user?.id); // assuming you have auth middleware setting req.user
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admin only." });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

// Get all pending wholesalers
router.get("/pending-wholesalers", async (req, res) => {
  try {
    const pending = await User.find({ 
      role: "wholesaler", 
      verified: false 
    }).select("firstName lastName email createdAt");
    
    res.json(pending);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Approve a wholesaler
router.put("/approve-wholesaler/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user || user.role !== "wholesaler") {
      return res.status(404).json({ message: "Wholesaler not found" });
    }

    user.verified = true;
    await user.save();

    res.json({ message: "Wholesaler approved successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// Reject (optional - just delete or keep pending)
router.delete("/reject-wholesaler/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "wholesaler") {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Wholesaler application rejected and removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;