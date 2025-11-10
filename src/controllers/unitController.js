import { validationResult } from "express-validator";
import Unit from "../models/Unit.js";

export async function createUnit(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, symbol, family, baseUnit, toBaseFactor } = req.body;
    const exists = await Unit.findOne({ user: req.user._id, family, symbol });
    if (exists) return res.status(409).json({ message: "Unit already exists" });
    const unit = await Unit.create({
      name,
      symbol,
      family,
      baseUnit,
      toBaseFactor,
      user: req.user._id,
    });
    return res.status(201).json(unit);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listUnits(req, res) {
  try {
    const units = await Unit.find({ user: req.user._id }).sort({
      family: 1,
      name: 1,
    });
    return res.json(units);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateUnit(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { id } = req.params;
    const { name, symbol, family, baseUnit, toBaseFactor } = req.body;
    const unit = await Unit.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { name, symbol, family, baseUnit, toBaseFactor },
      { new: true }
    );
    return res.json(unit);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteUnit(req, res) {
  try {
    const { id } = req.params;
    const unit = await Unit.findOneAndDelete({ _id: id, user: req.user._id });
    return res.json(unit);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
