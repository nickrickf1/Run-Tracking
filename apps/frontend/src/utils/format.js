export function formatPace(secPerKm) {
    if (!secPerKm || !isFinite(secPerKm)) return "-";
    const min = Math.floor(secPerKm / 60);
    const sec = Math.round(secPerKm % 60);
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")} / km`;
}

export function formatDuration(sec) {
    if (!sec) return "0";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return h ? `${h}h ${m}m` : `${m}m`;
}
