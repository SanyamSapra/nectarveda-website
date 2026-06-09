import mongoose from 'mongoose';

const createSlug = (name) => name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Product name is required'],
            trim: true,
            maxlength: [150, 'Product name cannot exceed 150 characters'],
        },

        slug: {
            type: String,
            unique: true,
            lowercase: true,
            trim: true,
        },

        description: {
            type: String,
            required: [true, 'Product description is required'],
            maxlength: [3000, 'Description cannot exceed 3000 characters'],
        },

        ingredients: {
            type: [String],
            default: [],
        },

        benefits: {
            type: [String],
            default: [],
        },

        conditions: {
            type: [String],
            default: [],
        },

        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },

        salePrice: {
            type: Number,
            default: null,
            min: [0, 'Sale price cannot be negative'],
        },

        stock: {
            type: Number,
            required: [true, 'Stock is required'],
            default: 0,
            min: [0, 'Stock cannot be negative'],
        },

        sku: {
            type: String,
            unique: true,
            sparse: true,
            trim: true,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: [true, 'Category is required'],
        },

        images: {
            type: [String],
            default: [],
        },

        isFeatured: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = createSlug(this.name);
    }
    next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
