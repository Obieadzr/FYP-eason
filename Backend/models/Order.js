// backend/models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true, min: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },       // pre-tax subtotal
    taxAmount: { type: Number, default: 0 },                     // 13% VAT
    grandTotal: { type: Number, required: true, min: 0 },        // totalAmount + taxAmount
    platformFee: { type: Number, default: 0 },
    wholesalerPayout: { type: Number, default: 0 },
    shippingAddress: { type: String, required: true },
    phone: { type: String, required: true },
    notes: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "accepted", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti", "cod", "khata"],
      default: "cod",
    },
    khataUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);