const {verifyAccessToken} = require('../services/token.services')

function authMiddleware (req, res, next) {
    const header = req.headers.authorization

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Missing or invalid Authorization header" });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    }catch(err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}

module.exports = { authMiddleware }