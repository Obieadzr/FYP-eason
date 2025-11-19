import Category from "../models/Category.js";
import slugify from "slugify";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Category name is required and must be a string" });
    }
    const slug = slugify(name);
    const exists = await Category.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }
    const category = await Category.create({ name, slug });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const { id } = req.params;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Category name is required and must be a string" });
    }
    const slug = slugify(name);
    const updated = await Category.findByIdAndUpdate(id, { name, slug }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "category deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
