import mongoose from "mongoose";

const walletSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  balance: {
    type: Number,
    default: 0
  },
  totalEarned: {
    type: Number,
    default: 0
  },
  transactions: [{
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    amount: Number,
    type: { type: String, enum: ["credit", "withdrawal"], required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "completed" },
    description: String,
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model("Wallet", walletSchema);
