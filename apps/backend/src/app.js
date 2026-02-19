const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const runsRoutes = require('./routes/runs.routes');
const statsRoutes = require('./routes/stats.routes');
const usersRoutes = require('./routes/users.routes');
const { errorMiddleware } = require('./middlewares/error.middleware');
const stravaRoutes = require("./integrations/strava/strava.routes");
const adminRoutes = require("./routes/admin.routes");
const goalsRoutes = require("./routes/goals.routes");

const app = express();

// --- Sicurezza ---
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
    process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error("Non consentito da CORS"));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: "1mb" }));

// Serve uploaded audio files
const path = require("path");
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// --- Rate limiting su auth ---
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minuti
    max: 20, // max 20 richieste per IP
    message: { message: "Troppe richieste, riprova tra qualche minuto" },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- Rate limiting su admin ---
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: "Troppe richieste admin, riprova tra qualche minuto" },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- Route ---
app.get('/health', (req, res) => {
    res.json({ ok: true });
});

app.use("/auth", authLimiter, authRoutes);
app.use("/runs", runsRoutes);
app.use("/stats", statsRoutes);
app.use("/users", usersRoutes);
app.use("/goals", goalsRoutes);
app.use("/integrations/strava", stravaRoutes);
app.use("/admin", adminLimiter, adminRoutes);

// --- Error handler centralizzato (deve essere l'ultimo middleware) ---
app.use(errorMiddleware);

module.exports = app;
