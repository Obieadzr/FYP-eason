import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import * as quoteController from '../controllers/quoteController.js';

const router = express.Router();

router.post('/', authMiddleware, quoteController.createQuoteRequest);
router.get('/', authMiddleware, quoteController.getMyQuotes);
router.post('/:quoteId/respond', authMiddleware, quoteController.respondToQuote);

export default router;
