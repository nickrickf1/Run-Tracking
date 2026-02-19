import { apiFetch } from "./api";

export function listRuns(token, { page = 1, pageSize = 10, from, to, type, search } = {}) {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (type) params.set("type", type);
    if (search) params.set("search", search);
    return apiFetch(`/runs?${params.toString()}`, { token });
}

export function getRun(token, id, { signal } = {}) {
    return apiFetch(`/runs/${id}`, { token, signal });
}

export function createRun(token, body) {
    return apiFetch("/runs", { method: "POST", token, body });
}

export function updateRun(token, id, body) {
    return apiFetch(`/runs/${id}`, { method: "PATCH", token, body });
}

export function deleteRun(token, id) {
    return apiFetch(`/runs/${id}`, { method: "DELETE", token });
}

export async function importGpx(token, file) {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch(`${BASE_URL}/runs/import/gpx`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Errore durante l'importazione");
    return data;
}

export async function exportRunsCsv(token) {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
    const res = await fetch(`${BASE_URL}/runs/export/csv`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Errore durante l'esportazione");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "corse.csv";
    a.click();
    URL.revokeObjectURL(url);
}
