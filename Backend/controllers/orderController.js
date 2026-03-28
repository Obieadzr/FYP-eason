// backend/controllers/orderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendOrderConfirmation } from "../utils/email.js";
import mongoose from "mongoose";

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, phone, notes } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty or invalid" });
    }

    if (!shippingAddress?.trim() || !phone?.trim()) {
      return res.status(400).json({ success: false, message: "Shipping address and phone are required" });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Atomic stock decrement — uses $inc with $gte guard to prevent overselling
    for (const cartItem of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: cartItem._id, stock: { $gte: cartItem.quantity } },
        { $inc: { stock: -cartItem.quantity } },
        { new: true }
      );

      if (!updated) {
        // Either product not found or insufficient stock
        const product = await Product.findById(cartItem._id);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product not found: ${cartItem._id}` });
        }
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
        });
      }

      let priceToUse = updated.wholesalerPrice;
      if (updated.bulkPricing && updated.bulkPricing.length > 0) {
        const sortedTiers = updated.bulkPricing.sort((a, b) => b.minQuantity - a.minQuantity);
        for (const tier of sortedTiers) {
          if (cartItem.quantity >= tier.minQuantity) {
            priceToUse = tier.pricePerUnit;
            break;
          }
        }
      }

      orderItems.push({
        product: updated._id,
        quantity: cartItem.quantity,
        pricePerUnit: priceToUse,
      });
      totalAmount += priceToUse * cartItem.quantity;
    }

    // Server-side tax calculation (13% Nepal VAT)
    const TAX_RATE = 0.13;
    const taxAmount = Math.round(totalAmount * TAX_RATE * 100) / 100;
    const grandTotal = Math.round((totalAmount + taxAmount) * 100) / 100;

    const platformFee = Math.round(totalAmount * 0.02 * 100) / 100;
    const wholesalerPayout = totalAmount - platformFee;

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      taxAmount,
      grandTotal,
      platformFee,
      wholesalerPayout,
      shippingAddress,
      phone,
      notes: notes?.trim() || "",
      status: "pending",
      paymentStatus: "pending",
    });

    console.log(`Order created: ${order._id} | Subtotal: ${totalAmount} | Tax: ${taxAmount} | Grand: ${grandTotal}`);

    // Send email (non-blocking)
    try {
      const buyer = await User.findById(userId).select("email fullName");
      if (buyer?.email) {
        sendOrderConfirmation(order, buyer).catch(console.error);
      }
    } catch (emailErr) {
      console.error("Email setup failed (non-critical):", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        taxAmount: order.taxAmount,
        grandTotal: order.grandTotal,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("Order creation FAILED:", err.message);
    res.status(500).json({ success: false, message: "Failed to create order", error: err.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};