// backend/routes/productRoutes.js
import express from "express";
import jwt from "jsonwebtoken";
import upload from "../models/upload.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getMyProducts
} from "../controllers/productController.js";

const router = express.Router();

// Soft auth — attaches user if token present, does NOT block if token missing/expired
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch (_) {
    // Invalid/expired token — proceed without user, controller can still save product
    req.user = null;
  }
  next();
};

router.post("/", optionalAuth, upload.array("images", 20), createProduct);
router.put("/:id", optionalAuth, upload.array("images", 20), updateProduct);

router.get("/my", authMiddleware, getMyProducts);
router.get("/", getProducts);
router.get("/:id", getProduct);
router.delete("/:id", authMiddleware, deleteProduct);

export default router;