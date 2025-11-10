import { Router } from 'express';
import { body } from 'express-validator';
import { authRequired } from '../middleware/auth.js';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/categoryController.js';

const router = Router();

router.use(authRequired);

router.get('/', listCategories);

router.post(
  '/',
  [body('name').isString().trim().isLength({ min: 1 })],
  createCategory
);

router.patch('/:id', updateCategory);
router.delete('/:id', deleteCategory);

export default router;


