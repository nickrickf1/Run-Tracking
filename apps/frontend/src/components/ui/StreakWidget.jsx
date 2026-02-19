import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

export default function StreakWidget() {
    const { token } = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch("/stats/streak", { token });
                setData(res);
            } catch {
                // silently fail
            }
        })();
    }, [token]);

    if (!data || (data.currentWeekStreak === 0 && data.bestWeekStreak === 0)) return null;

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Streak di allenamento
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {data.currentWeekStreak}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        {data.currentWeekStreak === 1 ? "settimana" : "settimane"} consecutive
                    </p>
                    {data.currentWeekStreak >= 4 && (
                        <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
                            In forma!
                        </span>
                    )}
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {data.bestWeekStreak}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">miglior streak</p>
                    {data.bestWeekStreak >= 8 && (
                        <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                            Leggenda!
                        </span>
                    )}
                </div>
                <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {data.totalWeeksWithRuns}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">settimane attive</p>
                </div>
            </div>
        </div>
    );
}
