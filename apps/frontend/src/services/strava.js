import { apiFetch } from "./api";

export function getStravaStatus(token) {
    return apiFetch("/integrations/strava/status", { token });
}

export function importStravaActivities(token) {
    return apiFetch("/integrations/strava/import", { method: "POST", token });
}

export function disconnectStrava(token) {
    return apiFetch("/integrations/strava/disconnect", { method: "DELETE", token });
}

/**
 * L'URL di connessione Strava è un redirect lato server.
 * Il frontend deve aprirlo come navigazione diretta (window.location),
 * non come fetch, perché serve il cookie/redirect di Strava.
 */
export function getStravaConnectUrl(token) {
    const base = import.meta.env.VITE_API_URL || "http://localhost:4000";
    return `${base}/integrations/strava/connect?token=${encodeURIComponent(token)}`;
}
