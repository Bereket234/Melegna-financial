import { Router } from "express";
import { body } from "express-validator";
import { authRequired } from "../middleware/auth.js";
import {
  createUnit,
  listUnits,
  updateUnit,
  deleteUnit,
} from "../controllers/unitController.js";

const router = Router();

router.use(authRequired);

router.get("/", listUnits);
router.post(
  "/",
  [
    body("name").isString().trim().isLength({ min: 1 }),
    body("symbol").isString().trim().isLength({ min: 1 }),
    body("family").isIn([
      "count",
      "weight",
      "volume",
      "length",
      "area",
      "package",
      "other",
    ]),
    body("baseUnit").isString().trim().isLength({ min: 1 }),
    body("toBaseFactor").isFloat({ gt: 0 }),
  ],
  createUnit
);

router.patch("/:id", updateUnit);
router.delete("/:id", deleteUnit);

export default router;
