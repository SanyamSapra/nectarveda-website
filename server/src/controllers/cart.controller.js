import asyncHandler from 'express-async-handler'
import Cart from '../models/Cart.js'
import Product from '../models/Product.js'

const getCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart) {
        return res.status(200).json({
            success: true,
            cart: { items: [] }
        })
    }

    res.status(200).json({
        success: true,
        cart
    })
})

const addToCart = asyncHandler(async (req, res) => {
    const { product } = req.body;
    const quantity = Number(req.body.quantity ?? 1);
    const userId = req.user._id;

    if (!product) {
        res.status(400);
        throw new Error('Product is required');
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        res.status(400);
        throw new Error('Quantity must be a positive integer');
    }

    const productExist = await Product.findById(product);

    if (!productExist) {
        res.status(404);
        throw new Error('Product not found');
    }

    let cart = await Cart.findOne({ user: userId });
    const existingItem = cart?.items.find(item => item.product.toString() === product);
    const requestedQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (requestedQuantity > productExist.stock) {
        res.status(400);
        throw new Error(`Only ${productExist.stock} item(s) available in stock`);
    }

    if (!cart) {
        cart = await Cart.create({
            user: userId,
            items: [{ product, quantity }]
        });
    }
    else {
        const itemIndex = cart.items.findIndex(item => item.product.toString() === product);

        if (itemIndex === -1) {

            cart.items.push({
                product,
                quantity
            });

        }
        else {
            cart.items[itemIndex].quantity += quantity;
        }

        await cart.save();
    }

    cart = await cart.populate('items.product')
    res.status(200).json({
        success: true,
        message: 'Item added to cart',
        cart
    });
});


const removeFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(
        item => item.product.toString() !== productId
    );

    await cart.save();

    cart = await cart.populate('items.product')
    res.status(200).json({
        success: true,
        message: 'Item removed from cart',
        cart
    });
});

const updateCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const quantity = Number(req.body.quantity);

    if (!Number.isInteger(quantity) || quantity <= 0) {
        res.status(400)
        throw new Error('Quantity must be a positive integer')
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
        res.status(404);
        throw new Error('Cart not found');
    }

    const item = cart.items.find(
        item => item.product.toString() === productId
    );

    if (!item) {
        res.status(404);
        throw new Error('Product not found in cart');
    }

    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    if (quantity > product.stock) {
        res.status(400);
        throw new Error(`Only ${product.stock} item(s) available in stock`);
    }

    item.quantity = quantity;

    await cart.save();

    cart = await cart.populate('items.product')
    res.status(200).json({
        success: true,
        message: 'Cart updated successfully',
        cart
    });
});

export { getCart, addToCart, removeFromCart, updateCart }
