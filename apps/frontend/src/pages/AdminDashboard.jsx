import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import StatCard from "../components/ui/StatCard";
import Alert from "../components/ui/Alert";
import { CardSkeleton } from "../components/ui/Skeleton";
import { useAuth } from "../context/AuthContext";
import { getAdminDashboard } from "../services/admin";
import { formatDuration } from "../utils/format";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function AdminDashboard() {
    const { token } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await getAdminDashboard(token);
                setData(res);
            } catch (e) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    return (
        <AppShell title="Admin Dashboard">
            {error && <Alert>{error}</Alert>}

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : data ? (
                <>
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <StatCard label="Utenti totali" value={data.totalUsers} />
                        <StatCard label="Corse totali" value={data.totalRuns} />
                        <StatCard label="Km totali" value={data.totalDistanceKm.toFixed(1)} />
                        <StatCard label="Tempo totale" value={formatDuration(data.totalDurationSec)} />
                    </div>

                    {data.registrationSeries?.length > 0 && (
                        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                            <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Registrazioni per mese
                            </h2>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={data.registrationSeries}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                    <Tooltip />
                                    <Bar dataKey="count" name="Registrazioni" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {data.recentUsers?.length > 0 && (
                        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                            <h2 className="mb-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Ultimi utenti registrati
                            </h2>
                            <div className="space-y-2">
                                {data.recentUsers.map((u) => (
                                    <Link
                                        key={u.id}
                                        to={`/admin/users/${u.id}`}
                                        className="flex items-center justify-between rounded-xl px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <div>
                                            <span className="font-medium text-slate-800 dark:text-slate-200">{u.name}</span>
                                            <span className="ml-2 text-slate-500 dark:text-slate-400">{u.email}</span>
                                        </div>
                                        <span className="text-xs text-slate-400">
                                            {new Date(u.createdAt).toLocaleDateString("it-IT")}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-sm text-slate-400">Nessun dato disponibile.</p>
            )}
        </AppShell>
    );
}
