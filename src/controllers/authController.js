import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import Balance from "../models/Balance.js";
import { generateToken } from "../services/tokenService.js";
import { seedDefaultUnitsForUser } from "../utils/seedUnits.js";

export async function register(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use" });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    // Create balance for new user
    await Balance.create({
      user: user._id,
      availableBalance: 0,
      totalSpent: 0,
    });

    const token = generateToken(user._id, user.email);

    seedDefaultUnitsForUser(user._id).catch((err) => {
      console.error("Error seeding default units for new user:", err);
    });

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    console.log("Login request received");
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("User found:", user);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const ok = await user.comparePassword(password);
    console.log("Password comparison result:", ok);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    const token = generateToken(user._id, user.email);
    console.log("Token generated:", token);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUserDetails(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let balance = await Balance.findOne({ user: req.user._id });
    if (!balance) {
      // If balance doesn't exist, create it
      balance = await Balance.create({
        user: req.user._id,
        availableBalance: 0,
        totalSpent: 0,
        allTimeTotalIncome: 0,
      });
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      balance: {
        availableBalance: balance.availableBalance,
        totalSpent: balance.totalSpent,
        allTimeTotalIncome: balance.allTimeTotalIncome,
        netBalance: balance.netBalance,
        createdAt: balance.createdAt,
        updatedAt: balance.updatedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}
