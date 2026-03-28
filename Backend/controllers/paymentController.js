// backend/controllers/paymentController.js
import axios from "axios";
import Order from "../models/Order.js";

const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || "live_secret_key_68791341fdd94846a146f0457ff7b455"; // Using a dummy default if missing

export const initiateKhaltiPayment = async (req, res) => {
  try {
    const { orderId, return_url } = req.body;

    // Fetch the order
    const order = await Order.findById(orderId).populate("user", "fullName email phone");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(400).json({ message: "Order is already paid." });
    }

    // Amount in paisa
    const amountInPaisa = Math.round(order.grandTotal * 100);

    // Call Khalti e-payment initiate API
    const khaltiPayload = {
      return_url,
      website_url: process.env.FRONTEND_URL || "http://localhost:5173",
      amount: amountInPaisa,
      purchase_order_id: order._id.toString(),
      purchase_order_name: `Order from eAson`,
      customer_info: {
        name: order.user?.fullName || "Guest",
        email: order.user?.email || "guest@example.com",
        phone: order.phone || "9800000000"
      }
    };

    const response = await axios.post("https://a.khalti.com/api/v2/epayment/initiate/", khaltiPayload, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`
      }
    });

    if (response.data && response.data.payment_url) {
      // Save pidx in order if we wanted to, but Khalti returns it back anyway.
      res.status(200).json({
        success: true,
        payment_url: response.data.payment_url,
        pidx: response.data.pidx
      });
    } else {
      throw new Error("Invalid response from Khalti API");
    }

  } catch (error) {
    console.error("Khalti Initiate Error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to initiate payment with Khalti.",
      error: error.response?.data || error.message
    });
  }
};

export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, orderId } = req.body;

    if (!pidx || !orderId) {
      return res.status(400).json({ message: "Missing pidx or orderId." });
    }

    const response = await axios.post("https://a.khalti.com/api/v2/epayment/lookup/", { pidx }, {
      headers: {
        Authorization: `Key ${KHALTI_SECRET_KEY}`
      }
    });

    const status = response.data.status; // Pending, Completed, Expired, Refunded, Canceled

    if (status === "Completed") {
      // Payment Successful
      const order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ message: "Order not found." });

      order.paymentStatus = "paid";
      // We can also change the overall status to processing if it was pending
      if (order.status === "pending") order.status = "processing";
      
      await order.save();

      res.status(200).json({ success: true, message: "Payment Verified Successfully", order });
    } else {
      res.status(400).json({ success: false, message: `Payment Status: ${status}` });
    }

  } catch (error) {
    console.error("Khalti Verify Error:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify payment with Khalti.",
      error: error.response?.data || error.message
    });
  }
};
