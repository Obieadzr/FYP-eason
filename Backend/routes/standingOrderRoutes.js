import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { 
  createStandingOrder, 
  getMyStandingOrders, 
  updateStandingOrderStatus 
} from "../controllers/standingOrderController.js";

const router = express.Router();

router.post("/", authMiddleware, createStandingOrder);
router.get("/my", authMiddleware, getMyStandingOrders);
router.put("/:id/status", authMiddleware, updateStandingOrderStatus);

export default router;
