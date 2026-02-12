import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useStats() {
    const { token } = useAuth();
    const [summary, setSummary] = useState(null);
    const [weekly, setWeekly] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) return;

        const controller = new AbortController();

        async function load() {
            try {
                const [s, w] = await Promise.all([
                    apiFetch("/stats/summary", { token, signal: controller.signal }),
                    apiFetch("/stats/weekly?weeks=12", { token, signal: controller.signal }),
                ]);
                setSummary(s);
                setWeekly(w);
            } catch (err) {
                if (err.name === "AbortError") return;
                console.error("useStats error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();

        return () => controller.abort();
    }, [token]);

    return { summary, weekly, loading, error };
}
