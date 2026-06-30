import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";
import { sendWelcomeEmail } from "../utils/notificationEmails.js";
import getAuthCookieOptions from '../utils/cookieOptions.js';

const escapeHtml = (value = "") =>
    String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

const registerUser = asyncHandler(async (req, res) => {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }

    if (password.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters long");
    }

    const userExists = await User.findOne({ email });
    if (userExists?.isVerified) {
        res.status(400);
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    let user = userExists;
    let createdUser = false;

    if (user) {
        user.name = name;
        user.password = hashedPassword;
        user.otp = otp;
        user.otpExpiry = otpExpiry;
    } else {
        user = await User.create({
            name,
            email,
            password: hashedPassword,
            otp,
            otpExpiry,
            isVerified: false,
        });
        createdUser = true;
    }

    if (!createdUser) {
        await user.save();
    }

    try {
        await sendEmail({
            to: email,
            subject: "Verify your NectarVeda account",
            html: `
        <h2>Welcome to NectarVeda, ${escapeHtml(name)}!</h2>
        <p>Your OTP for account verification is:</p>
        <h1 style="letter-spacing: 8px; color: #b45309;">${otp}</h1>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      `,
        });
    } catch (error) {
        console.error('Registration: failed to send verification email', error);
        if (createdUser) {
            await User.deleteOne({ _id: user._id });
        }

        if (process.env.NODE_ENV !== 'production') {
            throw error;
        }

        const emailError = new Error('Unable to send verification email right now. Please try again in a few minutes.');
        emailError.statusCode = 503;
        throw emailError;
    }

    res.status(201).json({
        message: "OTP sent to your email. Please verify your account.",
        email,
    });
});

const verifyOtp = asyncHandler(async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();

    if (!email || !otp) {
        res.status(400);
        throw new Error("Please enter your email and OTP");
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error("User already verified");
    }

    if (user.otp !== otp) {
        res.status(400);
        throw new Error("Invalid OTP. Please check the code and try again.");
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
        res.status(400);
        throw new Error("OTP expired. Please request a new one.");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    try {
        await sendWelcomeEmail(user);
    } catch (error) {
        console.error('Failed to send welcome email:', error);
    }


    const token = generateToken(user._id);

    res.cookie("token", token, {
        ...getAuthCookieOptions(req),
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
    });
});

const loginUser = asyncHandler(async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {

        if (!user.isVerified) {
            res.status(401);
            throw new Error('Please verify your email before logging in');
        }

        const token = generateToken(user._id)

        res.cookie('token', token, {
            ...getAuthCookieOptions(req),
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token
        })
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
})

const logoutUser = asyncHandler(async (req, res) => {
    res.cookie('token', '', {
        ...getAuthCookieOptions(req),
        expires: new Date(0),
    })
    res.status(200).json({
        message: 'Logged out successfully'
    })
})

const forgotPassword = asyncHandler(async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
        res.status(400);
        throw new Error("Please enter your email address");
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("No account found with this email");
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendEmail({
        to: email,
        subject: "NectarVeda Password Reset OTP",
        html: `
      <h2>Password Reset Request</h2>
      <p>Your OTP for resetting your password is:</p>
      <h1 style="letter-spacing: 8px; color: #b45309;">${otp}</h1>
      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
    });

    res.status(200).json({
        message: "OTP sent to your email",
        email,
    });
});

const resetPassword = asyncHandler(async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const otp = req.body.otp?.trim();
    const { newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        res.status(400);
        throw new Error("Please provide your email, OTP, and new password");
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error("Password must be at least 6 characters long");
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (user.otp !== otp) {
        res.status(400);
        throw new Error("Invalid OTP. Please check the code and try again.");
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
        res.status(400);
        throw new Error("OTP expired. Please request a new one.");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
        message: "Password reset successful. Please login.",
    });
});

const resendOtp = asyncHandler(async (req, res) => {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
        res.status(400);
        throw new Error("Please enter your email address");
    }

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error("User already verified");
    }

    const otp = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    await sendEmail({
        to: email,
        subject: "NectarVeda - Resend OTP",
        html: `
      <h2>Your new OTP</h2>
      <p>Your new OTP for account verification is:</p>
      <h1 style="letter-spacing: 8px; color: #b45309;">${otp}</h1>
      <p>This OTP is valid for <strong>10 minutes</strong>.</p>
    `,
    });

    res.status(200).json({ message: "OTP resent successfully" });
});

export { registerUser, loginUser, logoutUser, verifyOtp, forgotPassword, resetPassword, resendOtp }
