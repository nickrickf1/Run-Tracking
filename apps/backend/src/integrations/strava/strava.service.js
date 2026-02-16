const axios = require("axios");

async function exchangeCodeForToken(code) {
    const res = await axios.post("https://www.strava.com/oauth/token", {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
    });

    return res.data;
}

module.exports = { exchangeCodeForToken };
