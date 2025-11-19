import Product from "../models/Product.js";

export const createProduct = async (req, res) => {
  try {
    const { name, category, unit, price, stock, description } = req.body;
    if (!name || !category || !unit || !price) {
      return res.status(400).json({ message: "Name, category, unit, and price are required" });
    }
    const product = await Product.create({ name, category, unit, price, stock, description });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("unit", "name")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("unit", "name");
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, category, unit, price, stock, description } = req.body;
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, unit, price, stock, description },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
