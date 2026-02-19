import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";

const DAYS = ["L", "M", "M", "G", "V", "S", "D"];

function getIntensityClass(count) {
    if (count === 0) return "bg-slate-100 dark:bg-slate-800";
    if (count === 1) return "bg-emerald-200 dark:bg-emerald-900";
    if (count === 2) return "bg-emerald-400 dark:bg-emerald-700";
    return "bg-emerald-600 dark:bg-emerald-500";
}

export default function RunCalendar() {
    const { token } = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch("/stats/calendar?months=4", { token });
                setData(res);
            } catch {
                // silently fail
            }
        })();
    }, [token]);

    if (!data) return null;

    // Build a map of date -> count
    const countMap = {};
    for (const e of data.entries) {
        countMap[e.date] = e.count;
    }

    // Generate weeks for last ~4 months
    const weeks = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Go back to the Monday of the week ~16 weeks ago
    const start = new Date(today);
    start.setDate(start.getDate() - (start.getDay() === 0 ? 6 : start.getDay() - 1)); // this Monday
    start.setDate(start.getDate() - 7 * 17); // 17 weeks back

    let current = new Date(start);
    while (current <= today) {
        const week = [];
        for (let d = 0; d < 7; d++) {
            const dateStr = current.toISOString().slice(0, 10);
            week.push({
                date: dateStr,
                count: countMap[dateStr] || 0,
                future: current > today,
            });
            current.setDate(current.getDate() + 1);
        }
        weeks.push(week);
    }

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Calendario corse
            </h3>
            <div className="flex gap-1 overflow-x-auto">
                <div className="flex flex-col gap-1 mr-1 shrink-0">
                    {DAYS.map((d, i) => (
                        <div key={i} className="h-3 w-3 text-[8px] leading-3 text-slate-400 text-right">
                            {i % 2 === 0 ? d : ""}
                        </div>
                    ))}
                </div>
                {weeks.map((week, wi) => (
                    <div key={wi} className="flex flex-col gap-1">
                        {week.map((day) => (
                            <div
                                key={day.date}
                                title={day.future ? "" : `${day.date}: ${day.count} cors${day.count === 1 ? "a" : "e"}`}
                                className={`h-3 w-3 rounded-sm transition-colors ${
                                    day.future
                                        ? "bg-transparent"
                                        : getIntensityClass(day.count)
                                }`}
                            />
                        ))}
                    </div>
                ))}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-slate-400">
                <span>Meno</span>
                <div className="h-2.5 w-2.5 rounded-sm bg-slate-100 dark:bg-slate-800" />
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-200 dark:bg-emerald-900" />
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-400 dark:bg-emerald-700" />
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-600 dark:bg-emerald-500" />
                <span>Di piu</span>
            </div>
        </div>
    );
}
