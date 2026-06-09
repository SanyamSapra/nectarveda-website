import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'


const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
        res.status(400)
        throw new Error('Shipping address is required')
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
        res.status(400)
        throw new Error('Cart is Empty')
    }

    for (const item of cart.items) {
        if (!item.product) {
            res.status(404)
            throw new Error('Product not found')
        }

        if (item.quantity > item.product.stock) {
            res.status(400)
            throw new Error(`Only ${item.product.stock} item(s) available for ${item.product.name}`)
        }
    }

    const orderItems = cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
    }))

    const totalAmount = cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0)

    for (const item of cart.items) {
        const updatedProduct = await Product.findOneAndUpdate(
            { _id: item.product._id, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true, runValidators: true }
        )

        if (!updatedProduct) {
            res.status(400)
            throw new Error(`Not enough stock available for ${item.product.name}`)
        }
    }

    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        totalAmount,
        shippingAddress
    })

    cart.items = [];
    await cart.save();

    res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
    });
})

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).populate('items.product').sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    })
})

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) {
        res.status(404)
        throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403)
        throw new Error('Invalid User')
    }

    res.status(200).json({
        success: true,
        order
    })
})

const getAllOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().populate('user', 'name email').populate('items.product').sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: orders.length,
        orders
    })
})

const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    const { orderStatus } = req.body;

    const allowedStatuses = [
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    ];

    if (!allowedStatuses.includes(orderStatus)) {
        res.status(400);
        throw new Error('Invalid order status');
    }

    order.orderStatus = orderStatus;

    await order.save();

    res.status(200).json({
        success: true,
        order
    });
});

export { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus }
