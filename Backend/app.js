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