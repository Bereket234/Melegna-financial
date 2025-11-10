import mongoose from "mongoose";
import Purchase from "../models/Purchase.js";

function dateFilter({ from, to }) {
  const filter = {};
  if (from || to) {
    filter.purchasedAt = {};
    if (from) filter.purchasedAt.$gte = new Date(from);
    if (to) filter.purchasedAt.$lte = new Date(to);
  }
  return filter;
}

export async function spendByCategory(req, res) {
  try {
    const { from, to } = req.query;
    const match = { user: req.user._id, ...dateFilter({ from, to }) };
    const pipeline = [
      { $match: match },
      { $group: { _id: "$category", total: { $sum: "$totalPrice" } } },
      { $sort: { total: -1 } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryId: "$category._id",
          categoryName: "$category.name",
          total: 1,
        },
      },
    ];
    const results = await Purchase.aggregate(pipeline);
    return res.json(results);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function spendByItem(req, res) {
  try {
    const { from, to, categoryId } = req.query;
    const match = { user: req.user._id, ...dateFilter({ from, to }) };
    if (categoryId) match.category = new mongoose.Types.ObjectId(categoryId);
    const pipeline = [
      { $match: match },
      {
        $group: {
          _id: "$item",
          total: { $sum: "$totalPrice" },
          purchaseCount: { $sum: 1 },
          totalQuantity: { $sum: "$quantity" },
        },
      },
      { $sort: { total: -1 } },
      {
        $lookup: {
          from: "items",
          localField: "_id",
          foreignField: "_id",
          as: "item",
        },
      },
      { $unwind: "$item" },
      {
        $lookup: {
          from: "categories",
          localField: "item.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $lookup: {
          from: "units",
          localField: "item.defaultUnit",
          foreignField: "_id",
          as: "defaultUnit",
        },
      },
      { $unwind: "$defaultUnit" },
      {
        $project: {
          _id: 0,
          itemId: "$item._id",
          itemName: "$item.name",
          itemDescription: "$item.description",
          category: {
            id: "$category._id",
            name: "$category.name",
            description: "$category.description",
          },
          defaultUnit: {
            id: "$defaultUnit._id",
            name: "$defaultUnit.name",
            symbol: "$defaultUnit.symbol",
            family: "$defaultUnit.family",
          },
          purchaseCount: 1,
          totalQuantity: 1,
          total: 1,
          createdAt: "$item.createdAt",
          updatedAt: "$item.updatedAt",
        },
      },
    ];
    const results = await Purchase.aggregate(pipeline);
    return res.json(results);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
