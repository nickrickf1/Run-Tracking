const { verifyAccessToken } = require('../services/token.services');

function authMiddleware(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Header Authorization mancante o non valido" });
    }

    const token = header.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: "Token mancante" });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token non valido o scaduto" });
    }
}

module.exports = { authMiddleware };
