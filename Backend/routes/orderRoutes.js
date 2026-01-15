import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// POST /api/orders - Create new order (retailer)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, phone, notes } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or invalid" });
    }

    if (!shippingAddress?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: "Shipping address and phone are required" });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of items) {
      const product = await Product.findById(cartItem._id);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${cartItem._id}` });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`,
        });
      }

      const priceAtOrderTime = product.wholesalerPrice;

      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        pricePerUnit: priceAtOrderTime,
      });

      totalAmount += priceAtOrderTime * cartItem.quantity;
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      phone,
      notes: notes || "",
      status: "pending",
      paymentStatus: "pending",
    });

    await order.save();

    // Decrease stock
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    res.status(201).json({
      message: "Order created successfully",
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
});

// GET /api/orders/my-orders - Retailer: Get my orders
router.get("/my-orders", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("items.product", "name image wholesalerPrice");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// GET /api/orders - Admin/Wholesaler: Get all orders
router.get("/", authMiddleware, async (req, res) => {
  if (!["admin", "wholesaler"].includes(req.user.role)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  try {
    const orders = await Order.find()
      .populate("user", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// PUT /api/orders/:id/status - Update order status (admin/wholesaler)
router.put("/:id/status", authMiddleware, async (req, res) => {
  if (!["admin", "wholesaler"].includes(req.user.role)) {
    return res.status(403).json({ message: "Not authorized" });
  }

  const { status } = req.body;
  if (!["pending", "processing", "shipped", "delivered", "cancelled"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("user", "firstName lastName email");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

export default router;