# eAson B2B Marketplace - Deep Technical Details

This document contains the exact code snippets and technical logic requested for the academic report.

## 1. Mongoose Schemas (All 11 Models)

### Category.js 
```javascript
import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
    name:{type:String , required:true,unique:true,trim:true},
    slug:{type:String , lowercase:true,unique:true}
},{
    timestamps:true
})

export default mongoose.model("Category",categorySchema)
```

### Conversation.js
```javascript
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

```

### Message.js
```javascript
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

```

### Order.js
```javascript
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
      enum: ["cod", "khalti", "esewa", "bank_transfer"],
      required: true,
    },
    // Logistics
    trackingId: { type: String },
    riderName: { type: String },
    riderPhone: { type: String },
    estimatedDelivery: { type: Date },
    khataUsed: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
```

### Product.js
```javascript
// backend/models/Product.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    wholesaler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: [true, "Unit is required"],
    },

    // New Pricing Fields (Approach B)
    baseCost: {
      type: Number,
      required: [true, "Base cost is required"],
      min: [0, "Base cost cannot be negative"],
    },

    wholesalerPrice: {
      type: Number,
      required: [true, "Wholesaler price is required"],
    },

    retailerPriceOverride: {
      type: Number,
      default: null,
      min: [0, "Retail price cannot be negative"],
    },

    bulkPricing: [
      {
        minQuantity: { type: Number, required: true },
        pricePerUnit: { type: Number, required: true },
      },
    ],
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },

    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    moq: {
      type: Number,
      default: 1,
      min: 1,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    attributes: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    image: {
      type: String,
      default: null,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
productSchema.virtual("suggestedRetailPrice").get(function () {
  const DEFAULT_MULTIPLIER = 1.38; // ~38% margin - can be made category-specific later
  return Math.round(this.wholesalerPrice * DEFAULT_MULTIPLIER);
});

productSchema.virtual("consumerPrice").get(function () {
  return this.retailerPriceOverride || this.suggestedRetailPrice;
});

// Helper method to return price info based on user role
productSchema.methods.getPriceForUser = function (user) {
  let info = {};

  if (!user) {
    // Guest / Consumer
    info = {
      finalPrice: this.consumerPrice,
      roleShownAs: "consumer",
    };
  } else if (user.role === "wholesaler") {
    info = {
      sellingPrice: this.wholesalerPrice,
      baseCost: this.baseCost, // only wholesaler sees cost
      roleShownAs: "wholesaler",
    };
  } else if (user.role === "retailer") {
    info = {
      purchasePrice: this.wholesalerPrice,
      suggestedSellingPrice: this.suggestedRetailPrice,
      currentSellingPrice: this.retailerPriceOverride || null,
      roleShownAs: "retailer",
    };
    // STRICT: Never expose baseCost to retailer
    delete info.baseCost;
  } else {
    // Admin sees everything
    info = {
      baseCost: this.baseCost,
      wholesalerPrice: this.wholesalerPrice,
      suggestedRetailPrice: this.suggestedRetailPrice,
      retailerPriceOverride: this.retailerPriceOverride,
      consumerPrice: this.consumerPrice,
      roleShownAs: "admin",
    };
  }

  // Final safety net: remove baseCost for anyone except admin & wholesaler
  if (user?.role !== "admin" && user?.role !== "wholesaler") {
    delete info.baseCost;
  }

  return info;
};

// Export as default (matches your other models)
export default mongoose.model("Product", productSchema);
```

### QuoteRequest.js
```javascript
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

```

### Review.js
```javascript
import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      default: "",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order", // Used to ensure a retailer actually purchased it
    }
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);

```

### Shipment.js
```javascript
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

```

### Unit.js
```javascript
import mongoose from "mongoose";

const unitSchema =new mongoose.Schema({
    name:{type:String,required:true,unique:true},
},
{
    timestamps:true
});

export default mongoose.model("Unit",unitSchema); 
```

### User.js
```javascript
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  verified: { type: Boolean, default: false }, // For wholesaler approval
  isEmailVerified: { type: Boolean, default: false }, // For OTP email verification
  emailVerificationOtp: { type: String },
  emailVerificationOtpExpires: { type: Date },
  shopName: { type: String, trim: true },
  panNumber: { type: String, trim: true },
  address: { type: String, trim: true },
  businessType: { type: String, trim: true },
  phone: { type: String, trim: true },
  khataCreditLimit: { type: Number, default: 0 },
  panDocument: { type: String },
  businessLicense: { type: String },
  panVerificationStatus: { type: String, enum: ['not_submitted', 'pending', 'ai_checked', 'manually_verified', 'rejected'], default: 'not_submitted' },
  licenseVerificationStatus: { type: String, enum: ['not_submitted', 'pending', 'ai_checked', 'manually_verified', 'rejected'], default: 'not_submitted' },
  panAiResult: { type: mongoose.Schema.Types.Mixed },
  licenseAiResult: { type: mongoose.Schema.Types.Mixed },
  panAiScore: { type: Number },
  licenseAiScore: { type: Number },
  verificationNotes: { type: String },
  rejectionReason: { type: String },
  kycSubmittedAt: { type: Date },
  kycReviewedAt: { type: Date },
  kycReviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  passwordResetOtp: { type: String },
  passwordResetOtpExpires: { type: Date },
}, { timestamps: true });

userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export default mongoose.model("User", userSchema);
 
```

### Wallet.js
```javascript
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

```

## 2. Complete app.js File

```javascript
// backend/app.js - triggering dev restart to load .env
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// Routes
import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import unitRoutes from './routes/unitRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import kycRoutes from './routes/kycRoutes.js';
import adminKycRoutes from './routes/adminKycRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import quoteRoutes from './routes/quoteRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ── Rate Limiting ────────────────────────────────────────────────────────────
// All limiters now use default safe keyGenerator (fixes IPv6 warning)
const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: "Too many login or registration attempts. Try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { message: "Rate limit exceeded for auth endpoints." },
  standardHeaders: true,
  legacyHeaders: false,
});

const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  message: { success: false, message: "Too many orders. Wait 5 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL] 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limit auth routes
app.use('/api/auth/login', strictAuthLimiter);
app.use('/api/auth/register', strictAuthLimiter);
app.use('/api/auth', generalAuthLimiter);

// Rate limit only POST /orders
app.use('/api/orders', (req, res, next) => {
  if (req.method === 'POST') return orderLimiter(req, res, next);
  next();
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/kyc', kycRoutes);
app.use('/api/admin/kyc', adminKycRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => res.send('eAson backend running!'));

// ── Global Error Handler (Catches Multer + other errors) ─────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Multer-specific errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File is too large. Max size is 50MB per file.' });
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({ message: 'Too many files uploaded. Max 20 images allowed.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: `Unexpected field: ${err.field}. Use the field name "images".` });
  }
  if (err.message && err.message.includes('Only images')) {
    return res.status(400).json({ message: err.message });
  }

  // Generic fallback
  console.error('Unhandled error:', err);
  return res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred.',
  });
});

// ── Database & Server ──────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  }
});
app.set('io', io);

// WebSockets Auth
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch(err) {
    next(new Error("Authentication error"));
  }
});

const onlineUsers = new Map();

io.on('connection', (socket) => {
  const userId = socket.user.id || socket.user._id;
  
  onlineUsers.set(userId.toString(), socket.id);
  io.emit('user_online', Array.from(onlineUsers.keys()));

  socket.on('join_conversation', (conversationId) => socket.join(conversationId));
  socket.on('leave_conversation', (conversationId) => socket.leave(conversationId));
  
  socket.on('typing_start', (convId) => {
    socket.to(convId).emit('user_typing', { conversationId: convId, userId, isTyping: true });
  });
  
  socket.on('typing_stop', (convId) => {
    socket.to(convId).emit('user_typing', { conversationId: convId, userId, isTyping: false });
  });

  socket.on('disconnect', () => {
    onlineUsers.delete(userId.toString());
    io.emit('user_offline', Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server + WebSockets running on http://localhost:${PORT}`));
```

## 3. kycController.js - runAiCheck Function

```javascript
export const runAiCheck = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.panDocument || !user.businessLicense) {
      return res.status(400).json({ message: "User has not uploaded both documents yet." });
    }

    const anthropic = getAnthropicClient();
    
    // MOCK RESPONSES IF NO API KEY — but do real validation on declared data
    if (!anthropic) {
      console.warn("MOCKING CLAUDE AI CALL: Missing ANTHROPIC_API_KEY — running rule-based validation instead.");

      const issues = [];
      let confidenceScore = 85;
      
      // --- PAN Validation ---
      const declaredPan = user.panNumber?.trim() || "";
      const panValid = /^\d{9}$/.test(declaredPan); // Nepal PAN: exactly 9 digits
      
      if (!declaredPan) {
        issues.push("No PAN number declared in profile.");
        confidenceScore -= 25;
      } else if (!panValid) {
        issues.push(`PAN number "${declaredPan}" is not a valid Nepal PAN (must be exactly 9 digits, numeric only).`);
        confidenceScore -= 30;
      }
      
      // --- Name consistency check (basic) ---
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const panNameMatch = panValid; // Without real AI we can't extract from image, so assume match only if valid format
      
      // --- Business info checks ---
      if (!user.shopName || user.shopName.trim().length < 3) {
        issues.push("Shop name is missing or too short.");
        confidenceScore -= 10;
      }
      if (!user.address || user.address.trim().length < 5) {
        issues.push("Business address is incomplete.");
        confidenceScore -= 5;
      }
      if (!user.phone || !/^(\+977|977|0)?[1-9]\d{7,9}$/.test(user.phone.replace(/[\s-]/g, ''))) {
        issues.push("Phone number does not look like a valid Nepali number.");
        confidenceScore -= 5;
      }

      // --- License validity (can't actually read image without AI) ---
      const licenseValid = true; // Human admin must verify visually
      const suspiciousFlag = confidenceScore < 50 || issues.length >= 3;
      const finalScore = Math.max(0, Math.min(100, confidenceScore));
      
      let recommendation = "approve";
      if (finalScore < 50 || !panValid) recommendation = "reject";
      else if (finalScore < 70 || issues.length > 1) recommendation = "manual_review";

      const mockResult = {
        panValid,
        panNameMatch,
        panNumberExtracted: panValid ? declaredPan : `INVALID: "${declaredPan}" (expected 9 digits)`,
        licenseValid,
        licenseRegistrationExtracted: "Manual review required",
        licenseExpiryDate: "Admin must verify physically",
        suspiciousFlag,
        confidenceScore: finalScore,
        issues,
        recommendation,
        note: "This analysis is rule-based (no Anthropic API key). Add ANTHROPIC_API_KEY to .env for Claude Vision document scanning."
      };

      user.panAiResult = mockResult;
      user.licenseAiResult = mockResult;
      user.panVerificationStatus = 'ai_checked';
      user.licenseVerificationStatus = 'ai_checked';
      user.panAiScore = finalScore;
      user.licenseAiScore = finalScore;
      await user.save();
      return res.status(200).json({ message: "Rule-based AI check completed", result: mockResult });
    }

    const panFile = fileToBase64(user.panDocument);
    const licFile = fileToBase64(user.businessLicense);

    if (!panFile || !licFile) {
       return res.status(400).json({ message: "Missing document physical files on disk." });
    }

    // PDF not supported by Anthropic Vision in standard blocks yet without strict extraction, but assuming images for now. If PDF, Anthropic supports it in beta.
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      system: "You are a KYC verification assistant for eAson, a wholesale marketplace in Nepal. You will be shown images of business documents. Analyze them carefully and return ONLY a valid JSON object with no markdown, no explanation. Be strict but fair — flag anything suspicious but note uncertainty.",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `Analyze these KYC documents for a wholesaler named ${user.firstName} ${user.lastName} applying with PAN ${user.panNumber || 'not provided'}. Document 1 is PAN card. Document 2 is Business license. Check: 1) Nepal PAN card format validity (9 digits, matches name), 2) Business license authenticity (IRD letterhead, valid date), 3) Any signs of tampering, 4) Name consistency. Return JSON: { "panValid": boolean, "panNameMatch": boolean, "panNumberExtracted": string, "licenseValid": boolean, "licenseRegistrationExtracted": string, "licenseExpiryDate": string, "suspiciousFlag": boolean, "confidenceScore": number, "issues": string[], "recommendation": string }` },
            { type: "image", source: { type: "base64", media_type: panFile.mediaType, data: panFile.data } },
            { type: "image", source: { type: "base64", media_type: licFile.mediaType, data: licFile.data } }
          ]
        }
      ]
    });

    const aiText = message.content[0].text;
    let resultJSON;
    try {
      resultJSON = JSON.parse(aiText);
    } catch(e) {
      console.error("AI didn't return perfect JSON. Stripping block ticks.");
      const stripped = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
      resultJSON = JSON.parse(stripped);
    }

    user.panAiResult = resultJSON;
    user.licenseAiResult = resultJSON;
    user.panVerificationStatus = 'ai_checked';
    user.licenseVerificationStatus = 'ai_checked';
    user.panAiScore = resultJSON.confidenceScore || 0;
    user.licenseAiScore = resultJSON.confidenceScore || 0;
    
    await user.save();
    return res.status(200).json({ message: "AI check completed", result: resultJSON });
  } catch (error) {
    console.error("AI Check error:", error);
    res.status(500).json({ message: "AI check failed", error: error.message });
  }
}
```

## 4. authController.js - registerUser and loginUser

### registerUser
```javascript
export const registerUser = async (req, res) => {
  try {
    console.log("Register request body:", req.body);

    const { firstName, lastName, email, password, role } = req.body;

    // Basic required fields check
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ── NEW: Password strength validation ───────────────────────────────────────
    if (password.length < 8) {
      return res.status(400)
... [Extraction truncated due to parsing issue]
```

### loginUser
```javascript
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isEmailVerified) {
      // Bypass verification for legacy users created before the OTP feature.
      const isLegacyUser = user.createdAt && user.createdAt < new Date("2026-03-25T00:00:00.000Z");
      
      if (isLegacyUser) {
        user.isEmailVerified = true;
        await user.save();
      } else {
        return res.status(403).json({ 
          message: "Please verify your email to login.",
          requiresEmailVerification: true,
          email: user.email
        });
      }
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send token + user data (without password)
    res.status(200).json({
      token,
      user: {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        verified: user.verified,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
```

## 5. CartContext.jsx - getTieredPriceForUser and addToCart

### getTieredPriceForUser
```javascript
const getTieredPriceForUser = (product, quantity) => {
    let price = getPriceForUser(product);
    if (user?.role === "retailer" && product.bulkPricing && product.bulkPricing.length > 0) {
      const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
      for (const tier of sortedTiers) {
        if (quantity >= tier.minQuantity) {
          return tier.pricePerUnit;
        }
      }
    }
    return price;
  }
```

### addToCart
```javascript
const addToCart = (product, quantity = 1, selectedVariants = {}
```

## 6. orderController.js - createOrder

```javascript
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, phone, notes, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty or invalid" });
    }

    if (!shippingAddress?.trim() || !phone?.trim()) {
      return res.status(400).json({ success: false, message: "Shipping address and phone are required" });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Atomic stock decrement — uses $inc with $gte guard to prevent overselling
    for (const cartItem of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: cartItem._id, stock: { $gte: cartItem.quantity } },
        { $inc: { stock: -cartItem.quantity } },
        { new: true }
      );

      if (!updated) {
        // Either product not found or insufficient stock
        const product = await Product.findById(cartItem._id);
        if (!product) {
          return res.status(404).json({ success: false, message: `Product not found: ${cartItem._id}` });
        }
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
        });
      }

      let priceToUse = updated.wholesalerPrice || updated.baseCost || 0;
      if (updated.bulkPricing && updated.bulkPricing.length > 0) {
        const sortedTiers = [...updated.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
        for (const tier of sortedTiers) {
          if (cartItem.quantity >= tier.minQuantity) {
            priceToUse = tier.pricePerUnit;
            break;
          }
        }
      }

      orderItems.push({
        product: updated._id,
        quantity: cartItem.quantity,
        pricePerUnit: priceToUse,
      });
      totalAmount += priceToUse * cartItem.quantity;
    }

    // Server-side tax calculation (13% Nepal VAT)
    const TAX_RATE = 0.13;
    const taxAmount = Math.round(totalAmount * TAX_RATE * 100) / 100;
    const grandTotal = Math.round((totalAmount + taxAmount) * 100) / 100;

    const platformFee = Math.round(totalAmount * 0.02 * 100) / 100;
    const wholesalerPayout = totalAmount - platformFee;

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      taxAmount,
      grandTotal,
      platformFee,
      wholesalerPayout,
      shippingAddress,
      phone,
      notes: notes?.trim() || "",
      status: "pending",
      paymentStatus: "pending",
      paymentMethod: paymentMethod || "cod",
    });

    console.log(`Order created: ${order._id} | Subtotal: ${totalAmount} | Tax: ${taxAmount} | Grand: ${grandTotal}`);

    // Send email (non-blocking)
    try {
      const buyer = await User.findById(userId).select("email fullName");
      if (buyer?.email) {
        sendOrderConfirmation(order, buyer).catch(console.error);
      }
    } catch (emailErr) {
      console.error("Email setup failed (non-critical):", emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: {
        _id: order._id,
        totalAmount: order.totalAmount,
        taxAmount: order.taxAmount,
        grandTotal: order.grandTotal,
        status: order.status,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("Order creation FAILED:", err.message);
    res.status(500).json({ success: false, message: "Failed to create order", error: err.message });
  }
}
```

## 7. useChat.js Zustand Store

```javascript
import { create } from 'zustand';
import { io } from 'socket.io-client';
import API from '../utils/api';
import toast from 'react-hot-toast';

const baseApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = baseApiUrl.replace(/\/api\/?$/, '');
export const useChat = create((set, get) => ({
  socket: null,
  conversations: [],
  activeConversation: null,
  messages: [],
  onlineUsers: [],
  typingUsers: {},
  unreadTotal: 0,
  isDrawerOpen: false,

  initSocket: () => {
    // Prevent duplicate sockets
    if (get().socket) return;
    
    // Auth token is typically in cookies ('eason_token') or local storage.
    // Ensure we send it to Socket.io for authentication.
    const token = localStorage.getItem('eason_token') || '';

    const socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
      reconnection: true
    });

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connect_error:', err.message);
    });

    socket.on('user_online', (users) => set({ onlineUsers: users }));
    socket.on('user_offline', (users) => set({ onlineUsers: users }));

    socket.on('new_message', (msg) => {
      const { activeConversation, messages, conversations } = get();
      
      // If we are looking at this conversation, push it locally
      if (activeConversation && activeConversation._id === msg.conversation) {
        set({ messages: [...messages, msg] });
        // Auto mark as read
        get().markRead(msg.conversation);
      } else {
        // Otherwise it's unread, increment unread total
        set((state) => ({ unreadTotal: state.unreadTotal + 1 }));
      }

      // Bump conversation to top in list
      const updatedConvs = conversations.map(c => 
        c._id === msg.conversation 
          ? { ...c, lastMessage: { text: msg.text, sender: msg.sender, sentAt: new Date() } }
          : c
      ).sort((a,b) => new Date(b.lastMessage?.sentAt || 0) - new Date(a.lastMessage?.sentAt || 0));
      
      set({ conversations: updatedConvs });
    });

    socket.on('user_typing', ({ conversationId, userId, isTyping }) => {
      set((state) => ({
        typingUsers: { ...state.typingUsers, [conversationId]: isTyping ? userId : null }
      }));
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchConversations: async () => {
    try {
      const { data } = await API.get('/chat/my');
      set({ conversations: data });
      
      // Calculate total unread (from my perspective)
      // Assuming userId is known by the caller or we calculate total by iterating over all unreadCount where I am the target.
      // Easiest is to let backend send unreadTotal, but we can just use length.
      // Wait, actual unread count per conversation is buried in conv.unreadCount.
      // This is simplified.
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    }
  },

  setActiveConversation: async (conv) => {
    set({ activeConversation: conv, isDrawerOpen: true });
    if (!conv) return;

    try {
      const { data } = await API.get(`/chat/${conv._id}/messages`);
      set({ messages: data });
      get().socket?.emit('join_conversation', conv._id);
      get().markRead(conv._id);
    } catch (err) {
      toast.error('Could not load messages');
    }
  },

  startChat: async ({ wholesalerId, productId, orderId }) => {
    try {
      const { data: conv } = await API.post('/chat/start', { wholesalerId, productId, orderId });
      // Insert into local list if new
      const exists = get().conversations.find(c => c._id === conv._id);
      if (!exists) {
        set((state) => ({ conversations: [conv, ...state.conversations] }));
      }
      get().setActiveConversation(conv);
    } catch (err) {
      toast.error('Failed to start chat');
    }
  },

  sendMessage: async (text, type = 'text', attachments = []) => {
    const { activeConversation, socket } = get();
    if (!activeConversation) return;

    try {
      // Optimistic append omitted for simplicity as we await API
      await API.post(`/chat/${activeConversation._id}/messages`, { text, type, attachments });
      // The socket event 'new_message' will broadcast back to us to append it!
    } catch (err) {
      toast.error('Failed to send message');
    }
  },

  markRead: async (conversationId) => {
    try {
      await API.post(`/chat/${conversationId}/read`);
      // Update local unread counter
      set((state) => {
        const newConvs = state.conversations.map(c => {
          if (c._id === conversationId && c.unreadCount) {
             // simplified clearing unread for current user
             return { ...c };
          }
          return c;
        });
        return { conversations: newConvs, unreadTotal: Math.max(0, state.unreadTotal - 1) };
      });
    } catch (err) {
      // Background fail
    }
  },

  setTyping: (isTyping) => {
    const { socket, activeConversation } = get();
    if (!socket || !activeConversation) return;
    
    if (isTyping) {
      socket.emit('typing_start', activeConversation._id);
    } else {
      socket.emit('typing_stop', activeConversation._id);
    }
  },

  closeDrawer: () => {
    const { socket, activeConversation } = get();
    if (socket && activeConversation) {
      socket.emit('leave_conversation', activeConversation._id);
    }
    set({ isDrawerOpen: false, activeConversation: null, messages: [] });
  }
}));

```

## 8. validators/schemas.js

```javascript
import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "First name is too short"),
  lastName: z.string().min(2, "Last name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  role: z.enum(["wholesaler", "retailer"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const productSchema = z.object({
  name: z.string().min(3),
  price: z.number().positive("Price must be a positive number").optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative").optional(),
});

export const orderSchema = z.object({
  items: z.array(
    z.object({
      product: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "Order must contain at least one item"),
});

```

## 9. categoryAttributes.js Configuration

```javascript
// src/utils/categoryAttributes.js

export const CATEGORY_GROUPS = [
  { group: "Electronics & Office", emoji: "💻", color: "bg-blue-500", slugs: ["electronics-accessories", "stationery-office"] },
  { group: "Home & Kitchen", emoji: "🏠", color: "bg-orange-500", slugs: ["kitchen-appliances", "home-living", "cleaning-household"] },
  { group: "Fashion & Lifestyle", emoji: "👚", color: "bg-pink-500", slugs: ["clothing-apparel", "footwear", "bags-luggage", "beauty-cosmetics", "hair-care"] },
  { group: "Food & Daily Essentials", emoji: "🍎", color: "bg-green-500", slugs: ["grocery-food", "personal-hygiene"] },
  { group: "Kids, Sports & Hobbies", emoji: "⚽", color: "bg-yellow-500", slugs: ["baby-kids", "sports-fitness", "toys-games", "pet-supplies"] },
  { group: "Special & Seasonal", emoji: "🎉", color: "bg-purple-500", slugs: ["festive-seasonal", "hardware-tools", "agriscience-farming"] }
];

export const CATEGORY_UNIT_HINTS = {
  "electronics-accessories": ["Box", "Carton", "Pack", "Set", "Dozen"],
  "stationery-office": ["Box", "Carton", "Dozen", "Packet", "Set"],
  "kitchen-appliances": ["Box", "Carton", "Set"],
  "health-wellness": ["Box", "Bottle", "Jar", "Pack", "Tin"],
  "personal-hygiene": ["Box", "Packet", "Carton", "Bottle", "Pack"],
  "grocery-food": ["Carton", "Bag", "Packet", "Box", "Tin", "Jar", "Bottle"],
  "clothing-apparel": ["Dozen", "Carton", "Set", "Pack", "Bag"],
  "footwear": ["Carton", "Box", "Dozen"],
  "bags-luggage": ["Carton", "Bag", "Dozen"],
  "beauty-cosmetics": ["Box", "Carton", "Bottle", "Jar", "Set"],
  "hair-care": ["Box", "Carton", "Bottle", "Jar"],
  "home-living": ["Box", "Set", "Carton", "Pack", "Bag"],
  "cleaning-household": ["Carton", "Bottle", "Packet", "Box"],
  "baby-kids": ["Box", "Carton", "Set", "Pack"],
  "sports-fitness": ["Box", "Carton", "Set", "Bag", "Dozen"],
  "toys-games": ["Box", "Carton", "Set"],
  "hardware-tools": ["Box", "Carton", "Set", "Packet", "Tin"],
  "pet-supplies": ["Bag", "Carton", "Packet", "Box", "Tin"],
  "festive-seasonal": ["Box", "Packet", "Carton", "Set", "Bag"],
  "agriscience-farming": ["Bag", "Bottle", "Tin", "Packet", "Carton"]
};

// Common sections
const SEC_PHYSICAL = "Physical Details";
const SEC_TECH = "Technical Specifications";
const SEC_ATTRIBUTES = "Product Attributes";
const SEC_STOCK = "Pricing & Stock Info";
const SEC_COMPLIANCE = "Compliance & Safety";
const SEC_OTHER = "Additional Details";

export const CATEGORY_ATTRIBUTES = {
  "electronics-accessories": [
    { key: "connectorType", label: "Connector Type", type: "select", options: ["USB-C", "Micro-USB", "Lightning", "USB-A", "3.5mm", "HDMI", "Wireless"], required: true, section: SEC_TECH },
    { key: "compatibility", label: "Compatibility", type: "multiselect", options: ["iPhone", "Samsung", "Xiaomi", "Realme", "OnePlus", "Universal", "All Android"], required: true, section: SEC_TECH },
    { key: "wattage", label: "Wattage", type: "number", unit: "W", required: false, section: SEC_TECH },
    { key: "cableLength", label: "Cable Length", type: "select", options: ["0.5m", "1m", "1.5m", "2m", "3m"], required: false, section: SEC_PHYSICAL, visibleWhen: { key: "connectorType", notValue: "Wireless" } },
    { key: "outputVoltage", label: "Output Voltage", type: "select", options: ["5V", "9V", "12V", "20V", "Multi"], required: false, section: SEC_TECH },
    { key: "fastCharge", label: "Fast Charge Support", type: "select", options: ["No", "Yes-PD", "Yes-QC3.0", "Yes-QC4.0", "Yes-65W+"], required: false, section: SEC_TECH },
    { key: "frequencyResponse", label: "Frequency Response", type: "text", placeholder: "e.g. 20Hz-20kHz", required: false, section: SEC_TECH },
    { key: "impedance", label: "Impedance", type: "text", placeholder: "e.g. 32 Ohm", required: false, section: SEC_TECH },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "warranty", label: "Warranty", type: "select", options: ["No Warranty", "1 Month", "3 Months", "6 Months", "1 Year", "2 Years"], required: true, section: SEC_COMPLIANCE },
    { key: "certification", label: "Certification", type: "multiselect", options: ["BIS", "CE", "RoHS", "FCC", "ISI"], required: false, section: SEC_COMPLIANCE },
    { key: "unitsPerWholesaleBox", label: "Units Per Wholesale Box", type: "number", required: true, helpText: "How many retail units come in one wholesale box", section: SEC_STOCK }
  ],
  "stationery-office": [
    { key: "paperSize", label: "Paper Size", type: "select", options: ["A3", "A4", "A5", "B5", "Letter", "Legal", "Custom"], required: false, section: SEC_PHYSICAL },
    { key: "ruling", label: "Ruling Type", type: "select", options: ["Unlined", "Single Line", "Double Line", "Graph", "Dotted", "Spiral"], required: false, section: SEC_ATTRIBUTES },
    { key: "inkColor", label: "Ink Color", type: "colorpicker", required: false, section: SEC_ATTRIBUTES },
    { key: "tipSize", label: "Tip Size", type: "select", options: ["0.38mm", "0.5mm", "0.7mm", "1mm", "Ballpoint", "Gel", "Fountain", "Marker"], required: false, section: SEC_ATTRIBUTES },
    { key: "paperWeightGSM", label: "Paper Weight (GSM)", type: "number", required: false, unit: "GSM", section: SEC_PHYSICAL },
    { key: "pagesPerBook", label: "Pages Per Book", type: "number", required: false, section: SEC_PHYSICAL },
    { key: "bindingType", label: "Binding Type", type: "select", options: ["Staple", "Spiral", "Glue", "Hardcover", "Softcover"], required: false, section: SEC_PHYSICAL },
    { key: "material", label: "Material", type: "select", options: ["Plastic", "Metal", "Bamboo", "Wood", "Paper", "Cardboard"], required: false, section: SEC_PHYSICAL },
    { key: "piecesPerBox", label: "Pieces Per Box", type: "number", required: true, section: SEC_STOCK },
    { key: "brandTier", label: "Brand Tier", type: "select", options: ["Economy", "Standard", "Premium"], required: true, section: SEC_ATTRIBUTES }
  ],
  "kitchen-appliances": [
    { key: "voltage", label: "Voltage", type: "select", options: ["220V", "110V", "220-240V", "Dual"], required: true, section: SEC_TECH },
    { key: "wattage", label: "Wattage", type: "number", required: true, unit: "W", section: SEC_TECH },
    { key: "capacityLitres", label: "Capacity (Litres)", type: "number", required: false, unit: "L", section: SEC_PHYSICAL },
    { key: "material", label: "Material", type: "select", options: ["Stainless Steel", "Aluminium", "Cast Iron", "Non-stick", "Glass", "Plastic", "Copper"], required: true, section: SEC_PHYSICAL },
    { key: "speedSettings", label: "Speed Settings", type: "text", placeholder: "e.g. 3 speeds or 10 speeds", required: false, section: SEC_TECH },
    { key: "inductionCompatible", label: "Induction Compatible", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "gasCompatible", label: "Gas Compatible", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "dishwasherSafe", label: "Dishwasher Safe", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "warrantyYears", label: "Warranty Years", type: "number", required: true, unit: "years", section: SEC_COMPLIANCE },
    { key: "certification", label: "Certification", type: "multiselect", options: ["BIS", "ISI", "CE", "Energy Star"], required: false, section: SEC_COMPLIANCE },
    { key: "countryOfManufacture", label: "Country Of Manufacture", type: "select", options: ["India", "China", "Nepal", "Germany", "Japan", "South Korea"], required: true, section: SEC_COMPLIANCE },
    { key: "lidIncluded", label: "Lid Included", type: "boolean", required: false, section: SEC_PHYSICAL },
    { key: "handlesCount", label: "Handles Count", type: "number", required: false, section: SEC_PHYSICAL }
  ],
  "health-wellness": [
    { key: "form", label: "Form", type: "select", options: ["Tablet", "Capsule", "Softgel", "Syrup", "Powder", "Liquid", "Cream", "Gel", "Spray", "Patch", "Strip", "Sachet"], required: true, section: SEC_PHYSICAL },
    { key: "strengthDosage", label: "Strength/Dosage", type: "text", placeholder: "e.g. 500mg, 1000IU", required: false, section: SEC_TECH },
    { key: "servingCount", label: "Serving Count", type: "number", placeholder: "e.g. 60", required: true, section: SEC_STOCK },
    { key: "servingSize", label: "Serving Size", type: "text", placeholder: "e.g. 1 tablet, 5ml", required: false, section: SEC_TECH },
    { key: "targetGroup", label: "Target Group", type: "multiselect", options: ["Adults", "Children", "Elderly", "Pregnant Women", "Athletes", "Diabetic", "General"], required: true, section: SEC_ATTRIBUTES },
    { key: "keyIngredients", label: "Key Ingredients", type: "text", required: false, section: SEC_ATTRIBUTES },
    { key: "storage", label: "Storage Condition", type: "select", options: ["Room Temperature", "Refrigerate", "Cool Dry Place", "Away from Light"], required: true, section: SEC_COMPLIANCE },
    { key: "containsAlcohol", label: "Contains Alcohol", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "dietaryType", label: "Dietary Type", type: "select", options: ["Vegetarian", "Vegan", "Non-Vegetarian", "Not Applicable"], required: true, section: SEC_ATTRIBUTES },
    { key: "fssaiApproved", label: "FSSAI/FDA Approved", type: "boolean", required: true, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life", type: "select", options: ["6 months", "12 months", "18 months", "24 months", "36 months"], required: true, section: SEC_COMPLIANCE },
    { key: "countryOfOrigin", label: "Country of Origin", type: "text", required: true, section: SEC_COMPLIANCE }
  ],
  "personal-hygiene": [
    { key: "productType", label: "Product Type", type: "select", options: ["Sanitary Pads", "Panty Liners", "Tampons", "Toilet Paper", "Facial Tissue", "Wet Wipes", "Hand Wash", "Body Wash", "Soap Bar", "Sanitizer", "Toothbrush", "Toothpaste", "Mouthwash", "Deodorant", "Razor"], required: true, section: SEC_ATTRIBUTES },
    { key: "absorbency", label: "Absorbency", type: "select", options: ["Regular", "Heavy", "Overnight", "Ultra Thin"], required: false, section: SEC_ATTRIBUTES, visibleWhen: { key: "productType", values: ["Sanitary Pads", "Tampons"] } },
    { key: "sheets", label: "Sheets Count", type: "number", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Toilet Paper", "Facial Tissue"] } },
    { key: "alcoholPercentage", label: "Alcohol Percentage", type: "number", unit: "%", required: false, section: SEC_TECH, visibleWhen: { key: "productType", value: "Sanitizer" } },
    { key: "scent", label: "Scent", type: "select", options: ["Unscented", "Mild", "Fresh", "Floral", "Citrus", "Herbal", "Mint", "Charcoal"], required: false, section: SEC_ATTRIBUTES },
    { key: "skinType", label: "Skin Type", type: "multiselect", options: ["Normal", "Sensitive", "Dry", "Oily", "All Skin Types"], required: false, section: SEC_ATTRIBUTES },
    { key: "containsAlcohol", label: "Contains Alcohol", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "dermatologistTested", label: "Dermatologist Tested", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "crueltyfree", label: "Cruelty Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "biodegradable", label: "Biodegradable", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "countPerPack", label: "Count Per Pack", type: "text", placeholder: "e.g. 8 pads, 200 tissues", required: true, section: SEC_STOCK },
    { key: "certification", label: "Certification", type: "multiselect", options: ["ISO", "Dermatologist Tested", "Hypoallergenic", "GMP Certified"], required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: false, section: SEC_COMPLIANCE }
  ],
  "grocery-food": [
    { key: "subCategory", label: "Sub Category", type: "select", options: ["Tea & Coffee", "Biscuits & Snacks", "Noodles & Instant", "Dry Fruits & Nuts", "Spices & Masala", "Cooking Oil", "Pulses & Lentils", "Rice & Grains", "Dairy", "Condiments & Sauces", "Beverages", "Other"], required: true, section: SEC_ATTRIBUTES },
    { key: "brand", label: "Brand", type: "text", required: true, section: SEC_ATTRIBUTES },
    { key: "flavor", label: "Flavor/Variant", type: "multiselect", options: ["Plain", "Spicy", "Sweet", "Salty", "Sour", "Masala", "Chocolate", "Vanilla", "Mint", "Cardamom", "Ginger", "Original"], required: false, section: SEC_ATTRIBUTES },
    { key: "weightPerUnit", label: "Weight Per Unit", type: "text", placeholder: "e.g. 100g, 500g, 1kg", required: true, section: SEC_PHYSICAL },
    { key: "unitsPerCarton", label: "Units Per Carton", type: "number", required: true, section: SEC_STOCK },
    { key: "cartonWeightKg", label: "Carton Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL },
    { key: "dietaryTags", label: "Dietary Tags", type: "multiselect", options: ["Vegetarian", "Vegan", "Gluten Free", "Sugar Free", "No Preservatives", "Organic", "Halal", "No MSG", "Eggless"], required: false, section: SEC_COMPLIANCE },
    { key: "fssaiLicense", label: "DFTQC/FSSAI License", type: "text", required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: true, section: SEC_COMPLIANCE },
    { key: "storageCondition", label: "Storage", type: "select", options: ["Room Temperature", "Refrigerate", "Freeze", "Cool Dry Place"], required: true, section: SEC_COMPLIANCE },
    { key: "countryOfOrigin", label: "Country of Origin", type: "select", options: ["India", "Nepal", "China", "Sri Lanka", "USA", "Brazil", "Other"], required: true, section: SEC_COMPLIANCE },
    { key: "organic", label: "Organic", type: "boolean", required: false, section: SEC_ATTRIBUTES }
  ],
  "clothing-apparel": [
    { key: "gender", label: "Gender", type: "select", options: ["Men", "Women", "Boys", "Girls", "Unisex", "Infant"], required: true, section: SEC_ATTRIBUTES },
    { key: "ageGroup", label: "Age Group", type: "select", options: ["Infant 0-2y", "Kids 3-12y", "Teens 13-17y", "Adults", "All Ages"], required: true, section: SEC_ATTRIBUTES },
    { key: "clothingType", label: "Clothing Type", type: "select", options: ["Shirt", "T-Shirt", "Trouser", "Jeans", "Jacket", "Sweater", "Saree", "Kurta", "Lehenga", "Dress", "Shorts", "Tracksuit", "Innerwear", "School Uniform", "Sportswear", "Ethnic", "Formal", "Casual"], required: true, section: SEC_ATTRIBUTES },
    { key: "sizes", label: "Sizes Available", type: "multiselect", options: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "Free Size", "Custom", "26", "28", "30", "32", "34", "36", "38", "40"], required: true, section: SEC_PHYSICAL },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "fabric", label: "Fabric/Material", type: "select", options: ["Cotton", "Polyester", "Silk", "Wool", "Linen", "Denim", "Rayon", "Nylon", "Blended", "Khadi", "Fleece"], required: true, section: SEC_PHYSICAL },
    { key: "fit", label: "Fit Type", type: "select", options: ["Regular", "Slim", "Loose", "Oversized", "Tailored"], required: false, section: SEC_PHYSICAL },
    { key: "occasion", label: "Occasion", type: "multiselect", options: ["Casual", "Formal", "Party", "Ethnic", "Sports", "School", "Festival", "Wedding"], required: false, section: SEC_ATTRIBUTES },
    { key: "piecesPerSet", label: "Pieces Per Set", type: "number", required: false, section: SEC_STOCK, visibleWhen: { key: "clothingType", values: ["Set", "Tracksuit", "Uniform"] } },
    { key: "washCare", label: "Wash Care", type: "select", options: ["Machine Wash", "Hand Wash Only", "Dry Clean Only", "Do Not Bleach"], required: false, section: SEC_COMPLIANCE },
    { key: "countryOfManufacture", label: "Country Of Manufacture", type: "text", required: true, section: SEC_COMPLIANCE },
    { key: "minimumOrderQuantityPieces", label: "Min Order Quantity (Pieces)", type: "number", required: true, section: SEC_STOCK }
  ],
  "footwear": [
    { key: "gender", label: "Gender", type: "select", options: ["Men", "Women", "Boys", "Girls", "Unisex", "Infant"], required: true, section: SEC_ATTRIBUTES },
    { key: "footwearType", label: "Footwear Type", type: "select", options: ["Sports Shoes", "Casual Shoes", "Formal Shoes", "Sandals", "Slippers", "Flip Flops", "Boots", "School Shoes", "Heels", "Wedges", "Loafers", "Sneakers"], required: true, section: SEC_ATTRIBUTES },
    { key: "sizes", label: "Sizes Available", type: "multiselect", options: ["UK 1", "UK 2", "UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10", "UK 11", "UK 12", "EU 35", "EU 36", "EU 37", "EU 38", "EU 39", "EU 40", "EU 41", "EU 42", "EU 43", "EU 44", "EU 45"], required: true, section: SEC_PHYSICAL },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "upperMaterial", label: "Upper Material", type: "select", options: ["Leather", "Synthetic", "Canvas", "Mesh", "Rubber", "Fabric", "PU", "Suede"], required: true, section: SEC_PHYSICAL },
    { key: "soleMaterial", label: "Sole Material", type: "select", options: ["Rubber", "EVA", "TPR", "PU", "Leather", "Foam"], required: true, section: SEC_PHYSICAL },
    { key: "closure", label: "Closure Type", type: "select", options: ["Lace-up", "Velcro", "Slip-on", "Buckle", "Zip", "Hook & Loop"], required: false, section: SEC_PHYSICAL },
    { key: "occasion", label: "Occasion", type: "multiselect", options: ["Casual", "Formal", "Sports", "School", "Party", "Beach", "Trekking"], required: false, section: SEC_ATTRIBUTES },
    { key: "pairsPerCarton", label: "Pairs Per Carton", type: "number", required: true, section: SEC_STOCK },
    { key: "countryOfManufacture", label: "Country of Manufacture", type: "text", required: true, section: SEC_COMPLIANCE }
  ],
  "bags-luggage": [
    { key: "bagType", label: "Bag Type", type: "select", options: ["School Bag", "Backpack", "Laptop Bag", "Travel Bag", "Trolley", "Handbag", "Tote", "Sling", "Clutch", "Gym Bag", "Waist Bag", "Duffle"], required: true, section: SEC_ATTRIBUTES },
    { key: "gender", label: "Gender", type: "select", options: ["Men", "Women", "Boys", "Girls", "Unisex"], required: false, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "select", options: ["Polyester", "Nylon", "Canvas", "Leather", "PU Leather", "Jute", "Oxford Fabric", "Cordura"], required: true, section: SEC_PHYSICAL },
    { key: "capacityLitres", label: "Capacity (Litres)", type: "number", unit: "L", required: false, section: SEC_PHYSICAL },
    { key: "numberOfCompartments", label: "No. of Compartments", type: "number", required: false, section: SEC_PHYSICAL },
    { key: "laptopCompatible", label: "Laptop Compatible", type: "boolean", required: false, section: SEC_TECH },
    { key: "laptopSizeInch", label: "Laptop Size (Inch)", type: "select", options: ["13\"", "14\"", "15.6\"", "17\""], required: false, section: SEC_TECH, visibleWhen: { key: "laptopCompatible", value: true } },
    { key: "wheelType", label: "Wheel Type", type: "select", options: ["No Wheels", "2 Spinner Wheels", "4 Spinner Wheels", "Inline Skate"], required: false, section: SEC_PHYSICAL, visibleWhen: { key: "bagType", value: "Trolley" } },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 45cm x 30cm x 20cm", required: false, section: SEC_PHYSICAL },
    { key: "weightKg", label: "Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL },
    { key: "waterResistant", label: "Water Resistant", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "warranty", label: "Warranty", type: "select", options: ["No Warranty", "6 Months", "1 Year", "2 Years"], required: true, section: SEC_COMPLIANCE }
  ],
  "beauty-cosmetics": [
    { key: "productType", label: "Product Type", type: "select", options: ["Lipstick", "Lip Gloss", "Foundation", "Concealer", "Kajal", "Eyeliner", "Mascara", "Eyeshadow", "Blush", "Highlighter", "Face Cream", "Moisturizer", "Sunscreen", "Serum", "Face Wash", "Toner", "Nail Polish", "Perfume", "Deodorant", "BB Cream", "Primer", "Setting Spray"], required: true, section: SEC_ATTRIBUTES },
    { key: "shade", label: "Shade/Color", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "finish", label: "Finish", type: "select", options: ["Matte", "Glossy", "Satin", "Dewy", "Natural", "Shimmer", "Metallic"], required: false, section: SEC_ATTRIBUTES },
    { key: "skinType", label: "Skin Type Suitability", type: "multiselect", options: ["Normal", "Oily", "Dry", "Combination", "Sensitive", "All Types"], required: false, section: SEC_ATTRIBUTES },
    { key: "spf", label: "SPF Level", type: "number", required: false, section: SEC_TECH, visibleWhen: { key: "productType", values: ["Sunscreen", "Foundation", "BB Cream"] } },
    { key: "volumeMl", label: "Volume (ml)", type: "number", unit: "ml", required: false, section: SEC_PHYSICAL },
    { key: "coverage", label: "Coverage", type: "select", options: ["Light", "Medium", "Full", "Buildable"], required: false, section: SEC_ATTRIBUTES, visibleWhen: { key: "productType", values: ["Foundation", "Concealer", "BB Cream"] } },
    { key: "longWearing", label: "Long Wearing", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "waterproof", label: "Waterproof", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "crueltyfree", label: "Cruelty Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "dermatologistTested", label: "Dermatologist Tested", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: true, section: SEC_COMPLIANCE },
    { key: "countryOfOrigin", label: "Country Of Origin", type: "text", required: true, section: SEC_COMPLIANCE }
  ],
  "hair-care": [
    { key: "productType", label: "Product Type", type: "select", options: ["Shampoo", "Conditioner", "Hair Oil", "Serum", "Hair Mask", "Hair Dye", "Hair Spray", "Dry Shampoo", "Hair Wax", "Gel", "Comb", "Brush", "Hair Clip", "Hair Band", "Hair Extension", "Wig"], required: true, section: SEC_ATTRIBUTES },
    { key: "hairType", label: "Suitable Hair Type", type: "multiselect", options: ["Normal", "Oily", "Dry", "Damaged", "Colored", "Curly", "Straight", "Wavy", "Frizzy", "Thin", "Thick"], required: false, section: SEC_ATTRIBUTES },
    { key: "concern", label: "Hair Concern", type: "multiselect", options: ["Dandruff", "Hair Fall", "Growth", "Hydration", "Smoothing", "Volumizing", "Repair", "Color Protection"], required: false, section: SEC_ATTRIBUTES },
    { key: "dyeShade", label: "Dye Shade", type: "colorpicker", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Hair Dye", "Hair Color"] } },
    { key: "volumeMl", label: "Volume (ml)", type: "number", unit: "ml", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Shampoo", "Conditioner", "Hair Oil", "Serum", "Hair Mask", "Hair Spray"] } },
    { key: "scent", label: "Scent", type: "select", options: ["Unscented", "Floral", "Herbal", "Coconut", "Argan", "Keratin", "Mint", "Rose"], required: false, section: SEC_ATTRIBUTES },
    { key: "containsParaben", label: "Contains Paraben", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "sulfateFree", label: "Sulfate Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "siliconeFree", label: "Silicone Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "crueltyfree", label: "Cruelty Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: true, section: SEC_COMPLIANCE }
  ],
  "home-living": [
    { key: "productType", label: "Product Type", type: "select", options: ["Bedsheet", "Pillow", "Pillowcase", "Blanket", "Quilt", "Curtain", "Towel", "Bath Mat", "Storage Box", "Hanger", "Door Mat", "Wall Decor", "Candle", "Photo Frame", "Clock", "Vase", "Table Runner", "Cushion Cover", "Laundry Basket"], required: true, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "select", options: ["Cotton", "Polyester", "Microfiber", "Silk", "Wool", "Jute", "Bamboo", "Linen", "Velvet", "Plastic", "Wood", "Metal", "Ceramic", "Glass"], required: true, section: SEC_PHYSICAL },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 90x200cm, 45x45cm", required: false, section: SEC_PHYSICAL },
    { key: "threadCount", label: "Thread Count (TC)", type: "number", required: false, section: SEC_TECH, visibleWhen: { key: "productType", values: ["Bedsheet", "Pillowcase", "Towel"] } },
    { key: "setCount", label: "Items Per Set", type: "number", placeholder: "e.g. 1, 2, 6", required: false, section: SEC_STOCK },
    { key: "color", label: "Color", type: "colorpicker", required: true, section: SEC_PHYSICAL },
    { key: "pattern", label: "Pattern", type: "select", options: ["Solid", "Striped", "Floral", "Geometric", "Abstract", "Printed", "Embroidered", "Plain"], required: false, section: SEC_PHYSICAL },
    { key: "occasion", label: "Occasion", type: "multiselect", options: ["Daily Use", "Wedding", "Festival", "Gift", "Luxury"], required: false, section: SEC_ATTRIBUTES },
    { key: "washCare", label: "Wash Care", type: "select", options: ["Machine Wash", "Hand Wash", "Dry Clean"], required: false, section: SEC_COMPLIANCE },
    { key: "piecesPerCarton", label: "Sets/Pieces Per Carton", type: "number", required: true, section: SEC_STOCK }
  ],
  "cleaning-household": [
    { key: "productType", label: "Product Type", type: "select", options: ["Detergent Powder", "Detergent Liquid", "Fabric Softener", "Dishwash Liquid", "Dishwash Bar", "Floor Cleaner", "Toilet Cleaner", "Glass Cleaner", "Multi-surface Cleaner", "Broom", "Mop", "Scrubber", "Sponge", "Garbage Bag", "Air Freshener", "Disinfectant Spray", "Drain Cleaner", "Shoe Polish"], required: true, section: SEC_ATTRIBUTES },
    { key: "scent", label: "Scent/Fragrance", type: "select", options: ["Unscented", "Lemon", "Lavender", "Pine", "Rose", "Ocean", "Fresh", "Original"], required: false, section: SEC_ATTRIBUTES },
    { key: "volumeMl", label: "Volume (ml)", type: "number", unit: "ml", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Detergent Liquid", "Fabric Softener", "Dishwash Liquid", "Floor Cleaner", "Toilet Cleaner", "Glass Cleaner", "Multi-surface Cleaner"] } },
    { key: "weightGrams", label: "Weight (g)", type: "number", unit: "g", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Detergent Powder", "Dishwash Bar"] } },
    { key: "unitsPerCarton", label: "Units Per Carton", type: "number", required: true, section: SEC_STOCK },
    { key: "concentrate", label: "Is Concentrate?", type: "boolean", helpText: "Is this a concentrate that needs dilution?", required: false, section: SEC_TECH },
    { key: "dilutionRatio", label: "Dilution Ratio", type: "text", placeholder: "e.g. 1:10 with water", required: false, section: SEC_TECH, visibleWhen: { key: "concentrate", value: true } },
    { key: "antibacterial", label: "Antibacterial", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "ecoFriendly", label: "Eco-Friendly", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "childSafe", label: "Child Safe", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: false, section: SEC_COMPLIANCE }
  ],
  "baby-kids": [
    { key: "ageGroup", label: "Age Group", type: "select", options: ["0-3 Months", "3-6 Months", "6-12 Months", "1-2 Years", "2-3 Years", "3-5 Years", "5-8 Years", "8-12 Years", "All Ages"], required: true, section: SEC_ATTRIBUTES },
    { key: "productType", label: "Product Type", type: "select", options: ["Diaper", "Baby Wipes", "Baby Lotion", "Baby Oil", "Baby Shampoo", "Baby Powder", "Feeding Bottle", "Sippy Cup", "Pacifier", "Baby Food", "Baby Clothing", "Kids Toy", "Kids Stationery", "Kids Shoe", "Baby Monitor", "Stroller Accessory"], required: true, section: SEC_ATTRIBUTES },
    { key: "size", label: "Size", type: "text", placeholder: "e.g. NB/S/M/L or UK 2", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Diaper", "Baby Clothing", "Kids Shoe"] } },
    { key: "count", label: "Count Per Pack", type: "number", required: false, section: SEC_STOCK, visibleWhen: { key: "productType", values: ["Diaper", "Baby Wipes"] } },
    { key: "volumeMl", label: "Volume (ml)", type: "number", unit: "ml", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Baby Lotion", "Baby Oil", "Baby Shampoo", "Baby Powder"] } },
    { key: "material", label: "Material", type: "text", placeholder: "e.g. 100% cotton, BPA-free plastic", required: false, section: SEC_PHYSICAL },
    { key: "hypoallergenic", label: "Hypoallergenic", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "pediatricianApproved", label: "Pediatrician Approved", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "bpaFree", label: "BPA Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "phthalateFree", label: "Phthalate Free", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "color", label: "Color", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "safetyCertification", label: "Safety Certification", type: "multiselect", options: ["BIS", "CE", "ASTM", "EN71", "ISO"], required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: false, section: SEC_COMPLIANCE, visibleWhen: { key: "productType", values: ["Baby Food", "Baby Lotion", "Baby Wipes"] } }
  ],
  "sports-fitness": [
    { key: "sportType", label: "Sport Category", type: "select", options: ["Cricket", "Football", "Badminton", "Tennis", "Basketball", "Volleyball", "Swimming", "Yoga", "Gym", "Cycling", "Running", "Boxing", "Martial Arts", "Table Tennis", "General Fitness"], required: true, section: SEC_ATTRIBUTES },
    { key: "productType", label: "Product Type", type: "select", options: ["Ball", "Bat", "Racket", "Net", "Mat", "Dumbbell", "Barbell", "Resistance Band", "Gloves", "Shoes", "Clothing", "Water Bottle", "Bag", "Helmet", "Knee Guard", "Elbow Guard", "Jump Rope", "Skipping Rope", "Treadmill", "Cycle"], required: true, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "text", placeholder: "e.g. Leather, Rubber, Aluminium, Foam", required: true, section: SEC_PHYSICAL },
    { key: "weight", label: "Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Dumbbell", "Barbell"] } },
    { key: "dimensions", label: "Dimensions/Size", type: "text", placeholder: "e.g. 68cm circumference for football", required: false, section: SEC_PHYSICAL },
    { key: "color", label: "Color", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "warranty", label: "Warranty", type: "select", options: ["No Warranty", "3 Months", "6 Months", "1 Year", "2 Years"], required: true, section: SEC_COMPLIANCE },
    { key: "certification", label: "Certification", type: "multiselect", options: ["BIS", "ISI", "FIFA Approved", "BWF Approved", "ITF Approved", "FIBA Approved"], required: false, section: SEC_COMPLIANCE },
    { key: "unitsPerCarton", label: "Units Per Carton", type: "number", required: true, section: SEC_STOCK }
  ],
  "toys-games": [
    { key: "ageGroup", label: "Age Group", type: "select", options: ["0-2 Years", "3-5 Years", "6-8 Years", "9-12 Years", "13+ Years", "All Ages"], required: true, section: SEC_ATTRIBUTES },
    { key: "toyType", label: "Toy Type", type: "select", options: ["Action Figure", "Doll", "Vehicle", "Building Blocks", "Puzzle", "Board Game", "Card Game", "Educational Toy", "Remote Control", "Stuffed Animal", "Musical Toy", "Outdoor Toy", "Art & Craft", "Science Kit", "Role Play"], required: true, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "select", options: ["Plastic", "Wood", "Fabric", "Metal", "Foam", "Rubber", "Cardboard"], required: true, section: SEC_PHYSICAL },
    { key: "playerCount", label: "Player Count", type: "text", placeholder: "e.g. 2-4 players", required: false, section: SEC_ATTRIBUTES },
    { key: "piecesCount", label: "Number of Pieces", type: "number", required: false, section: SEC_PHYSICAL },
    { key: "batteryRequired", label: "Battery Required", type: "boolean", required: false, section: SEC_TECH },
    { key: "batteryType", label: "Battery Type", type: "text", placeholder: "e.g. AA x 3", required: false, section: SEC_TECH, visibleWhen: { key: "batteryRequired", value: true } },
    { key: "color", label: "Color", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "safetyCertification", label: "Safety Certification", type: "multiselect", options: ["BIS", "CE", "ASTM", "EN71", "ISO 8124"], required: false, section: SEC_COMPLIANCE },
    { key: "minimumAge", label: "Minimum Age (Years)", type: "number", required: true, section: SEC_COMPLIANCE },
    { key: "chokingHazardWarning", label: "Choking Hazard Warning", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "unitsPerCarton", label: "Units Per Carton", type: "number", required: true, section: SEC_STOCK }
  ],
  "hardware-tools": [
    { key: "toolType", label: "Tool Type", type: "select", options: ["Hand Tool", "Power Tool", "Measuring Tool", "Cutting Tool", "Fastener", "Electrical Fitting", "Plumbing", "Paint & Brush", "Lock & Security", "Safety Equipment"], required: true, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "select", options: ["Steel", "Stainless Steel", "Aluminium", "Plastic", "Wood", "Rubber", "Composite"], required: true, section: SEC_PHYSICAL },
    { key: "powerSource", label: "Power Source", type: "select", options: ["Manual", "Electric-Corded", "Electric-Cordless", "Battery", "Pneumatic"], required: false, section: SEC_TECH, visibleWhen: { key: "toolType", value: "Power Tool" } },
    { key: "voltage", label: "Voltage", type: "select", options: ["110V", "220V", "12V", "18V", "20V"], required: false, section: SEC_TECH, visibleWhen: { key: "powerSource", values: ["Electric-Corded", "Electric-Cordless", "Battery"] } },
    { key: "wattage", label: "Wattage (W)", type: "number", unit: "W", required: false, section: SEC_TECH, visibleWhen: { key: "powerSource", values: ["Electric-Corded", "Electric-Cordless"] } },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 25cm length, 6mm drill bit", required: false, section: SEC_PHYSICAL },
    { key: "weight", label: "Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL },
    { key: "color", label: "Color", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "warranty", label: "Warranty", type: "select", options: ["No Warranty", "3 Months", "6 Months", "1 Year", "2 Years", "5 Years"], required: true, section: SEC_COMPLIANCE },
    { key: "certification", label: "Certification", type: "multiselect", options: ["BIS", "ISI", "CE", "ISO"], required: false, section: SEC_COMPLIANCE },
    { key: "unitsPerBox", label: "Units Per Box/Carton", type: "number", required: true, section: SEC_STOCK },
    { key: "setContents", label: "Set Contents", type: "text", placeholder: "e.g. 10-piece screwdriver set contents", required: false, section: SEC_OTHER }
  ],
  "pet-supplies": [
    { key: "petType", label: "Target Pet", type: "select", options: ["Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Reptile", "General"], required: true, section: SEC_ATTRIBUTES },
    { key: "productType", label: "Product Type", type: "select", options: ["Dry Food", "Wet Food", "Treats", "Supplement", "Collar", "Leash", "Harness", "Bed", "Cage", "Aquarium", "Bowl", "Grooming", "Shampoo", "Litter", "Toy", "Clothing"], required: true, section: SEC_ATTRIBUTES },
    { key: "breed", label: "Suitable Breed", type: "text", placeholder: "e.g. All breeds, Small breeds, Large breeds", required: false, section: SEC_ATTRIBUTES },
    { key: "ageGroup", label: "Age Group", type: "select", options: ["Puppy", "Kitten", "Junior", "Adult", "Senior", "All Ages"], required: true, section: SEC_ATTRIBUTES },
    { key: "flavorOrVariant", label: "Flavor/Variant", type: "text", placeholder: "e.g. Chicken, Salmon, Beef", required: false, section: SEC_ATTRIBUTES },
    { key: "weightKg", label: "Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Dry Food", "Wet Food", "Treats", "Litter"] } },
    { key: "volumeMl", label: "Volume (ml)", type: "number", unit: "ml", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Shampoo", "Supplement", "Grooming"] } },
    { key: "material", label: "Material", type: "text", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Collar", "Leash", "Bed", "Toy", "Clothing", "Cage", "Bowl"] } },
    { key: "size", label: "Size", type: "select", options: ["XS", "S", "M", "L", "XL", "XXL", "Free Size"], required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Collar", "Harness", "Clothing", "Bed"] } },
    { key: "veterinarianApproved", label: "Veterinarian Approved", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "naturalOrganic", label: "Natural/Organic", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "grainFree", label: "Grain Free", type: "boolean", required: false, section: SEC_ATTRIBUTES, visibleWhen: { key: "productType", values: ["Dry Food", "Wet Food", "Treats"] } },
    { key: "unitsPerCarton", label: "Units Per Carton", type: "number", required: true, section: SEC_STOCK }
  ],
  "festive-seasonal": [
    { key: "festival", label: "Festival/Occasion", type: "select", options: ["Dashain", "Tihar", "Chhath", "Holi", "Christmas", "Eid", "New Year", "Wedding", "General"], required: true, section: SEC_ATTRIBUTES },
    { key: "productType", label: "Product Type", type: "select", options: ["Decoration", "Puja Item", "Candle", "Diyo", "Gift Box", "Greeting Card", "Rangoli", "Garland", "Toran", "Kalash", "Sindoor", "Tika", "Marigold Mala", "Firework", "Party Supply", "Wrapping"], required: true, section: SEC_ATTRIBUTES },
    { key: "material", label: "Material", type: "text", placeholder: "e.g. Clay, Metal, Paper, Fabric", required: true, section: SEC_PHYSICAL },
    { key: "color", label: "Color Theme", type: "colorpicker", required: false, section: SEC_PHYSICAL },
    { key: "dimensions", label: "Dimensions", type: "text", placeholder: "e.g. 15cm height, A4 size", required: false, section: SEC_PHYSICAL },
    { key: "setCount", label: "Items in Set", type: "number", required: false, section: SEC_STOCK },
    { key: "handmade", label: "Handmade", type: "boolean", required: false, section: SEC_ATTRIBUTES },
    { key: "ecoFriendly", label: "Eco-Friendly", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "unitsPerCarton", label: "Units Per Wholesale Carton", type: "number", required: true, section: SEC_STOCK },
    { key: "seasonalAvailability", label: "Seasonal Availability", type: "select", options: ["Year Round", "Dashain Season", "Tihar Season", "Winter", "Spring", "Festival Specific"], required: true, section: SEC_STOCK }
  ],
  "agriscience-farming": [
    { key: "productType", label: "Product Type", type: "select", options: ["Seed", "Fertilizer", "Pesticide", "Herbicide", "Fungicide", "Farming Tool", "Irrigation", "Animal Feed", "Poultry Supply", "Soil Amendment", "Plant Growth Regulator", "Greenhouse Supply"], required: true, section: SEC_ATTRIBUTES },
    { key: "cropType", label: "Target Crop/Plant", type: "multiselect", options: ["Rice", "Wheat", "Maize", "Potato", "Tomato", "Vegetable", "Fruit", "Flower", "Tea", "Coffee", "General"], required: true, section: SEC_ATTRIBUTES },
    { key: "formulation", label: "Formulation", type: "select", options: ["Granule", "Powder", "Liquid", "Soluble", "Emulsion", "Wettable Powder", "Seed Treatment"], required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Fertilizer", "Pesticide", "Herbicide", "Fungicide"] } },
    { key: "weightKg", label: "Weight (kg)", type: "number", unit: "kg", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "productType", values: ["Seed", "Fertilizer", "Pesticide", "Animal Feed", "Soil Amendment"] } },
    { key: "volumeLitre", label: "Volume (Litre)", type: "number", unit: "L", required: false, section: SEC_PHYSICAL, visibleWhen: { key: "formulation", values: ["Liquid", "Emulsion"] } },
    { key: "applicationMethod", label: "Application Method", type: "text", placeholder: "e.g. Foliar spray, Soil drench, Broadcasting", required: false, section: SEC_TECH },
    { key: "activeIngredient", label: "Active Ingredient", type: "text", placeholder: "e.g. Urea 46%, Chlorpyrifos 20%", required: false, section: SEC_TECH },
    { key: "registrationNumber", label: "Registration No.", type: "text", placeholder: "Nepal Pesticide Registration No.", required: false, section: SEC_COMPLIANCE },
    { key: "organicCertified", label: "Organic Certified", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "governmentApproved", label: "Government Approved", type: "boolean", required: false, section: SEC_COMPLIANCE },
    { key: "shelfLifeMonths", label: "Shelf Life (Months)", type: "number", required: false, section: SEC_COMPLIANCE },
    { key: "storageCondition", label: "Storage Condition", type: "select", options: ["Cool Dry Place", "Room Temperature", "Refrigerate", "Away from Direct Sunlight"], required: true, section: SEC_COMPLIANCE }
  ]
};

// Helper: Get attributes by exact or fuzzy slug
export const getAttributesForCategory = (categorySlug) => {
  if (!categorySlug) return [];
  // Try exact match
  if (CATEGORY_ATTRIBUTES[categorySlug]) {
    return CATEGORY_ATTRIBUTES[categorySlug];
  }
  // Try finding by slug component
  const search = categorySlug.toLowerCase();
  for (const [slug, attrs] of Object.entries(CATEGORY_ATTRIBUTES)) {
    if (slug.includes(search) || search.includes(slug)) {
      return attrs;
    }
  }
  return [];
};

// Helper: Sort units pushing recommended ones to the top
export const getRecommendedUnits = (categorySlug, allUnitsFromDB) => {
  if (!allUnitsFromDB || allUnitsFromDB.length === 0) return [];
  
  const hints = CATEGORY_UNIT_HINTS[categorySlug] || [];
  
  // Create a deep copy
  const sorted = [...allUnitsFromDB];
  
  sorted.sort((a, b) => {
    const aName = typeof a === 'string' ? a : a.name;
    const bName = typeof b === 'string' ? b : b.name;
    
    const aHintIdx = hints.indexOf(aName);
    const bHintIdx = hints.indexOf(bName);
    
    // Both are explicitly hints
    if (aHintIdx !== -1 && bHintIdx !== -1) {
      return aHintIdx - bHintIdx;
    }
    
    // a is hint, b is not
    if (aHintIdx !== -1) return -1;
    // b is hint, a is not
    if (bHintIdx !== -1) return 1;
    
    // Neither are hints, sort alphabetically
    return aName.localeCompare(bName);
  });
  
  return sorted;
};

```

## 10. paymentController.js

### initiateKhaltiPayment
```javascript
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
}
```

### verifyKhaltiPayment
```javascript
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
}
```

## 11. JWT Payload Structure

Based on `authController.js`, the token payload looks like this:
```javascript
const token = jwt.sign(
  {
    id: user._id,
    role: user.role,
    verified: user.verified
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```
- **Fields Signed**: `id`, `role`, and `verified` status.
- **Expiry**: Set to `7d` (7 days).

## 12. productController.js - getProducts

```javascript
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("unit", "name")
      .populate("wholesaler", "firstName lastName companyName verified email")
      .sort({ createdAt: -1 });

    const prepared = products.map((product) => ({
      ...product.toObject(),
      priceInfo: product.getPriceForUser(req.user),
    }));

    res.json(prepared);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
}
```

## 13. VerificationQueue.jsx - ScoreGauge Component

```javascript
const ScoreGauge = ({ score }
```

## 14. Socket.IO Rooms Strategy

The system relies on explicit `conversationId` rooms to route messages. When a user opens a chat drawer, they join a room named after the specific conversation ID.

### Server-side Implementation (from `app.js`)
```javascript
socket.on('join_conversation', (conversationId) => socket.join(conversationId));
socket.on('leave_conversation', (conversationId) => socket.leave(conversationId));
```
Typing events and read receipts are sent to the `conversationId` room via `socket.to(convId).emit(...)` ensuring only participants in that specific chat window receive real-time updates. Real-time notifications of new messages are broadcast globally but handled client-side depending on active chats.

## 15. Environment Variables

### Backend `.env` Variables
- `PORT`: The port the Express server runs on (e.g., 5000).
- `MONGO_URI`: Connection string for the MongoDB instance.
- `JWT_SECRET`: High-entropy key used to sign and verify JSON Web Tokens.
- `ANTHROPIC_API_KEY`: Claude API credentials for the AI-powered KYC identity checks and marketplace chatbot.
- `RESEND_API_KEY` / `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS`: Credentials for dispatching OTP verifications, order confirmations, and status updates via email.
- `FRONTEND_URL`: Localhost (e.g., `http://localhost:5173`) used in CORS configuration to restrict origin access.
- `KHALTI_PUBLIC_KEY` & `KHALTI_SECRET_KEY`: API keys generated from Khalti Merchant Dashboard for checkout initialisation and verification.
### Frontend `.env` Variables
- `VITE_API_URL`: Base URL for the backend API endpoints.
- `VITE_SOCKET_URL`: Base URL for the WebSocket connection.
