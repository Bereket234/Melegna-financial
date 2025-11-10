import { Router } from 'express';
import { body } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import { createItem, listItems, updateItem, deleteItem } from '../controllers/itemController.js';

const router = Router();

router.use(authRequired);

router.get('/', listItems);
router.post(
  '/',
  [
    body('name').isString().trim().isLength({ min: 1 }),
    body('categoryId').isString().isLength({ min: 1 }),
    body('defaultUnitId').isString().isLength({ min: 1 })
  ],
  createItem
);

router.patch('/:id', updateItem);
router.delete('/:id', deleteItem);
export default router;


