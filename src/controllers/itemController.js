import { validationResult } from "express-validator";
import Item from "../models/Item.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";

export async function createItem(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, description, categoryId, defaultUnitId } = req.body;
    const [category, unit] = await Promise.all([
      Category.findOne({ _id: categoryId, user: req.user._id }),
      Unit.findOne({ _id: defaultUnitId, user: req.user._id }),
    ]);
    if (!category) return res.status(400).json({ message: "Invalid category" });
    if (!unit) return res.status(400).json({ message: "Invalid unit" });
    const exists = await Item.findOne({
      user: req.user._id,
      category: category._id,
      name,
    });
    if (exists) return res.status(409).json({ message: "Item already exists" });
    const item = await Item.create({
      name,
      description,
      category: category._id,
      defaultUnit: unit._id,
      user: req.user._id,
    });
    return res.status(201).json(item);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listItems(req, res) {
  try {
    const { categoryId } = req.query;
    const filter = { user: req.user._id };
    if (categoryId) filter.category = categoryId;
    const items = await Item.find(filter)
      .populate("category")
      .populate("defaultUnit")
      .sort({ name: 1 });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { name, description, categoryId, defaultUnitId } = req.body;
    const [category, unit] = await Promise.all([
      Category.findOne({ _id: categoryId, user: req.user._id }),
      Unit.findOne({ _id: defaultUnitId, user: req.user._id }),
    ]);
    if (!category) return res.status(400).json({ message: "Invalid category" });
    if (!unit) return res.status(400).json({ message: "Invalid unit" });
    const updated = await Item.findOneAndUpdate(
      { _id: id, user: req.user._id },
      {
        $set: {
          name,
          description,
          category: category._id,
          defaultUnit: unit._id,
        },
      },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Item.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
    if (!deleted) return res.status(404).json({ message: "Not found" });
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
