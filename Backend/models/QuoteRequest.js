import mongoose from "mongoose";

const quoteRequestSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  retailer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  wholesaler: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  requestedQuantity: { type: Number, required: true },
  targetPrice: { type: Number, required: true },
  message: { type: String },
  
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'rejected', 'counter_offered', 'expired'], 
    default: 'pending' 
  },
  
  counterOffer: {
    price: { type: Number },
    quantity: { type: Number },
    message: { type: String },
    expiresAt: { type: Date }
  },
  
  expiresAt: { type: Date, required: true }, // Default 48 hrs
  linkedConversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }
}, { timestamps: true });

export default mongoose.model("QuoteRequest", quoteRequestSchema);
