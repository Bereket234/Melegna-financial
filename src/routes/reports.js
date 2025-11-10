import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { spendByCategory, spendByItem } from '../controllers/reportController.js';

const router = Router();

router.use(authRequired);

router.get('/spend-by-category', spendByCategory);
router.get('/spend-by-item', spendByItem);

export default router;


