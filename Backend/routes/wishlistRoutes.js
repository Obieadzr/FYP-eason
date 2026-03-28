import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as wishlistController from '../controllers/wishlistController.js';

const router = express.Router();

router.post('/toggle', authMiddleware, wishlistController.toggleWishlist);
router.get('/', authMiddleware, wishlistController.getWishlist);

export default router;
