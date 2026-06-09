import express from 'express'
import { getCart, addToCart, removeFromCart, updateCart } from '../controllers/cart.controller.js'
import protect from '../middleware/auth.middleware.js'

const router = express.Router();

router.get('/', protect, getCart);
router.post('/', protect, addToCart);
router.put('/:productId', protect, updateCart);
router.delete('/:productId', protect, removeFromCart);

export default router;
