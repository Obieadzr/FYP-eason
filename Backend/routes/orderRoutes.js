// backend/routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { createOrder, updateOrderStatus } from "../controllers/orderController.js";
import { sendOrderStatusUpdate } from "../utils/email.js";
import Wallet from "../models/Wallet.js";

const router = express.Router();

// POST /api/orders - Place new order (Cash on Delivery)
router.post("/", authMiddleware, createOrder);



// GET /api/orders/my-orders - Get current user's orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name image wholesalerPrice wholesaler");

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Failed to fetch user orders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your orders",
      error: err.message,
    });
  }
});

// GET /api/orders/wholesaler - Get orders containing this wholesaler's products
router.get("/wholesaler", authMiddleware, async (req, res) => {
  if (req.user.role !== "wholesaler") {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .populate({
        path: "items.product",
        select: "name image wholesalerPrice wholesaler",
      })
      .sort({ createdAt: -1 });

    const wholesalerOrders = orders.filter(order => 
      order.items.some(item => item.product?.wholesaler?.toString() === req.user.id)
    );

    res.json({
      success: true,
      orders: wholesalerOrders,
    });
  } catch (err) {
    console.error("Failed to fetch wholesaler orders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
});

// GET /api/orders - Get all orders (Admin & Wholesaler only)
router.get("/", authMiddleware, async (req, res) => {
  if (!["admin", "wholesaler"].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Not authorized. Admin or Wholesaler only.",
    });
  }

  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders,
    });
  } catch (err) {
    console.error("Failed to fetch all orders:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: err.message,
    });
  }
});

// PUT /api/orders/:id/status - Update order status
router.put("/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;

  if (!["admin", "wholesaler"].includes(req.user.role)) {
    // Retailers can only mark as delivered
    if (req.user.role === "retailer" && status === "delivered") {
      // Allowed
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized. Retailers can only verify delivery.",
      });
    }
  }

  if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status value",
    });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate("user", "firstName lastName email").populate({ path: "items.product", select: "wholesaler" });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Send status update email
    try {
      if (order.user?.email) {
        const emailSent = await sendOrderStatusUpdate(order, order.user, status);
        if (emailSent) {
          console.log(`Status update email sent to ${order.user.email} for order ${order._id}`);
        }
      }
    } catch (emailErr) {
      console.error("Status email failed (non-critical):", emailErr.message);
    }

    // Escrow System: Payout to Wholesaler when Delivered
    if (status === "delivered") {
      try {
        // Find wholesaler from the first item
        const firstItem = order.items && order.items[0];
        if (firstItem && firstItem.product && firstItem.product.wholesaler) {
          const wholesalerId = firstItem.product.wholesaler;
          
          let wallet = await Wallet.findOne({ user: wholesalerId });
          if (!wallet) {
            wallet = new Wallet({ user: wholesalerId, balance: 0, totalEarned: 0, transactions: [] });
          }
          
          const alreadyPaid = wallet.transactions.some(
            (t) => t.orderId && t.orderId.toString() === order._id.toString() && t.type === "credit"
          );

          if (!alreadyPaid) {
            const payoutAmount = order.wholesalerPayout || order.grandTotal || 0;
            wallet.balance += payoutAmount;
            wallet.totalEarned += payoutAmount;
            wallet.transactions.push({
              orderId: order._id,
              amount: payoutAmount,
              type: "credit",
              status: "completed",
              description: `Escrow payout for order #${order._id.toString().slice(-8).toUpperCase()}`
            });
            
            await wallet.save();
            order.paymentStatus = "paid"; // Mark order as paid completely
            await order.save();
            console.log(`Escrow payout of Rs ${payoutAmount} sent to Wholesaler ${wholesalerId}`);
          }
        }
      } catch (escrowErr) {
        console.error("Escrow payout failed critically:", escrowErr);
      }
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (err) {
    console.error("Failed to update order status:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: err.message,
    });
  }
});

export default router;