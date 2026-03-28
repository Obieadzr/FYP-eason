import express from 'express';
import { kycUpload } from '../middleware/kycUpload.js';
import { authMiddleware } from '../middleware/auth.js';
import * as kycController from '../controllers/kycController.js';

const router = express.Router();

// Wholesaler Routes
router.post('/submit', authMiddleware, kycUpload.fields([
  { name: 'panDocument', maxCount: 1 },
  { name: 'businessLicense', maxCount: 1 }
]), kycController.submitKyc);

router.get('/status', authMiddleware, kycController.getKycStatus);

// Export router
export default router;
