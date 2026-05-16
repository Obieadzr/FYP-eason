// backend/controllers/orderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendOrderConfirmation } from "../utils/email.js";
import mongoose from "mongoose";

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, phone, notes, paymentMethod } = req.body;
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
      if (typeof cartItem.quantity !== 'number' || !Number.isInteger(cartItem.quantity) || cartItem.quantity <= 0) {
        return res.status(400).json({ success: false, message: "Invalid quantity for item" });
      }

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

      let priceToUse = updated.wholesalerPrice || updated.baseCost || 0;
      if (updated.bulkPricing && updated.bulkPricing.length > 0) {
        const sortedTiers = [...updated.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
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

    let initialStatus = "pending";
    if (grandTotal > 50000 && req.user.companyId) {
      initialStatus = "pending_approval";
    }

    const order = await Order.create({
      user: userId,
      company: req.user.companyId || null,
      items: orderItems,
      totalAmount,
      taxAmount,
      grandTotal,
      platformFee,
      wholesalerPayout,
      shippingAddress,
      phone,
      notes: notes?.trim() || "",
      status: initialStatus,
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "cod",
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
    const order = await Order.findById(req.params.id).populate("items.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    // Enforce Authorization (IDOR fixes)
    const isOwner = order.user.toString() === req.user.id;
    const isCompanyMatch = order.company && req.user.companyId && order.company.toString() === req.user.companyId;
    
    // Check if the user is a supplier trying to update their own order
    const isSupplier = order.items.some(item => item.product && item.product.wholesaler.toString() === req.user.id);

    if (!isOwner && !isCompanyMatch && !isSupplier && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this order" });
    }

    // Handle Approval Logic (Buyer side)
    if (status === "pending" && order.status === "pending_approval") {
      if (!isCompanyMatch) return res.status(403).json({ message: "Only company members can approve" });
      if (req.user.companyRole === "buyer") return res.status(403).json({ message: "Buyers cannot approve orders" });
      if (order.user.toString() === req.user.id) return res.status(403).json({ message: "You cannot approve your own order" });
      order.approvedBy = req.user.id;
    } 
    // Handle Delivery Logic (Buyer side)
    else if (status === "delivered") {
      if (!isOwner && !isCompanyMatch && req.user.role !== "admin") {
        return res.status(403).json({ message: "Only the buyer can verify delivery." });
      }
      if (order.status !== "shipped") {
        return res.status(400).json({ message: "Order must be shipped before marking as delivered." });
      }
    }
    // Handle Fulfillment Logic (Supplier side)
    else if (status === "processing" || status === "shipped") {
      if (!isSupplier && req.user.role !== "admin") {
        return res.status(403).json({ message: "Only the supplier can process or ship this order." });
      }
      if (order.status === "pending_approval") {
        return res.status(400).json({ message: "Order must be approved before processing." });
      }
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Order status update failed:", err.message);
    res.status(500).json({ message: "An internal server error occurred." });
  }
};