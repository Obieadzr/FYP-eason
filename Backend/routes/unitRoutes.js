import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import {
  createUnit,
  getUnits,
  updateUnit,
  deleteUnit,
} from "../controllers/unitController.js"

const router = express.Router();

// Public reads
router.get("/", getUnits);

// Write operations require authentication
router.post("/", authMiddleware, createUnit);
router.put("/:id", authMiddleware, updateUnit);
router.delete("/:id", authMiddleware, deleteUnit);

export default router;
