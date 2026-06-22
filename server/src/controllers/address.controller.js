import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

const getAddresses = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json({
        success: true,
        addresses: user.addresses
    });
});

const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { label, street, city, state, pincode, phone, isDefault } = req.body;

    if (!street || !city || !state || !pincode || !phone) {
        res.status(400);
        throw new Error('All address fields are required');
    }

    user.addresses.push({ label, street, city, state, pincode, phone, isDefault });

    await user.save();

    res.status(201).json({
        success: true,
        message: 'Address added successfully',
        addresses: user.addresses
    });
});

const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { addressId } = req.params;
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Address deleted successfully',
        addresses: user.addresses
    });
});

export { getAddresses, addAddress, deleteAddress };