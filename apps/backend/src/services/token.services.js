const jwt = require("jsonwebtoken");

function signAccessToken(payload) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing. Check your .env loading.");
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
}

function verifyAccessToken(token) {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing. Check your .env loading.");
    }
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signAccessToken, verifyAccessToken };
