const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

let refreshPromise = null;

async function tryRefreshToken(oldToken) {
    if (refreshPromise) return refreshPromise;

    refreshPromise = (async () => {
        try {
            const res = await fetch(`${BASE_URL}/auth/refresh`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${oldToken}`,
                },
            });
            if (!res.ok) return null;
            const data = await res.json();
            if (data.token) {
                localStorage.setItem("token", data.token);
                return data.token;
            }
            return null;
        } catch {
            return null;
        } finally {
            refreshPromise = null;
        }
    })();

    return refreshPromise;
}

export async function apiFetch(path, { method = "GET", body, token, signal } = {}) {
    const headers = { "Content-Type": "application/json" };
    if (token) headers.Authorization = `Bearer ${token}`;

    let res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal,
    });

    // Se 401 e abbiamo un token, prova a rinnovarlo
    if (res.status === 401 && token && !path.includes("/auth/refresh")) {
        const newToken = await tryRefreshToken(token);
        if (newToken) {
            headers.Authorization = `Bearer ${newToken}`;
            res = await fetch(`${BASE_URL}${path}`, {
                method,
                headers,
                body: body ? JSON.stringify(body) : undefined,
                signal,
            });
            // Aggiorna il token nel contesto tramite evento custom
            window.dispatchEvent(new CustomEvent("token-refreshed", { detail: newToken }));
        }
    }

    const text = await res.text();
    const data = text ? (() => { try { return JSON.parse(text); } catch { return { raw: text }; } })() : null;

    if (!res.ok) {
        const message = data?.message || `HTTP ${res.status}`;
        throw new Error(message);
    }

    return data;
}
