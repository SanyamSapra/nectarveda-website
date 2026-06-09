import asyncHandler from 'express-async-handler';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Get all categories
const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
        success: true,
        count: categories.length,
        categories,
    });
});

// Get single category
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    res.status(200).json({
        success: true,
        category,
    });
});

// Create category
const createCategory = asyncHandler(async (req, res) => {
    let { name, description, image } = req.body;

    if (!name) {
        res.status(400);
        throw new Error('Category name is required');
    }

    name = name.trim();

    const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
    });

    if (existingCategory) {
        res.status(400);
        throw new Error('Category already exists');
    }

    const category = await Category.create({
        name,
        description,
        image,
    });

    res.status(201).json({
        success: true,
        category,
    });
});

// Update category
const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    // If name is being updated, check duplicates
    if (req.body.name) {
        const name = req.body.name.trim();

        const existingCategory = await Category.findOne({
            name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') },
            _id: { $ne: req.params.id },
        });

        if (existingCategory) {
            res.status(400);
            throw new Error('Category already exists');
        }

        req.body.name = name;
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json({
        success: true,
        category: updatedCategory,
    });
});

// Delete category
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (!category) {
        res.status(404);
        throw new Error('Category not found');
    }

    const productCount = await Product.countDocuments({ category: category._id });

    if (productCount > 0) {
        res.status(400);
        throw new Error('Cannot delete category because it still contains products');
    }

    await category.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
    });
});

export {
    getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory,
};
