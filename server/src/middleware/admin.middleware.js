const admin = (req, res, next) => {
    if(req.user && req.user.role === 'admin'){
        next();
    } else {
        const error = new Error('Not authorized, admin only');
        error.statusCode = 403;
        next(error);
    }   
}

export default admin;
