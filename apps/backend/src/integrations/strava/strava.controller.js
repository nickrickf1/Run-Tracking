const { PrismaClient } = require("@prisma/client");
const { exchangeCodeForToken } = require("./strava.service");
const { signAccessToken, verifyAccessToken } = require("../../services/token.services");

const prisma = new PrismaClient();

const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * STEP 1 — redirect verso Strava OAuth
 * Il parametro `state` contiene un JWT firmato con il userId,
 * per evitare che chiunque possa falsificare l'associazione.
 */
function connectStrava(req, res) {
    const state = signAccessToken({ userId: req.user.userId, purpose: "strava" });

    const params = new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID,
        response_type: "code",
        redirect_uri: process.env.STRAVA_REDIRECT_URI,
        scope: "activity:read",
        state,
    });

    res.redirect(`${STRAVA_AUTH_URL}?${params.toString()}`);
}

/**
 * STEP 2 — callback da Strava (salva token nel DB)
 */
async function stravaCallback(req, res, next) {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).json({ message: "Parametri mancanti dalla risposta Strava" });
        }

        // Verifica che lo state sia un JWT valido firmato da noi
        let decoded;
        try {
            decoded = verifyAccessToken(state);
        } catch {
            return res.status(403).json({ message: "State non valido o scaduto" });
        }

        if (decoded.purpose !== "strava" || !decoded.userId) {
            return res.status(403).json({ message: "State non valido" });
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
                userId: decoded.userId,
                athleteId: tokenData.athlete.id,
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: tokenData.expires_at,
            },
        });

        res.redirect(`${FRONTEND_URL}/dashboard?strava=connected`);
    } catch (err) {
        next(err);
    }
}

module.exports = { connectStrava, stravaCallback };
