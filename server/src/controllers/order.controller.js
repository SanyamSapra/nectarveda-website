import asyncHandler from 'express-async-handler'
import Order from '../models/Order.js'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import {
    sendAdminLowStockEmail,
    sendAdminOrderPlacedEmail,
    sendOrderCancelledEmail,
    sendOrderPlacedEmail,
    sendOrderStatusEmail
} from '../utils/notificationEmails.js'

const configuredLowStockThreshold = Number(process.env.LOW_STOCK_THRESHOLD);
const LOW_STOCK_THRESHOLD = Number.isFinite(configuredLowStockThreshold)
    ? configuredLowStockThreshold
    : 5;

const getAdminEmailRecipients = async () => {
    if (process.env.ADMIN_EMAIL) {
        return process.env.ADMIN_EMAIL.split(',').map(email => email.trim()).filter(Boolean);
    }

    const admins = await User.find({ role: 'admin' }).select('email');
    return admins.map(admin => admin.email).filter(Boolean);
};

const getOrderCustomer = (order) => {
    if (order.user?.email) {
        return order.user;
    }

    return order.customerSnapshot?.email ? order.customerSnapshot : null;
};


const createOrder = asyncHandler(async (req, res) => {
    const { shippingAddress } = req.body;

    if (!shippingAddress) {
        res.status(400)
        throw new Error('Shipping address is required')
    }

    const requiredAddressFields = ['street', 'city', 'state', 'pincode', 'phone'];
    const hasMissingAddressField = requiredAddressFields.some(field => !shippingAddress[field]?.trim());

    if (hasMissingAddressField) {
        res.status(400);
        throw new Error('Please provide a complete delivery address');
    }

    if (!/^\d{6}$/.test(shippingAddress.pincode)) {
        res.status(400);
        throw new Error('Pincode must be exactly 6 digits');
    }

    if (!/^\d{10}$/.test(shippingAddress.phone)) {
        res.status(400);
        throw new Error('Phone must be exactly 10 digits');
    }

    const deliveryAddress = {
        street: shippingAddress.street.trim(),
        landmark: shippingAddress.landmark?.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        pincode: shippingAddress.pincode.trim(),
        phone: shippingAddress.phone.trim(),
    };

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

    const lowStockProducts = [];

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

        if (item.product.stock > LOW_STOCK_THRESHOLD && updatedProduct.stock <= LOW_STOCK_THRESHOLD) {
            lowStockProducts.push({
                name: updatedProduct.name,
                stock: updatedProduct.stock,
            });
        }
    }

    const order = await Order.create({
        user: req.user._id,
        customerSnapshot: {
            name: req.user.name,
            email: req.user.email,
        },
        items: orderItems,
        totalAmount,
        shippingAddress: deliveryAddress
    })

    await sendOrderPlacedEmail({
        user: req.user,
        order,
        items: cart.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.product.price
        }))
    });

    const adminRecipients = await getAdminEmailRecipients();

    await sendAdminOrderPlacedEmail({
        to: adminRecipients,
        user: req.user,
        order,
        items: cart.items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            price: item.product.price
        }))
    });

    await sendAdminLowStockEmail({
        to: adminRecipients,
        products: lowStockProducts,
        threshold: LOW_STOCK_THRESHOLD
    });

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

    const previousStatus = order.orderStatus;
    order.orderStatus = orderStatus;

    if (previousStatus !== 'cancelled' && orderStatus === 'cancelled') {
        await order.populate('items.product');

        for (const item of order.items) {
            await Product.findByIdAndUpdate(
                item.product._id,
                { $inc: { stock: item.quantity } },
                { new: true, runValidators: true }
            );
        }
    }

    await order.save();
    await order.populate('user', 'name email');
    const customer = getOrderCustomer(order);

    if (customer && order.orderStatus === 'cancelled') {
        await order.populate('items.product');
        await sendOrderCancelledEmail({ user: customer, order });
    } else if (customer) {
        await sendOrderStatusEmail({ user: customer, order });
    }

    res.status(200).json({
        success: true,
        order
    });
});

const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Invalid User');
    }

    if (order.orderStatus !== 'processing') {
        res.status(400);
        throw new Error('Only processing orders can be cancelled');
    }

    for (const item of order.items) {
        await Product.findByIdAndUpdate(
            item.product._id,
            { $inc: { stock: item.quantity } },
            { new: true, runValidators: true }
        );
    }

    order.orderStatus = 'cancelled';
    await order.save();
    await sendOrderCancelledEmail({ user: req.user, order });

    res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        order
    });
});

export { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, cancelOrder }
