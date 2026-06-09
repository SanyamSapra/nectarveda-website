import mongoose from 'mongoose'

const categorySchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true,
        maxlength: 50,
    },

    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: '',
    },

    image: {
        type: String,
        default: '',
    },


}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category