const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const app = require("./app");

// Variabili obbligatorie
const required = ["DATABASE_URL", "JWT_SECRET"];
for (const key of required) {
    if (!process.env[key]) {
        console.error(`Variabile d'ambiente mancante: ${key}`);
        process.exit(1);
    }
}

// Avvisi per variabili opzionali
const optional = ["STRAVA_CLIENT_ID", "STRAVA_CLIENT_SECRET", "STRAVA_REDIRECT_URI"];
const missing = optional.filter((k) => !process.env[k]);
if (missing.length > 0) {
    console.warn(`Integrazione Strava disabilitata: mancano ${missing.join(", ")}`);
}

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`API running on http://localhost:${PORT}`);
});