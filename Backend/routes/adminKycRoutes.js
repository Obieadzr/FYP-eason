import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as kycController from '../controllers/kycController.js';

const router = express.Router();

// Middleware to ensure admin role
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

router.get('/queue', authMiddleware, adminOnly, kycController.getKycQueue);
router.post('/:userId/ai-check', authMiddleware, adminOnly, kycController.runAiCheck);
router.post('/:userId/approve', authMiddleware, adminOnly, kycController.approveKyc);
router.post('/:userId/reject', authMiddleware, adminOnly, kycController.rejectKyc);
router.get('/:userId/documents', authMiddleware, adminOnly, kycController.streamDocument);

export default router;
