import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Cart from '../models/Cart.js';
import { sendAccountDeletedEmail } from '../utils/notificationEmails.js';
import getAuthCookieOptions from '../utils/cookieOptions.js';

// Get logged in user profile
const getProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json({
        success: true,
        user,
    });
});

// Update logged in user profile
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { name, email, password, phone } = req.body;

    if (email && email !== user.email) {
        const emailExists = await User.findOne({
            email,
            _id: { $ne: user._id },
        });

        if (emailExists) {
            res.status(400);
            throw new Error('Email already in use');
        }

        user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;

    if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        user: {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
        },
    });
});

const deleteAccount = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    await sendAccountDeletedEmail(user);
    await Cart.deleteOne({ user: user._id });
    await user.deleteOne();

    res.cookie('token', '', {
        ...getAuthCookieOptions(req),
        expires: new Date(0),
    });

    res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
    });
});

export { getProfile, updateProfile, deleteAccount };
