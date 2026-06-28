import express from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getTopSellingProducts } from '../controllers/product.controller.js';
import protect from '../middleware/auth.middleware.js';
import admin from '../middleware/admin.middleware.js';
import upload from '../middleware/upload.middleware.js';

const router = express.Router();

// Public Routes
router.get('/', getAllProducts);
router.get("/top-selling", getTopSellingProducts);
router.get('/:id', getProductById);

// Admin Routes
router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

export default router;
