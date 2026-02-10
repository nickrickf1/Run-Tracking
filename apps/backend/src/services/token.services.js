const jwt = require('jsonwebtoken');

function signAccessToken(payload) {
    return jwt.sign(payload, process.env.SECRET, {expiresIn: '1d'});

}

function verifyAccessToken(token) {
    return jwt.verify(token, process.env.SECRET);
}

module.exports = {signAccessToken, verifyAccessToken};