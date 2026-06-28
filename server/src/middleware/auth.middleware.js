import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader?.startsWith('Bearer ')
            ? authHeader.split(' ')[1]
            : null;

        const token = tokenFromHeader || req.cookies?.token || null;

        if (!token) {
            const error = new Error('Not authorized, no token')
            error.statusCode = 401
            throw error
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id) {
            const error = new Error('Not authorized, token invalid')
            error.statusCode = 401
            throw error
        }

        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            const error = new Error('Not authorized, user not found')
            error.statusCode = 401
            throw error
        }

        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            error.statusCode = 401;
            error.message = 'Not authorized, token invalid';
        }

        if (error.name === 'TokenExpiredError') {
            error.statusCode = 401;
            error.message = 'Not authorized, token expired';
        }

        next(error)
    }
}

export default protect;
