const axios = require("axios");

const STRAVA_TOKEN_URL = "https://www.strava.com/oauth/token";
const STRAVA_API_BASE = "https://www.strava.com/api/v3";

/**
 * Scambia il code OAuth per access + refresh token.
 */
async function exchangeCodeForToken(code) {
    const res = await axios.post(STRAVA_TOKEN_URL, {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
    });
    return res.data;
}

/**
 * Rinnova l'access token se scaduto.
 * Restituisce il nuovo accessToken (o quello attuale se ancora valido).
 */
async function refreshAccessToken(stravaAccount) {
    const now = Math.floor(Date.now() / 1000);
    if (stravaAccount.expiresAt > now + 60) {
        return stravaAccount.accessToken;
    }

    const res = await axios.post(STRAVA_TOKEN_URL, {
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        refresh_token: stravaAccount.refreshToken,
        grant_type: "refresh_token",
    });

    return {
        accessToken: res.data.access_token,
        refreshToken: res.data.refresh_token,
        expiresAt: res.data.expires_at,
    };
}

/**
 * Recupera le attività recenti da Strava.
 * @param {string} accessToken
 * @param {number} page
 * @param {number} perPage
 */
async function fetchActivities(accessToken, { page = 1, perPage = 30 } = {}) {
    const res = await axios.get(`${STRAVA_API_BASE}/athlete/activities`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { page, per_page: perPage },
    });
    return res.data;
}

/**
 * Converte un'attività Strava nel formato Run del nostro DB.
 * Filtra solo le attività di tipo "Run".
 */
function mapStravaActivityToRun(activity, userId) {
    return {
        userId,
        date: new Date(activity.start_date),
        distanceKm: parseFloat((activity.distance / 1000).toFixed(2)),
        durationSec: activity.moving_time,
        type: "lento", // default — Strava non ha i nostri tipi
        notes: activity.name || null,
    };
}

module.exports = {
    exchangeCodeForToken,
    refreshAccessToken,
    fetchActivities,
    mapStravaActivityToRun,
};
