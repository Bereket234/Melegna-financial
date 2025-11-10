import { validationResult } from "express-validator";
import Balance from "../models/Balance.js";

export async function getBalance(req, res) {
  try {
    const balance = await Balance.findOne({ user: req.user._id });
    if (!balance) {
      // If balance doesn't exist (for existing users), create it
      const newBalance = await Balance.create({
        user: req.user._id,
        availableBalance: 0,
        totalSpent: 0,
      });
      return res.json(newBalance);
    }
    return res.json(balance);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateBalance(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { amount } = req.body;

    // Find or create balance
    let balance = await Balance.findOne({ user: req.user._id });
    if (!balance) {
      balance = await Balance.create({
        user: req.user._id,
        availableBalance: 0,
        totalSpent: 0,
        allTimeTotalIncome: 0,
      });
    }

    // Update available balance (add the amount)
    balance.availableBalance = (balance.availableBalance || 0) + Number(amount);
    balance.allTimeTotalIncome = (balance.allTimeTotalIncome || 0) + Number(amount);
    // Ensure balance doesn't go negative
    if (balance.availableBalance < 0) {
      return res.status(400).json({
        message: "Available balance cannot be negative",
      });
    }

    await balance.save();
    return res.json(balance);
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}
