const getAuthCookieOptions = (req) => {
    const forwardedProto = req.headers['x-forwarded-proto']?.split(',')[0]?.trim();
    const isSecureRequest =
        req.secure ||
        forwardedProto === 'https' ||
        process.env.NODE_ENV === 'production' ||
        process.env.RENDER === 'true';

    return {
        httpOnly: true,
        secure: isSecureRequest,
        sameSite: isSecureRequest ? 'none' : 'lax',
    };
};

export default getAuthCookieOptions;
