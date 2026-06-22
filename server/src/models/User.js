import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        lowercase: true,
        trim: true
    },

    phone: {
        type: String,
        trim: true,
        match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    addresses: [
        {
            label: { type: String, default: 'Home' },
            street: { type: String, required: true },
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            phone: { type: String, required: true },
            isDefault: { type: Boolean, default: false }
        }
    ]

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;