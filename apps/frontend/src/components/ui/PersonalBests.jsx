import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../services/api";
import { formatPace, formatDuration, formatDate } from "../../utils/format";

export default function PersonalBests() {
    const { token } = useAuth();
    const [data, setData] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await apiFetch("/stats/personal-bests", { token });
                setData(res);
            } catch {
                // silently fail
            }
        })();
    }, [token]);

    if (!data) return null;

    const { distances, bestPace, longestRun } = data;
    const hasAnyPB = distances.some((d) => d.run) || bestPace || longestRun;

    if (!hasAnyPB) return null;

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <h3 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Personal Best
            </h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {distances.map((d) =>
                    d.run ? (
                        <PBCard
                            key={d.label}
                            label={d.label}
                            time={formatDuration(d.run.durationSec, { showSeconds: true })}
                            pace={formatPace(d.run.distanceKm, d.run.durationSec)}
                            date={formatDate(d.run.date)}
                        />
                    ) : null
                )}

                {bestPace && (
                    <PBCard
                        label="Miglior passo"
                        time={formatPace(bestPace.distanceKm, bestPace.durationSec)}
                        pace={`${bestPace.distanceKm.toFixed(1)} km`}
                        date={formatDate(bestPace.date)}
                    />
                )}

                {longestRun && (
                    <PBCard
                        label="Corsa piu lunga"
                        time={`${longestRun.distanceKm.toFixed(1)} km`}
                        pace={formatDuration(longestRun.durationSec, { showSeconds: true })}
                        date={formatDate(longestRun.date)}
                    />
                )}
            </div>
        </div>
    );
}

function PBCard({ label, time, pace, date }) {
    return (
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{time}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
                {pace} &middot; {date}
            </p>
        </div>
    );
}
