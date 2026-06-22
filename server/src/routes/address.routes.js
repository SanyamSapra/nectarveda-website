import express from 'express';
import { getAddresses, addAddress, deleteAddress } from '../controllers/address.controller.js';
import protect from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getAddresses);
router.post('/', protect, addAddress);
router.delete('/:addressId', protect, deleteAddress);

export default router;