// backend/models/Shipment.js
import mongoose from "mongoose";

const statusHistorySchema = new mongoose.Schema({
  status: { type: String, required: true },
  note: { type: String, default: "" },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const shipmentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true // one shipment per order
    },
    trackingCode: {
      type: String,
      required: true,
      unique: true
    },
    partner: {
      type: String,
      enum: ["eas_internal", "pathao", "daraz"],
      default: "eas_internal"
    },
    riderName: { type: String, default: "" },
    riderPhone: { type: String, default: "" },
    estimatedDelivery: { type: Date },
    pickupTime: { type: Date },
    status: {
      type: String,
      enum: ["assigned", "picked_up", "in_transit", "out_for_delivery", "delivered", "failed"],
      default: "assigned"
    },
    statusHistory: [statusHistorySchema],
    notes: { type: String, default: "" }
  },
  { timestamps: true }
);

// Generate a unique tracking code before saving
shipmentSchema.pre("validate", function (next) {
  if (!this.trackingCode) {
    const prefix = this.partner === "pathao" ? "PTH" : this.partner === "daraz" ? "DRZ" : "EAS";
    this.trackingCode = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
  }
  next();
});

export default mongoose.model("Shipment", shipmentSchema);
