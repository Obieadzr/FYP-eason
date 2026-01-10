// backend/controllers/productController.js
import Product from "../models/Product.js"; // ← correct default import
import path from "path";
import fs from "fs/promises";

export const createProduct = async (req, res) => {
  try {
    const { name, category, unit, baseCost, wholesalerPrice, stock, description } = req.body;

    if (!name || !category || !unit || !baseCost || !wholesalerPrice) {
      return res.status(400).json({
        message: "Name, category, unit, baseCost, and wholesalerPrice are required",
      });
    }

    const baseCostNum = Number(baseCost);
    const wholesalerPriceNum = Number(wholesalerPrice);

    if (isNaN(baseCostNum) || isNaN(wholesalerPriceNum)) {
      return res.status(400).json({ message: "Base cost and wholesaler price must be valid numbers" });
    }

    if (wholesalerPriceNum < baseCostNum) {
      return res.status(400).json({
        message: "Wholesaler price cannot be less than base cost",
      });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await Product.create({
      name: name.trim(),
      category,
      unit,
      baseCost: baseCostNum,
      wholesalerPrice: wholesalerPriceNum,
      stock: Number(stock) || 0,
      description: description?.trim() || "",
      image: imagePath,
    });

    const populated = await Product.findById(product._id)
      .populate("category", "name")
      .populate("unit", "name");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, category, unit, baseCost, wholesalerPrice, stock, description } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (category) updateData.category = category;
    if (unit) updateData.unit = unit;
    if (stock !== undefined) updateData.stock = Number(stock) || 0;
    if (description !== undefined) updateData.description = description.trim() || "";

    // Handle price updates
    if (baseCost !== undefined || wholesalerPrice !== undefined) {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });

      const newBaseCost = baseCost !== undefined ? Number(baseCost) : product.baseCost;
      const newWholesalerPrice = wholesalerPrice !== undefined ? Number(wholesalerPrice) : product.wholesalerPrice;

      if (isNaN(newBaseCost) || isNaN(newWholesalerPrice)) {
        return res.status(400).json({ message: "Invalid number format for prices" });
      }

      if (newWholesalerPrice < newBaseCost) {
        return res.status(400).json({
          message: "Wholesaler price cannot be less than base cost",
        });
      }

      updateData.baseCost = newBaseCost;
      updateData.wholesalerPrice = newWholesalerPrice;
    }

    // Image handling
    if (req.file) {
      // Delete old image if exists (safe even if product is not yet loaded)
      const product = await Product.findById(req.params.id);
      if (product?.image) {
        const oldPath = path.join(__dirname, "..", product.image);
        try {
          await fs.unlink(oldPath);
        } catch (err) {
          console.warn("Old image delete failed:", err.message);
        }
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name")
      .populate("unit", "name");

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("unit", "name")
      .sort({ createdAt: -1 });

    const prepared = products.map((product) => ({
      ...product.toObject(),
      priceInfo: product.getPriceForUser(req.user),
    }));

    res.json(prepared);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("unit", "name");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      ...product.toObject(),
      priceInfo: product.getPriceForUser(req.user),
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.image) {
      const imagePath = path.join(__dirname, "..", product.image);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.warn("Image delete failed:", err.message);
      }
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};