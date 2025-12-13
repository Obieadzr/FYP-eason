// backend/routes/productRoutes.js
import express from "express";
import upload from "../models/upload.js"; // ← MUST BE THIS
import {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "./productController.js";

const router = express.Router();

router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);

router.get("/", getProducts);
router.get("/:id", getProduct);
router.delete("/:id", deleteProduct);

export default router;