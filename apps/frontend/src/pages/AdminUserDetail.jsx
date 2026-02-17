import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Alert from "../components/ui/Alert";
import StatCard from "../components/ui/StatCard";
import { useAuth } from "../context/AuthContext";
import { getUserDetail } from "../services/admin";
import { formatDate, formatPace, formatDuration } from "../utils/format";

export default function AdminUserDetail() {
    const { token } = useAuth();
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getUserDetail(token, id);
                if (!cancelled) setUser(data.user);
            } catch (e) {
                if (!cancelled) setErr(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [token, id]);

    const totalKm = user?.runs?.reduce((s, r) => s + Number(r.distanceKm), 0) || 0;
    const totalSec = user?.runs?.reduce((s, r) => s + r.durationSec, 0) || 0;

    return (
        <AppShell
            title={loading ? "Caricamento..." : user ? user.name : "Utente non trovato"}
        >
            <Link
                to="/admin/users"
                className="mb-4 inline-block text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
                &larr; Torna alla lista
            </Link>

            {err && <Alert>{err}</Alert>}

            {loading ? (
                <p className="text-sm text-slate-400">Caricamento...</p>
            ) : user ? (
                <div className="space-y-6">
                    {/* Info utente */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                        <div className="flex flex-wrap items-center gap-3">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user.name}</h2>
                            <span className={[
                                "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                                user.role === "admin"
                                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                            ].join(" ")}>
                                {user.role}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                        <p className="mt-1 text-xs text-slate-400">Registrato il {formatDate(user.createdAt)}</p>
                    </div>

                    {/* Statistiche rapide */}
                    <div className="grid gap-4 sm:grid-cols-3">
                        <StatCard label="Corse" value={user.runs.length} />
                        <StatCard label="Km totali" value={totalKm.toFixed(1)} />
                        <StatCard label="Passo medio" value={formatPace(totalKm, totalSec)} />
                    </div>

                    {/* Ultime corse */}
                    {user.runs.length > 0 && (
                        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-sm font-bold text-slate-800 dark:text-white">Ultime corse</h3>
                            </div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Data</th>
                                        <th className="px-4 py-2 text-right font-semibold text-slate-700 dark:text-slate-300">Km</th>
                                        <th className="px-4 py-2 text-right font-semibold text-slate-700 dark:text-slate-300">Durata</th>
                                        <th className="px-4 py-2 text-right font-semibold text-slate-700 dark:text-slate-300">Passo</th>
                                        <th className="px-4 py-2 text-left font-semibold text-slate-700 dark:text-slate-300">Tipo</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {user.runs.map((r) => (
                                        <tr key={r.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
                                            <td className="px-4 py-2 text-slate-900 dark:text-white">{formatDate(r.date)}</td>
                                            <td className="px-4 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                                {Number(r.distanceKm).toFixed(1)}
                                            </td>
                                            <td className="px-4 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                                {formatDuration(r.durationSec, { showSeconds: true })}
                                            </td>
                                            <td className="px-4 py-2 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                                {formatPace(Number(r.distanceKm), r.durationSec)}
                                            </td>
                                            <td className="px-4 py-2 text-slate-500 dark:text-slate-400">{r.type}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ) : (
                <p className="text-sm text-slate-400">Utente non trovato.</p>
            )}
        </AppShell>
    );
}
