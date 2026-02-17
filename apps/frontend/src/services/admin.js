import { apiFetch } from "./api";

export async function getUsers(token, { page = 1, search = "" } = {}) {
    const params = new URLSearchParams({ page, pageSize: 20 });
    if (search) params.set("search", search);
    return apiFetch(`/admin/users?${params}`, { token });
}

export async function getUserDetail(token, userId) {
    return apiFetch(`/admin/users/${userId}`, { token });
}

export async function getAdminDashboard(token) {
    return apiFetch("/admin/dashboard", { token });
}
