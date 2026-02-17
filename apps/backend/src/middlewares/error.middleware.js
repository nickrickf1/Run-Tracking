const logger = require("../lib/logger");

/**
 * Middleware centralizzato per la gestione degli errori.
 * Cattura tutti gli errori non gestiti nei controller.
 */
function errorMiddleware(err, req, res, _next) {
    logger.error({ err, method: req.method, url: req.originalUrl }, "Unhandled error");

    // Errori di validazione Zod passati manualmente
    if (err.status) {
        return res.status(err.status).json({ message: err.message });
    }

    // Errori Prisma noti
    if (err.code === "P2025") {
        return res.status(404).json({ message: "Risorsa non trovata" });
    }

    // Default: errore generico (non espone dettagli interni)
    return res.status(500).json({ message: "Errore interno del server" });
}

module.exports = { errorMiddleware };
