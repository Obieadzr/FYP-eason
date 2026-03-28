import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String },
    lastSeen: { type: Date }
  }],
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  lastMessage: {
    text: { type: String },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sentAt: { type: Date }
  },
  unreadCount: { 
    type: Map, 
    of: Number, 
    default: {} 
  },
  status: { 
    type: String, 
    enum: ['active', 'closed', 'blocked'], 
    default: 'active' 
  }
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
