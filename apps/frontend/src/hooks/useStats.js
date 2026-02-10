import { useEffect, useState } from "react";
import { apiFetch } from "../services/api";
import { useAuth } from "../context/AuthContext";

export function useStats() {
    const { token } = useAuth();
    const [summary, setSummary] = useState(null);
    const [weekly, setWeekly] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        async function load() {
            try {
                const [s, w] = await Promise.all([
                    apiFetch("/stats/summary", { token }),
                    apiFetch("/stats/weekly?weeks=12", { token }),
                ]);
                setSummary(s);
                setWeekly(w);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [token]);

    return { summary, weekly, loading };
}
