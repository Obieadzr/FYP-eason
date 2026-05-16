import mongoose from "mongoose";

const standingOrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  
  quantity: { type: Number, required: true, min: 1 },
  pricePerUnit: { type: Number, required: true },
  
  frequency: { 
    type: String, 
    enum: ["daily", "weekly", "biweekly", "monthly"], 
    required: true 
  },
  
  status: {
    type: String,
    enum: ["active", "paused", "cancelled"],
    default: "active"
  },
  
  nextDeliveryDate: { type: Date, required: true },
  lastProcessedDate: { type: Date },
  
  shippingAddress: { type: String, required: true },
  phone: { type: String, required: true },
  
}, { timestamps: true });

export default mongoose.model("StandingOrder", standingOrderSchema);
