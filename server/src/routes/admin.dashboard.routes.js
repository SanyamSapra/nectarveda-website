import express from 'express';
import { getDashboardStats } from '../controllers/admin.dashboard.controller.js';
import protect from '../middleware/auth.middleware.js';
import admin from '../middleware/admin.middleware.js';

const router = express.Router();

router.get('/', protect, admin, getDashboardStats);

export default router;