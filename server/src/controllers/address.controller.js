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

    const address = {
        label: req.body.label?.trim() || 'Home',
        street: req.body.street?.trim(),
        landmark: req.body.landmark?.trim(),
        city: req.body.city?.trim(),
        state: req.body.state?.trim(),
        pincode: req.body.pincode?.trim(),
        phone: req.body.phone?.trim(),
        isDefault: Boolean(req.body.isDefault),
    };

    if (!address.street || !address.city || !address.state || !address.pincode || !address.phone) {
        res.status(400);
        throw new Error('All address fields are required');
    }

    if (!/^\d{6}$/.test(address.pincode)) {
        res.status(400);
        throw new Error('Pincode must be exactly 6 digits');
    }

    if (!/^\d{10}$/.test(address.phone)) {
        res.status(400);
        throw new Error('Phone must be exactly 10 digits');
    }

    user.addresses.push(address);

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
