import { Router } from "express";
import { body } from "express-validator";
import {
  login,
  register,
  getUserDetails,
} from "../controllers/authController.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("name").isString().trim().isLength({ min: 2 }),
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6 }),
  ],
  register
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isString().isLength({ min: 6 }),
  ],
  login
);

router.get("/me", authRequired, getUserDetails);

export default router;
