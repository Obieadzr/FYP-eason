// backend/controllers/productController.js
import Product from "../models/Product.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs/promises";

// ESM-compatible __dirname (same pattern as app.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const createProduct = async (req, res) => {
  console.log("[createProduct] Request received. Files:", req.files?.length ?? 0, "Body keys:", Object.keys(req.body || {}));
  try {
    const { name, category, unit, baseCost, wholesalerPrice, stock, description, attributes, bulkPricing } = req.body;

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
      return res.status(400).json({ message: "Wholesaler price cannot be less than base cost" });
    }

    const imagePaths = (req.files || []).map(file => `/uploads/${file.filename}`);

    console.log("[createProduct] Saving to DB...");
    
    let parsedAttributes = {};
    if (attributes) {
      try {
        parsedAttributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
      } catch (e) {
        console.error("Failed to parse attributes JSON");
      }
    }

    let parsedBulkPricing = [];
    if (bulkPricing) {
      try {
        parsedBulkPricing = typeof bulkPricing === 'string' ? JSON.parse(bulkPricing) : bulkPricing;
      } catch (e) {
        console.error("Failed to parse bulkPricing JSON");
      }
    }

    const product = await Product.create({
      wholesaler: req.user?.id || req.user?._id || null,
      name: name.trim(),
      category,
      unit,
      baseCost: baseCostNum,
      wholesalerPrice: wholesalerPriceNum,
      stock: Number(stock) || 0,
      description: description?.trim() || "",
      attributes: parsedAttributes,
      bulkPricing: parsedBulkPricing,
      image: imagePaths[0] || null,
      images: imagePaths,
    });

    console.log("[createProduct] Saved! ID:", product._id.toString());
    // Return directly without populate to avoid extra DB roundtrip
    res.status(201).json(product);
  } catch (error) {
    console.error("[createProduct] Error:", error.message);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, category, unit, baseCost, wholesalerPrice, stock, description, attributes, bulkPricing } = req.body;

    const updateData = {};

    if (name !== undefined) updateData.name = name.trim();
    if (category) updateData.category = category;
    if (unit) updateData.unit = unit;
    if (stock !== undefined) updateData.stock = Number(stock) || 0;
    if (description !== undefined) updateData.description = description.trim() || "";
    if (attributes !== undefined) {
      try {
        updateData.attributes = typeof attributes === 'string' ? JSON.parse(attributes) : attributes;
      } catch (e) {
        console.error("Failed to parse attributes JSON in update");
      }
    }
    
    if (bulkPricing !== undefined) {
      try {
        updateData.bulkPricing = typeof bulkPricing === 'string' ? JSON.parse(bulkPricing) : bulkPricing;
      } catch (e) {
        console.error("Failed to parse bulkPricing JSON in update");
      }
    }

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
    // Image handling - replacing all images with new ones if new files are uploaded
    if (req.files && req.files.length > 0) {
      const product = await Product.findById(req.params.id);
      if (product) {
        // Delete all old images if they exist
        const allOldImages = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
        for (const oldImg of allOldImages) {
          const oldPath = path.join(__dirname, "..", oldImg);
          try {
            await fs.unlink(oldPath);
          } catch (err) {
            console.warn("Old image delete failed:", err.message);
          }
        }
      }
      const newPaths = req.files.map(file => `/uploads/${file.filename}`);
      updateData.image = newPaths[0];
      updateData.images = newPaths;
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

export const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ wholesaler: req.user.id })
      .populate("category", "name")
      .populate("unit", "name")
      .sort({ createdAt: -1 });

    const prepared = products.map((product) => ({
      ...product.toObject(),
      priceInfo: product.getPriceForUser(req.user),
    }));

    res.json(prepared);
  } catch (error) {
    console.error("Get my products error:", error);
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