// controllers/productController.js
import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { name, category, unit, price, stock, description } = req.body;

    if (!name || !category || !unit || !price) {
      return res.status(400).json({ message: "Name, category, unit and price are required" });
    }

    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    const product = await Product.create({
      name,
      category,
      unit,
      price,
      stock: stock || 0,
      description: description || "",
      image: imagePath,
    });

    const populated = await Product.findById(product._id)
      .populate("category", "name")
      .populate("unit", "name");

    res.status(201).json(populated);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, category, unit, price, stock, description } = req.body;

    const updateData = {
      name,
      category,
      unit,
      price,
      stock: stock || 0,
      description: description || "",
    };

    // Only update image if a new file was uploaded
    if (req.file) {
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
    res.status(500).json({ message: "Server error" });
  }
};

// getProducts, getProduct, deleteProduct → remain unchanged
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("unit", "name")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("unit", "name");

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};