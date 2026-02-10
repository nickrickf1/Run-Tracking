const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function apiFetch(path, { method = "GET", body, token } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    // prova a parsare json anche in caso di errore
    const text = await res.text();
    const data = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : null;

    if (!res.ok) {
        const message = data?.message || `HTTP ${res.status}`;
        throw new Error(message);
    }

    return data;
}
