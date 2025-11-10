import { Router } from 'express';
import { body } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import { createPurchase, listPurchases, updatePurchase, deletePurchase } from '../controllers/purchaseController.js';

const router = Router();

router.use(authRequired);

router.get('/', listPurchases);

router.post(
  '/',
  [
    body('itemId').isString().isLength({ min: 1 }),
    body('unitId').isString().isLength({ min: 1 }),
    body('quantity').isFloat({ gt: 0 }),
    body('unitPrice').isFloat({ gt: 0 }),
    body('purchasedAt').isISO8601().toDate()
  ],
  createPurchase
);

router.patch('/:id', updatePurchase);
router.delete('/:id', deletePurchase);


export default router;



