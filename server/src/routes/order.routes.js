import express from 'express'
import { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder } from '../controllers/order.controller.js'
import protect from '../middleware/auth.middleware.js'
import admin from '../middleware/admin.middleware.js'

const router = express.Router();

router.post('/', protect, createOrder)
router.get('/', protect, admin, getAllOrders)   // pehle
router.get('/my', protect, getMyOrders)
router.get('/:id', protect, getOrderById)      // baad mein
router.put('/:id/status', protect, admin, updateOrderStatus)
router.put('/:id/cancel', protect, cancelOrder)

export default router