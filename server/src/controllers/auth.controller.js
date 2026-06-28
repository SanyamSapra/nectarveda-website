import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import generateOtp from "../utils/generateOtp.js";
import sendEmail from "../utils/sendEmail.js";
import { sendWelcomeEmail } from "../utils/notificationEmails.js";
import getAuthCookieOptions from '../utils/cookieOptions.js';

// Register a new user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please provide all required fields");
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists?.isVerified) {
        res.status(400);
        throw new Error("User already exists");
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
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
        // Send OTP email
        await sendEmail({
            to: email,
            from: process.env.EMAIL_USER || process.env.EMAIL_FROM,
            subject: "Verify your NectarVeda account",
            html: `
        <h2>Welcome to NectarVeda, ${name}!</h2>
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

        // In development return the original error for debugging, in production return a generic message
        if (process.env.NODE_ENV !== 'production') {
            throw error;
        }

        throw new Error('Unable to send verification email. Please contact support.');
    }

    res.status(201).json({
        message: "OTP sent to your email. Please verify your account.",
        email,
    });
});

const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

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
        throw new Error("Invalid OTP");
    }

    if (user.otpExpiry < new Date()) {
        res.status(400);
        throw new Error("OTP expired");
    }

    // Mark user as verified, clear OTP
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    await sendWelcomeEmail(user);

    // Now generate token and login
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

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
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
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("No account found with this email");
    }

    // Generate OTP
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
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    if (user.otp !== otp) {
        res.status(400);
        throw new Error("Invalid OTP");
    }

    if (user.otpExpiry < new Date()) {
        res.status(400);
        throw new Error("OTP expired");
    }

    // Hash new password and clear OTP
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({
        message: "Password reset successful. Please login.",
    });
});

const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

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
