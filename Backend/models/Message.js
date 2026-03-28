import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, maxlength: 2000 },
  type: { 
    type: String, 
    enum: ['text', 'image', 'file', 'system', 'quote_request', 'quote_response'], 
    default: 'text' 
  },
  attachments: [{
    url: { type: String },
    filename: { type: String },
    type: { type: String },
    size: { type: Number }
  }],
  quoteData: { type: mongoose.Schema.Types.Mixed },
  readBy: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date }
  }],
  replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  deleted: {
    is: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedFor: { type: String, enum: ['me', 'everyone'] }
  }
}, { timestamps: true });

export default mongoose.model("Message", messageSchema);
