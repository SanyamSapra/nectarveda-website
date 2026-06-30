const errorMiddleware = (err, req, res, next) => {
    let statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
    let message = err.message || 'Something went wrong. Please try again.';

    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors)
            .map((error) => {
                if (error.path === 'email') return 'Please enter a valid email address.';
                if (error.path?.endsWith('phone')) return 'Please enter a valid 10-digit phone number.';
                if (error.path?.endsWith('pincode')) return 'Please enter a valid 6-digit pincode.';
                return error.message;
            })
            .join(', ');
    }

    if (err.name === 'CastError') {
        statusCode = 400;
        message = 'Invalid request. Please check the details and try again.';
    }

    if (err.code === 11000) {
        statusCode = 400;
        message = 'An account with this email already exists.';
    }

    if (statusCode === 401 && message.startsWith('Not authorized')) {
        message = 'Please sign in to continue.';
    }

    if (statusCode === 403) {
        message = message === 'Invalid User'
            ? 'You do not have permission to access this resource.'
            : message;
    }

    if (process.env.NODE_ENV === 'production' && statusCode >= 500 && statusCode !== 503) {
        console.error(err);
        message = 'Something went wrong on our side. Please try again shortly.';
    }

    res.status(statusCode).json({
        success: false,
        message,
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
}

export default errorMiddleware;
