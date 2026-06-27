import express from 'express'
import { registerUser, loginUser, logoutUser, verifyOtp, forgotPassword, resetPassword, resendOtp } from '../controllers/auth.controller.js'
import protect from '../middleware/auth.middleware.js'

const router = express.Router();

router.post('/register', registerUser);
router.post("/verify-otp", verifyOtp);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOtp);

export default router;