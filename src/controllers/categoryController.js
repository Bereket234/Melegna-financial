import { validationResult } from "express-validator";
import Category from "../models/Category.js";

export async function createCategory(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, description } = req.body;
    const exists = await Category.findOne({ user: req.user._id, name });
    if (exists)
      return res.status(409).json({ message: "Category already exists" });
    const cat = await Category.create({
      name,
      description,
      user: req.user._id,
    });
    return res.status(201).json(cat);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listCategories(req, res) {
  try {
    const cats = await Category.find({ user: req.user._id }).sort({ name: 1 });
    return res.json(cats);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updated = await Category.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { $set: { name, description } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Category.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
