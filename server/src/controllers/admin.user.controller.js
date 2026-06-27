import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import Order from '../models/Order.js';

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'user' })
        .select('-password')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: users.length,
        users
    });
});


const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const orders = await Order.find({ user: req.params.id })
        .populate('items.product', 'name price images')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        user,
        orders,
        totalOrders: orders.length,
        totalSpent: orders
            .filter(o => o.orderStatus === 'delivered')
            .reduce((sum, o) => sum + o.totalAmount, 0)
    });
});

export { getAllUsers, getUserById };