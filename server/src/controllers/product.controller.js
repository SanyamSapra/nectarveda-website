import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Order from '../models/Order.js'

const createSlug = (name) => name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

// Get all products
// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
    const { search, category } = req.query;

    const query = {};

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ]
    }

    if (category) {
        query.category = category;
    }

    const products = await Product.find(query).populate('category');

    res.status(200).json({
        success: true,
        count: products.length,
        products
    })
})

// Get product by ID
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('category');

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.status(200).json({
        success: true,
        product
    })
})

// Create product
const createProduct = asyncHandler(async (req, res) => {
    const { name, description, ingredients, benefits, price, salePrice, stock, sku, category, conditions, isFeatured
    } = req.body;
    const images = req.files ? req.files.map(file => file.path) : []

    if (!name?.trim() || !description?.trim() || price === undefined || stock === undefined || !category) {
        res.status(400);
        throw new Error('Name, description, price, stock, and category are required');
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
        res.status(400);
        throw new Error('Valid category is required');
    }

    const numericPrice = Number(price);
    const numericStock = Number(stock);
    const numericSalePrice = salePrice === undefined || salePrice === '' || salePrice === null
        ? null
        : Number(salePrice);

    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
        res.status(400);
        throw new Error('Price must be a non-negative number');
    }

    if (!Number.isInteger(numericStock) || numericStock < 0) {
        res.status(400);
        throw new Error('Stock must be a non-negative integer');
    }

    if (numericSalePrice !== null && (!Number.isFinite(numericSalePrice) || numericSalePrice < 0)) {
        res.status(400);
        throw new Error('Sale price must be a non-negative number');
    }

    const categoryExists = await Category.exists({ _id: category });

    if (!categoryExists) {
        res.status(404);
        throw new Error('Category not found');
    }

    const product = await Product.create({
        name,
        description,
        ingredients,
        benefits,
        price: numericPrice,
        salePrice: numericSalePrice,
        stock: numericStock,
        sku,
        category,
        images,
        conditions,
        isFeatured
    });

    res.status(201).json({
        success: true,
        product
    })
})

// Update product
const updateProduct = asyncHandler(async (req, res) => {
    if (req.body.name) {
        req.body.slug = createSlug(req.body.name);
    }

    if (req.files && req.files.length > 0) {
        req.body.images = req.files.map(file => file.path);
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    res.status(200).json({
        success: true,
        product
    })
})

// Delete product
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    await product.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Product deleted successfully'
    })
})

const getTopSellingProducts = asyncHandler(async (req, res) => {
    const topSelling = await Order.aggregate([
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.product",
                totalSold: { $sum: "$items.quantity" },
            },
        },
        { $sort: { totalSold: -1 } },
        { $limit: 4 },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: "$product" },
        {
            $replaceRoot: {
                newRoot: {
                    $mergeObjects: ["$product", { totalSold: "$totalSold" }],
                },
            },
        },
    ]);

    res.status(200).json({ products: topSelling });
});

export { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct, getTopSellingProducts };
