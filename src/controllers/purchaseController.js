import mongoose from "mongoose";
import { validationResult } from "express-validator";
import Purchase from "../models/Purchase.js";
import Item from "../models/Item.js";
import Category from "../models/Category.js";
import Unit from "../models/Unit.js";
import Balance from "../models/Balance.js";

export async function createPurchase(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const {
      itemId,
      unitId,
      quantity,
      unitPrice,
      purchasedAt,
      merchant,
      notes,
    } = req.body;

    const item = await Item.findOne({ _id: itemId, user: req.user._id })
      .populate("category")
      .populate("defaultUnit");
    if (!item) return res.status(400).json({ message: "Invalid item" });

    const [unit, category] = await Promise.all([
      Unit.findOne({ _id: unitId, user: req.user._id }),
      Category.findOne({ _id: item.category._id, user: req.user._id }),
    ]);
    if (!unit) return res.status(400).json({ message: "Invalid unit" });
    if (!category) return res.status(400).json({ message: "Invalid category" });

    const totalPrice = Number(quantity) * Number(unitPrice);

    const purchase = await Purchase.create({
      user: req.user._id,
      category: category._id,
      item: item._id,
      unit: unit._id,
      quantity,
      unitPrice,
      totalPrice,
      purchasedAt: new Date(purchasedAt),
      merchant,
      notes,
    });

    // Update balance - add to totalSpent
    await updateBalanceOnPurchase(req.user._id);

    return res.status(201).json(purchase);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function listPurchases(req, res) {
  try {
    console.log(new Date());
    const { from, to, categoryId, itemId } = req.query;
    const filter = { user: req.user._id };
    if (from || to) {
      filter.purchasedAt = {};
      if (from) filter.purchasedAt.$gte = new Date(from);
      if (to) filter.purchasedAt.$lte = new Date(to);
    }
    if (categoryId) filter.category = categoryId;
    if (itemId) filter.item = itemId;
    const purchases = await Purchase.find(filter)
      .populate("category")
      .populate("item")
      .populate("unit")
      .sort({ purchasedAt: -1 });
    return res.json(purchases);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updatePurchase(req, res) {
  try {
    const { id } = req.params;
    const { quantity, unitPrice, purchasedAt, merchant, notes } = req.body;
    const totalPrice = Number(quantity) * Number(unitPrice);
    const purchase = await Purchase.findOneAndUpdate(
      { _id: id, user: req.user._id },
      { quantity, unitPrice, totalPrice, purchasedAt, merchant, notes },
      { new: true }
    );
    if (!purchase) return res.status(404).json({ message: "Not found" });

    // Recalculate balance after update
    await updateBalanceOnPurchase(req.user._id);

    return res.json(purchase);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function deletePurchase(req, res) {
  try {
    const { id } = req.params;
    const purchase = await Purchase.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });
    if (!purchase) return res.status(404).json({ message: "Not found" });

    // Recalculate balance after deletion
    await updateBalanceOnPurchase(req.user._id);

    return res.json(purchase);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * Helper function to update balance based on all purchases
 * Recalculates totalSpent from all purchases
 */
async function updateBalanceOnPurchase(userId) {
  try {
    // Calculate total spent from all purchases
    const result = await Purchase.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);

    const totalSpent = result.length > 0 ? result[0].total : 0;
    const existingBalance = await Balance.findOne({ user: userId });
    // Update balance
    await Balance.findOneAndUpdate(
      { user: userId },
      { $set: { totalSpent, availableBalance: existingBalance.allTimeTotalIncome - totalSpent } },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error updating balance:", error);
    // Don't throw - balance update failure shouldn't break purchase operations
  }
}
