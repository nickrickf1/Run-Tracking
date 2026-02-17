const prisma = require("../../lib/prisma");
const {
    exchangeCodeForToken,
    refreshAccessToken,
    fetchActivities,
    mapStravaActivityToRun,
} = require("./strava.service");
const { signAccessToken, verifyAccessToken } = require("../../services/token.services");

const STRAVA_AUTH_URL = "https://www.strava.com/oauth/authorize";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

/**
 * GET /integrations/strava/status
 * Controlla se l'utente ha un account Strava collegato.
 */
async function stravaStatus(req, res, next) {
    try {
        const account = await prisma.stravaAccount.findUnique({
            where: { userId: req.user.userId },
            select: { athleteId: true, createdAt: true },
        });

        return res.json({ connected: !!account, account });
    } catch (err) {
        next(err);
    }
}

/**
 * GET /integrations/strava/connect?token=...
 * Redirect verso Strava OAuth.
 * Accetta il JWT come query param (navigazione browser, non fetch).
 */
function connectStrava(req, res) {
    const jwt = req.query.token;
    if (!jwt) return res.status(401).json({ message: "Token mancante" });

    let decoded;
    try {
        decoded = verifyAccessToken(jwt);
    } catch {
        return res.status(401).json({ message: "Token non valido o scaduto" });
    }

    const state = signAccessToken({ userId: decoded.userId, purpose: "strava" });

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
 * GET /integrations/strava/callback
 * Callback OAuth da Strava — salva i token nel DB.
 */
async function stravaCallback(req, res, next) {
    try {
        const { code, state } = req.query;

        if (!code || !state) {
            return res.status(400).json({ message: "Parametri mancanti dalla risposta Strava" });
        }

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

        res.redirect(`${FRONTEND_URL}/profile?strava=connected`);
    } catch (err) {
        next(err);
    }
}

/**
 * POST /integrations/strava/import
 * Importa le attività di corsa da Strava e le salva come Run.
 */
async function importActivities(req, res, next) {
    try {
        const userId = req.user.userId;

        const account = await prisma.stravaAccount.findUnique({
            where: { userId },
        });

        if (!account) {
            return res.status(400).json({ message: "Account Strava non collegato" });
        }

        // Refresh token se scaduto
        const refreshResult = await refreshAccessToken(account);
        let accessToken;

        if (typeof refreshResult === "string") {
            accessToken = refreshResult;
        } else {
            accessToken = refreshResult.accessToken;
            await prisma.stravaAccount.update({
                where: { userId },
                data: {
                    accessToken: refreshResult.accessToken,
                    refreshToken: refreshResult.refreshToken,
                    expiresAt: refreshResult.expiresAt,
                },
            });
        }

        // Recupera attività da Strava (ultime 30)
        const activities = await fetchActivities(accessToken);

        // Filtra solo le corse (type = "Run")
        const runs = activities.filter((a) => a.type === "Run");

        if (runs.length === 0) {
            return res.json({ imported: 0, message: "Nessuna corsa trovata su Strava" });
        }

        // Recupera date esistenti per evitare duplicati
        const existingRuns = await prisma.run.findMany({
            where: { userId },
            select: { date: true, distanceKm: true },
        });

        const existingSet = new Set(
            existingRuns.map((r) => `${r.date.toISOString().slice(0, 10)}_${Number(r.distanceKm).toFixed(2)}`)
        );

        const newRuns = [];
        for (const activity of runs) {
            const mapped = mapStravaActivityToRun(activity, userId);
            const key = `${mapped.date.toISOString().slice(0, 10)}_${mapped.distanceKm.toFixed(2)}`;

            if (!existingSet.has(key)) {
                newRuns.push(mapped);
                existingSet.add(key);
            }
        }

        if (newRuns.length > 0) {
            await prisma.run.createMany({ data: newRuns });
        }

        return res.json({
            imported: newRuns.length,
            skipped: runs.length - newRuns.length,
            message: newRuns.length > 0
                ? `Importate ${newRuns.length} corse da Strava`
                : "Tutte le corse erano già presenti",
        });
    } catch (err) {
        next(err);
    }
}

/**
 * DELETE /integrations/strava/disconnect
 * Scollega l'account Strava.
 */
async function disconnectStrava(req, res, next) {
    try {
        const userId = req.user.userId;

        const account = await prisma.stravaAccount.findUnique({
            where: { userId },
        });

        if (!account) {
            return res.status(400).json({ message: "Account Strava non collegato" });
        }

        await prisma.stravaAccount.delete({ where: { userId } });

        return res.json({ ok: true, message: "Account Strava scollegato" });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    stravaStatus,
    connectStrava,
    stravaCallback,
    importActivities,
    disconnectStrava,
};
