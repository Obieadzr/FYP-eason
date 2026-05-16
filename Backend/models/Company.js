import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['retailer', 'wholesaler'], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  walletBalance: { type: Number, default: 0 },
  netTerms: { type: Number, default: 0 },
  creditLimit: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("Company", companySchema);
