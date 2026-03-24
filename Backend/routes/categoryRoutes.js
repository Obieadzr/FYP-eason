import express from 'express';
import { authMiddleware } from "../middleware/auth.js";
import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} from "../controllers/categoryController.js"

const router = express.Router();

// Public reads — admins/wholesalers need to read categories when building products
router.get("/", getCategories);

// Write operations require authentication (admin only in practice)
router.post("/", authMiddleware, createCategory);
router.put("/:id", authMiddleware, updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);

export default router;