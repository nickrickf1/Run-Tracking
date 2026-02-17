import { apiFetch } from "./api";

export async function getUsers(token) {
    return apiFetch("/admin/users", { token });
}

export async function getUserDetail(token, userId) {
    return apiFetch(`/admin/users/${userId}`, { token });
}
