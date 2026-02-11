import { apiFetch } from "./api";

export function updateMe(token, body) {
    return apiFetch("/users/me", { method: "PATCH", token, body });
}

export function changeMyPassword(token, body) {
    return apiFetch("/users/me/password", { method: "PATCH", token, body });
}
