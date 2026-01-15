// backend/routes/orderRoutes.js
import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// POST /api/orders - Create new order
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { items, shippingAddress, phone, notes } = req.body;
    const userId = req.user.id; // from authMiddleware (decoded JWT)

    // Basic input validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty or invalid" });
    }

    if (!shippingAddress?.trim() || !phone?.trim()) {
      return res.status(400).json({ message: "Shipping address and phone are required" });
    }

    // 1. Validate stock & build order items with current prices
    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of items) {
      const product = await Product.findById(cartItem._id);
      if (!product) {
        return res.status(404).json({
          message: `Product not found: ${cartItem._id}`,
        });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available (requested: ${cartItem.quantity})`,
        });
      }

      // Use current wholesalerPrice (what retailer actually pays)
      const priceAtOrderTime = product.wholesalerPrice;

      orderItems.push({
        product: product._id,
        quantity: cartItem.quantity,
        pricePerUnit: priceAtOrderTime,
      });

      totalAmount += priceAtOrderTime * cartItem.quantity;
    }

    // 2. Create the order document
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

    // 3. Decrease stock (simple version - not transactional yet)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Success response
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
    res.status(500).json({
      message: "Failed to create order",
      error: err.message,
    });
  }
});

export default router;