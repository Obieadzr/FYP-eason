import Unit from "../models/Unit.js";

export const createUnit = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Unit name is required and must be a string" });
    }
    const exists = await Unit.findOne({ name });
    if (exists) return res.status(400).json({ message: "Unit already exists" });
    const unit = await Unit.create({ name });
    res.status(201).json(unit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUnits = async (req, res) => {
  try {
    const units = await Unit.find().sort({ createdAt: -1 });
    res.json(units);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUnit = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Unit name is required and must be a string" });
    }
    const updated = await Unit.findByIdAndUpdate(req.params.id, { name }, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUnit = async (req, res) => {
  try {
    await Unit.findByIdAndDelete(req.params.id);
    res.json({ message: "Unit deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
