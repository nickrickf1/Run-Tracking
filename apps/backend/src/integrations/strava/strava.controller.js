const { PrismaClient } = require("@prisma/client");
const { exchangeCodeForToken } = require("./strava.service");

const prisma = new PrismaClient();

const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";

/**
 * STEP 1 — redirect verso Strava
 */
function connectStrava(req, res) {
    const params = new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID,
        response_type: "code",
        redirect_uri: process.env.STRAVA_REDIRECT_URI,
        scope: "activity:read",
        state: req.user.userId,
    });

    res.redirect(`${STRAVA_AUTH_URL}?${params.toString()}`);
}

/**
 * STEP 2 — callback Strava (SALVA TOKEN)
 */
async function stravaCallback(req, res) {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).json({ message: "Missing code or state" });
        }

        const tokenData = await exchangeCodeForToken(code);

        await prisma.stravaAccount.upsert({
            where: { athleteId: tokenData.athlete.id },
            update: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: tokenData.expires_at,
            },
            create: {
                userId: state,
                athleteId: tokenData.athlete.id,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: tokenData.expires_at,
            },
        });

        // redirect frontend dopo connessione
        res.redirect("http://localhost:5173/dashboard?strava=connected");
    } catch (err) {
        console.error("Strava callback error:", err);
        res.status(500).json({ message: "Strava connection failed" });
    }
}

module.exports = {
    connectStrava,
    stravaCallback,
};
