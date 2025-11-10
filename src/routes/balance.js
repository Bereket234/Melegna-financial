import { Router } from "express";
import { body } from "express-validator";
import { authRequired } from "../middleware/auth.js";
import { getBalance, updateBalance } from "../controllers/balanceController.js";

const router = Router();

router.use(authRequired);

router.get("/", getBalance);

router.patch(
  "/",
  [body("amount").isFloat().withMessage("Amount must be a valid number")],
  updateBalance
);

export default router;
