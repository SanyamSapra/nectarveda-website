import express from 'express'
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus } from '../controllers/order.controller.js'
import protect from '../middleware/auth.middleware.js'
import admin from '../middleware/admin.middleware.js'

const router = express.Router();

router.post('/', protect, createOrder)
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrderById)
router.get('/', protect, admin, getAllOrders)
router.put('/:id/status', protect, admin, updateOrderStatus)

export default router