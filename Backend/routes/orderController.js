// C:\FYP\backend\routes\orderController.js
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { sendOrderConfirmation } from "../utils/email.js";

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, phone, notes } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty or invalid" });
    }

    if (!shippingAddress?.trim() || !phone?.trim()) {
      return res.status(400).json({ success: false, message: "Shipping address and phone number are required" });
    }

    const orderItems = [];
    let totalAmount = 0;

    console.log(`Creating order for user ${userId} with ${items.length} items`);

    for (const cartItem of items) {
      const product = await Product.findById(cartItem._id);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product not found: ${cartItem._id}` });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
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
      notes: notes?.trim() || "",
      status: "pending",
      paymentStatus: "pending",
    });

    await order.save();

    // Decrease stock (non-atomic – fine for demo/viva)
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    console.log(`SUCCESS: Order created ${order._id} | Stock updated for ${orderItems.length} items`);

    // Send email (non-blocking)
    try {
      const buyer = await User.findById(userId).select('email fullName');
      if (buyer?.email) {
        await sendOrderConfirmation(order, buyer);
        console.log(`Confirmation email sent to ${buyer.email}`);
      }
    } catch (emailErr) {
      console.error("Email failed (non-critical):", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully (Cash on Delivery)",
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("Order creation FAILED:", err.message, err.stack);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: err.message,
    });
  }
};