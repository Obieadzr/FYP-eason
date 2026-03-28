import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as chatController from '../controllers/chatController.js';

// Setup basic chat upload middleware
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const uploadDir = 'uploads/chat';
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/chat/"),
  filename: (req, file, cb) => {
    const userId = req.user?.id || req.user?._id || "unknown";
    cb(null, `chat-${userId}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const chatUpload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = express.Router();

router.post('/start', authMiddleware, chatController.getOrCreateConversation);
router.get('/my', authMiddleware, chatController.getMyConversations);
router.get('/:conversationId/messages', authMiddleware, chatController.getMessages);
router.post('/:conversationId/messages', authMiddleware, chatController.sendMessage);
router.post('/:conversationId/read', authMiddleware, chatController.markRead);
router.post('/upload', authMiddleware, chatUpload.array('attachments', 5), chatController.uploadAttachment);

export default router;
