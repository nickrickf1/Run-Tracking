/**
 * Calcola e formatta il passo (pace) dato distanza e durata.
 * @param {number} distanceKm - distanza in km
 * @param {number} durationSec - durata totale in secondi
 * @returns {string} es. "05:30 / km"
 */
export function formatPace(distanceKm, durationSec) {
    const d = Number(distanceKm);
    const t = Number(durationSec);
    if (!d || !t || d <= 0 || t <= 0) return "-";
    const pace = t / d;
    const m = Math.floor(pace / 60);
    const s = Math.round(pace % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} / km`;
}

/**
 * Formatta una durata in secondi in formato leggibile.
 * @param {number} sec - secondi totali
 * @param {object} opts
 * @param {boolean} opts.showSeconds - mostra anche i secondi (default false)
 * @returns {string} es. "1h 32m" oppure "92m 15s"
 */
export function formatDuration(sec, { showSeconds = false } = {}) {
    const t = Number(sec);
    if (!t || t <= 0) return "-";
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    if (showSeconds) {
        return h
            ? `${h}h ${m}m ${String(s).padStart(2, "0")}s`
            : `${m}m ${String(s).padStart(2, "0")}s`;
    }
    return h ? `${h}h ${m}m` : `${m}m`;
}

/**
 * Formatta una data ISO in YYYY-MM-DD.
 */
export function formatDate(iso) {
    try {
        return new Date(iso).toISOString().slice(0, 10);
    } catch {
        return String(iso);
    }
}

/**
 * Converte un valore stringa in intero, restituendo 0 se non valido.
 */
export function toIntOrZero(v) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

/**
 * Limita un numero in un range [min, max].
 */
export function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
