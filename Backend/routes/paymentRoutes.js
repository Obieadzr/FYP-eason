import express from "express";
import { initiateKhaltiPayment, verifyKhaltiPayment } from "../controllers/paymentController.js";
import { authMiddleware } from "../middleware/auth.js";
import Wallet from "../models/Wallet.js";

const router = express.Router();

router.post("/khalti/initiate", authMiddleware, initiateKhaltiPayment);
router.post("/khalti/verify", authMiddleware, verifyKhaltiPayment);

// GET /api/payment/wallet - Fetch wholesaler wallet
router.get("/wallet", authMiddleware, async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user.id });
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user.id, balance: 0, totalEarned: 0, transactions: [] });
    }
    res.json({ success: true, wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch wallet" });
  }
});

// POST /api/payment/wallet/withdraw - Request payout
router.post("/wallet/withdraw", authMiddleware, async (req, res) => {
  try {
    const { amount, method, account } = req.body;
    
    const wallet = await Wallet.findOneAndUpdate(
      { user: req.user.id, balance: { $gte: amount } },
      { 
        $inc: { balance: -amount },
        $push: { 
          transactions: { 
            amount: -amount, 
            type: "withdrawal", 
            status: "pending", 
            description: `Withdrawal request to ${method} (${account})` 
          } 
        } 
      },
      { new: true }
    );

    if (!wallet) {
      return res.status(400).json({ success: false, message: "Insufficient balance" });
    }
    
    res.json({ success: true, message: "Withdrawal request submitted! Funds will arrive in 24 hours.", wallet });
  } catch (err) {
    res.status(500).json({ success: false, message: "Withdrawal failed" });
  }
});

export default router;
