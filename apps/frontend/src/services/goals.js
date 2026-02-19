import { apiFetch } from "./api";

export function getWeeklyGoal(token) {
    return apiFetch("/goals/weekly", { token });
}

export function setWeeklyGoal(token, goals) {
    return apiFetch("/goals/weekly", { method: "PUT", token, body: goals });
}
