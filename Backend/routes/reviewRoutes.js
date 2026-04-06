import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { createReview, getProductReviews } from "../controllers/reviewController.js";

const router = express.Router();

router.post("/:productId", authMiddleware, createReview);
router.get("/:productId", getProductReviews);

export default router;
