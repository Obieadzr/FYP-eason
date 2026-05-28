// backend/routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import User from "../models/User.js";
import { authMiddleware } from "../middleware/auth.js";
import { createOrder, updateOrderStatus } from "../controllers/orderController.js";
import { validate } from "../middleware/validate.js";
import { orderSchema } from "../validators/schemas.js";
import { sendOrderStatusUpdate } from "../utils/email.js";
import Wallet from "../models/Wallet.js";
import Shipment from "../models/Shipment.js";

const router = express.Router();

// POST /api/orders - Place new order (Cash on Delivery)
router.post("/", authMiddleware, createOrder);



// GET /api/orders/my-orders - Get current user's orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.product",
        select: "name image wholesalerPrice wholesaler stock moq bulkPricing",
        populate: {
          path: "wholesaler",
          select: "firstName lastName email shopName"
        }
      });

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

// GET /api/orders/wholesaler - Get orders (wholesaler sees own, admin sees all)
router.get("/wholesaler", authMiddleware, async (req, res) => {
  if (!["wholesaler", "admin"].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Not authorized" });
  }

  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email shopName role")
      .populate({
        path: "items.product",
        select: "name image wholesalerPrice wholesaler stock moq bulkPricing",
        populate: {
          path: "wholesaler",
          select: "firstName lastName email shopName"
        }
      })
      .sort({ createdAt: -1 });

    // Admin sees all orders; wholesaler only sees orders with their products
    const filteredOrders = req.user.role === "admin"
      ? orders
      : orders.filter(order =>
          order.items.some(item => item.product?.wholesaler?.toString() === req.user.id)
        );

    res.json({ success: true, orders: filteredOrders });
  } catch (err) {
    console.error("Failed to fetch wholesaler orders:", err);
    res.status(500).json({ success: false, message: "Failed to fetch orders", error: err.message });
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

// PUT /api/orders/:id/status - Update order status (clean, no dead code)
router.put("/:id/status", authMiddleware, async (req, res) => {
  const { status } = req.body;

  const validStatuses = ["pending", "accepted", "processing", "shipped", "delivered", "cancelled"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  try {
    // Populate items.product to access the wholesaler field
    const currentOrder = await Order.findById(req.params.id).populate("items.product");
    if (!currentOrder) return res.status(404).json({ success: false, message: "Order not found" });

    // Enforce Authorization (IDOR fixes)
    if (req.user.role === "retailer") {
      if (currentOrder.user.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "Not authorized to update this order" });
      }
      if (status !== "delivered") {
        return res.status(403).json({ success: false, message: "Retailers can only verify delivery." });
      }
    } else if (req.user.role === "wholesaler") {
      // Ensure the wholesaler has at least one product in this order
      const ownsProduct = currentOrder.items.some(
        (item) => item.product && item.product.wholesaler.toString() === req.user.id
      );
      if (!ownsProduct) {
        return res.status(403).json({ success: false, message: "Not authorized to update this order" });
      }
    } else if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    currentOrder.status = status;

    // ── Logistics: create or update Shipment record when entering processing or higher ──
    const logisticsTriggerStatuses = ["processing", "shipped", "delivered"];
    if (logisticsTriggerStatuses.includes(status)) {
      const existingShipment = await Shipment.findOne({ order: currentOrder._id });
      if (!existingShipment) {
        const partners = ["eas_internal", "pathao", "daraz"];
        const riders = [
          { name: "Aarav Sharma",  phone: "9800000001" },
          { name: "Sita Thapa",    phone: "9800000002" },
          { name: "Bikash Gurung", phone: "9800000003" },
          { name: "Nima Sherpa",   phone: "9800000004" },
        ];
        const rider  = riders[Math.floor(Math.random() * riders.length)];
        const partner = partners[Math.floor(Math.random() * partners.length)];

        const shipment = await Shipment.create({
          order:             currentOrder._id,
          partner,
          riderName:         rider.name,
          riderPhone:        rider.phone,
          estimatedDelivery: new Date(Date.now() + 48 * 60 * 60 * 1000),
          pickupTime:        new Date(Date.now() + 2  * 60 * 60 * 1000),
          status:            "assigned",
          statusHistory: [{ status: "assigned", note: "Auto-assigned by system" }],
        });

        // Mirror tracking code onto Order for quick lookup
        currentOrder.trackingId = shipment.trackingCode;
        currentOrder.riderName  = rider.name;
        currentOrder.riderPhone = rider.phone;
        currentOrder.estimatedDelivery = shipment.estimatedDelivery;
      }
    }

    // Update Shipment status if one exists
    if (["shipped", "delivered", "cancelled"].includes(status)) {
      const shipmentStatusMap = { shipped: "in_transit", delivered: "delivered", cancelled: "failed" };
      await Shipment.findOneAndUpdate(
        { order: currentOrder._id },
        {
          status: shipmentStatusMap[status],
          $push: { statusHistory: { status: shipmentStatusMap[status], note: `Order marked as ${status}` } }
        }
      );
    }

    await currentOrder.save();

    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email")
      .populate({ path: "items.product", select: "wholesaler" });

    // Send status update email (non-blocking)
    try {
      if (order.user?.email) {
        const emailSent = await sendOrderStatusUpdate(order, order.user, status);
        if (emailSent) console.log(`Status email sent to ${order.user.email} for order ${order._id}`);
      }
    } catch (emailErr) {
      console.error("Status email failed (non-critical):", emailErr.message);
    }

    // ── Escrow: Payout to Wholesaler when Delivered ──
    if (status === "delivered") {
      try {
        const firstItem = order.items?.[0];
        if (firstItem?.product?.wholesaler) {
          const wholesalerId = firstItem.product.wholesaler;
          let wallet = await Wallet.findOne({ user: wholesalerId });
          if (!wallet) wallet = new Wallet({ user: wholesalerId, balance: 0, totalEarned: 0, transactions: [] });

          const alreadyPaid = wallet.transactions.some(
            (t) => t.orderId?.toString() === order._id.toString() && t.type === "credit"
          );

          if (!alreadyPaid) {
            const payoutAmount = order.wholesalerPayout || order.grandTotal || 0;
            wallet.balance    += payoutAmount;
            wallet.totalEarned += payoutAmount;
            wallet.transactions.push({
              orderId: order._id,
              amount: payoutAmount,
              type: "credit",
              status: "completed",
              description: `Escrow payout for order #${order._id.toString().slice(-8).toUpperCase()}`
            });
            await wallet.save();
            order.paymentStatus = "paid";
            await order.save();
            console.log(`Escrow payout Rs ${payoutAmount} → Wholesaler ${wholesalerId}`);
          }
        }
      } catch (escrowErr) {
        console.error("Escrow payout failed (non-critical):", escrowErr.message);
      }
    }

    res.json({ success: true, message: `Order updated to ${status}`, order });
  } catch (err) {
    console.error("Failed to update order status:", err);
    res.status(500).json({ success: false, message: "Failed to update order status", error: err.message });
  }
});

// ── GET /api/orders/logistics - Admin: all shipments with full order details ──
router.get("/logistics", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  try {
    const shipments = await Shipment.find()
      .populate({
        path: "order",
        select: "grandTotal totalAmount status shippingAddress phone paymentMethod user items",
        populate: { path: "user", select: "firstName lastName email" }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, shipments });
  } catch (err) {
    console.error("Failed to fetch logistics:", err);
    res.status(500).json({ success: false, message: "Failed to fetch logistics data", error: err.message });
  }
});

// ── PUT /api/orders/:id/logistics - Admin: update shipment tracking info ──
router.put("/:id/logistics", authMiddleware, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ success: false, message: "Admin only" });
  }
  const { partner, riderName, riderPhone, estimatedDelivery, status, note } = req.body;
  try {
    const shipment = await Shipment.findOne({ order: req.params.id });
    if (!shipment) return res.status(404).json({ success: false, message: "Shipment not found" });

    if (partner)           shipment.partner           = partner;
    if (riderName)         shipment.riderName         = riderName;
    if (riderPhone)        shipment.riderPhone        = riderPhone;
    if (estimatedDelivery) shipment.estimatedDelivery = new Date(estimatedDelivery);
    if (status) {
      shipment.status = status;
      shipment.statusHistory.push({ status, note: note || `Updated by admin` });
    }

    await shipment.save();
    res.json({ success: true, message: "Shipment updated", shipment });
  } catch (err) {
    console.error("Failed to update logistics:", err);
    res.status(500).json({ success: false, message: "Failed to update logistics", error: err.message });
  }
});

export default router;