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

// Get Platform Analytics — Enhanced
router.get("/analytics", async (req, res) => {
  try {
    const totalUsers        = await User.countDocuments();
    const totalWholesalers  = await User.countDocuments({ role: "wholesaler" });
    const totalRetailers    = await User.countDocuments({ role: "retailer" });
    const totalOrders       = await Order.countDocuments();
    const totalProducts     = await Product.countDocuments();

    const nonCancelledOrders = await Order.find({
      status: { $in: ["accepted", "processing", "shipped", "delivered", "pending"] }
    });
    const totalGMV = nonCancelledOrders.reduce((acc, o) => acc + (o.grandTotal || o.totalAmount || 0), 0);

    // ── Recent orders (latest 5) ──────────────────────────────────────────────
    const recentOrders = await Order.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 })
      .limit(5);

    // ── 7-Day Revenue ─────────────────────────────────────────────────────────
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const weeklyOrders = await Order.find({
      status: { $in: ["accepted", "processing", "shipped", "delivered"] },
      createdAt: { $gte: sevenDaysAgo, $lte: today }
    });

    const revenueByDay = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      revenueByDay[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
    }
    weeklyOrders.forEach(o => {
      const day = new Date(o.createdAt).toLocaleDateString("en-US", { weekday: "short" });
      if (revenueByDay[day] !== undefined) revenueByDay[day] += (o.grandTotal || o.totalAmount || 0);
    });
    const revenueData = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }));

    // ── 30-Day Monthly Revenue ────────────────────────────────────────────────
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 29);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const monthlyOrdersRaw = await Order.find({
      status: { $in: ["accepted", "processing", "shipped", "delivered"] },
      createdAt: { $gte: thirtyDaysAgo, $lte: today }
    });

    const revenueBy30Day = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      revenueBy30Day[key] = 0;
    }
    monthlyOrdersRaw.forEach(o => {
      const key = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (revenueBy30Day[key] !== undefined) revenueBy30Day[key] += (o.grandTotal || o.totalAmount || 0);
    });
    const monthlyRevenue = Object.entries(revenueBy30Day).map(([date, revenue]) => ({ date, revenue }));

    // ── Order Status Breakdown ────────────────────────────────────────────────
    const statuses = ["pending", "accepted", "processing", "shipped", "delivered", "cancelled"];
    const statusCounts = await Promise.all(statuses.map(s => Order.countDocuments({ status: s })));
    const orderStatusBreakdown = statuses.map((s, i) => ({ status: s, count: statusCounts[i] }));

    // ── Top Products (by revenue, last 30 days) ───────────────────────────────
    const recentOrdersForProducts = await Order.find({
      status: { $in: ["accepted", "processing", "shipped", "delivered"] },
      createdAt: { $gte: thirtyDaysAgo }
    });

    const productSalesMap = {}; // productId → { qty, revenue }
    recentOrdersForProducts.forEach(o => {
      o.items.forEach(item => {
        const pId = item.product?.toString();
        if (pId) {
          if (!productSalesMap[pId]) productSalesMap[pId] = { qty: 0, revenue: 0 };
          productSalesMap[pId].qty     += item.quantity;
          productSalesMap[pId].revenue += item.quantity * (item.pricePerUnit || 0);
        }
      });
    });
    const topProductIds = Object.entries(productSalesMap)
      .sort((a, b) => b[1].revenue - a[1].revenue)
      .slice(0, 5)
      .map(([id]) => id);

    const topProductDocs = await Product.find({ _id: { $in: topProductIds } })
      .select("name image wholesalerPrice category")
      .populate("category", "name");

    const topProducts = topProductDocs.map(p => ({
      productId:   p._id,
      name:        p.name,
      image:       p.image,
      category:    p.category?.name || "—",
      unitsSold:   productSalesMap[p._id.toString()]?.qty || 0,
      totalRevenue: productSalesMap[p._id.toString()]?.revenue || 0,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // ── Category Revenue Breakdown ────────────────────────────────────────────
    const activeProductIds = Object.keys(productSalesMap);
    const activeProducts = await Product.find({ _id: { $in: activeProductIds } })
      .select("category")
      .populate("category", "name");

    const categoryRevMap = {};
    activeProducts.forEach(p => {
      const catName = p.category?.name || "Uncategorised";
      const sales   = productSalesMap[p._id.toString()] || { revenue: 0 };
      categoryRevMap[catName] = (categoryRevMap[catName] || 0) + sales.revenue;
    });
    const categoryBreakdown = Object.entries(categoryRevMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    // ── Predictive Restocking (14-day velocity) ───────────────────────────────
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(today.getDate() - 14);
    const recentOrdersForMath = await Order.find({
      status: { $in: ["accepted", "processing", "shipped", "delivered"] },
      createdAt: { $gte: fourteenDaysAgo }
    });
    const productSales14 = {};
    recentOrdersForMath.forEach(o => {
      o.items.forEach(item => {
        const pId = item.product?.toString();
        if (pId) productSales14[pId] = (productSales14[pId] || 0) + item.quantity;
      });
    });
    const activeProductsRestock = await Product.find({ _id: { $in: Object.keys(productSales14) } })
      .select("name stock image wholesalerPrice");
    const predictiveRestocking = [];
    activeProductsRestock.forEach(prod => {
      const soldIn14Days   = productSales14[prod._id.toString()];
      const velocityPerDay = soldIn14Days / 14;
      const daysRemaining  = velocityPerDay > 0 ? Math.floor(prod.stock / velocityPerDay) : 999;
      if (daysRemaining < 14) {
        predictiveRestocking.push({
          productId:       prod._id,
          name:            prod.name,
          image:           prod.image,
          currentStock:    prod.stock,
          velocityPerDay:  velocityPerDay.toFixed(1),
          daysRemaining,
          suggestedRestock: Math.ceil(velocityPerDay * 30),
        });
      }
    });
    predictiveRestocking.sort((a, b) => a.daysRemaining - b.daysRemaining);

    // ── Top Buyers (retailers by GMV, all time) ───────────────────────────────
    const allDeliveredOrders = await Order.find({
      status: { $in: ["delivered", "shipped"] }
    }).populate("user", "firstName lastName email");

    const buyerMap = {};
    allDeliveredOrders.forEach(o => {
      const uid = o.user?._id?.toString();
      if (!uid) return;
      if (!buyerMap[uid]) buyerMap[uid] = { user: o.user, totalSpent: 0, orderCount: 0 };
      buyerMap[uid].totalSpent  += (o.grandTotal || o.totalAmount || 0);
      buyerMap[uid].orderCount  += 1;
    });
    const topBuyers = Object.values(buyerMap)
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5)
      .map(b => ({
        name:       `${b.user?.firstName || ""} ${b.user?.lastName || ""}`.trim(),
        email:      b.user?.email,
        totalSpent: b.totalSpent,
        orderCount: b.orderCount,
      }));

    res.json({
      users:          { total: totalUsers, wholesalers: totalWholesalers, retailers: totalRetailers },
      orders:         totalOrders,
      products:       totalProducts,
      gmv:            totalGMV,
      recentOrders,
      revenueData,
      monthlyRevenue,
      orderStatusBreakdown,
      topProducts,
      categoryBreakdown,
      topBuyers,
      predictiveRestocking: predictiveRestocking.slice(0, 10),
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
    
    const safeUser = user.toObject();
    delete safeUser.password;
    delete safeUser.emailVerificationOtp;
    delete safeUser.passwordResetOtp;
    
    res.json({ message: "Role updated", user: safeUser });
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