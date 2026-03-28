// backend/routes/adminRoutes.js
import express from "express";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// All admin routes are protected — require valid JWT and admin role
const requireAdmin = (req, res, next) => {
  // authMiddleware already ran, so req.user is populated
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied. Admin only." });
  next();
};

// Apply authMiddleware to all routes in this router
router.use(authMiddleware);
router.use(requireAdmin);

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

// Reject (delete the application)
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

// Get Platform Analytics
router.get("/analytics", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalWholesalers = await User.countDocuments({ role: "wholesaler" });
    const totalRetailers = await User.countDocuments({ role: "retailer" });

    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    const deliveredOrders = await Order.find({ status: "delivered" });
    const totalGMV = deliveredOrders.reduce((acc, order) => acc + order.totalAmount, 0);

    // Fetch the 5 most recent orders for the activity table
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5);

    // Fetch actual 7-day revenue data from real orders
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyOrders = await Order.find({
      status: "delivered",
      createdAt: { $gte: sevenDaysAgo, $lte: today }
    });

    const revenueByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Format as "Mon", "Tue", etc.
      revenueByDay[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
    }

    weeklyOrders.forEach(order => {
      const day = new Date(order.createdAt).toLocaleDateString("en-US", { weekday: "short" });
      if (revenueByDay[day] !== undefined) {
        revenueByDay[day] += (order.grandTotal || order.totalAmount || 0);
      }
    });

    const revenueData = Object.keys(revenueByDay).map(date => ({
      date,
      revenue: revenueByDay[date]
    }));

    res.json({
      users: {
        total: totalUsers,
        wholesalers: totalWholesalers,
        retailers: totalRetailers
      },
      orders: totalOrders,
      products: totalProducts,
      gmv: totalGMV,
      recentOrders,
      revenueData
    });
  } catch (err) {
    console.error("Analytics Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Update user role
router.put("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["retailer", "wholesaler", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Prevent self-demotion or modifying super-admins if needed, but this MVP allows total control
    if (user._id.toString() === req.user.id && role !== "admin") {
      return res.status(400).json({ message: "Cannot remove your own admin status" });
    }

    user.role = role;
    await user.save();
    
    res.json({ message: "Role updated", user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete yourself" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;