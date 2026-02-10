import { useAuth } from "../context/AuthContext";
import { useStats } from "../hooks/useStats";
import { formatPace, formatDuration } from "../utils/format";
import AppShell from "../components/layout/AppShell";
import StatCard from "../components/ui/StatCard";
import WeeklyChart from "../components/charts/WeeklyChart";
import Alert from "../components/ui/Alert";

export default function Dashboard() {
    const { user } = useAuth();
    const { summary, weekly, loading: statsLoading, error } = useStats();

    return (
        <AppShell title="Dashboard">
            <p className="mb-6 text-sm text-slate-500">
                Bentornato, <span className="font-semibold text-slate-700">{user?.name}</span>
            </p>

            {/* Error */}
            {error && <Alert>{error}</Alert>}

            {/* Stats cards */}
            {statsLoading ? (
                <p className="text-sm text-slate-400">Caricamento statistiche...</p>
            ) : summary ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <StatCard label="Corse totali" value={summary.totalRuns} />
                    <StatCard label="Km totali" value={summary.totalDistanceKm.toFixed(1)} />
                    <StatCard label="Tempo totale" value={formatDuration(summary.totalDurationSec)} />
                    <StatCard label="Passo medio" value={formatPace(summary.avgPaceSecPerKm)} />
                </div>
            ) : (
                <p className="text-sm text-slate-400">Nessuna statistica disponibile.</p>
            )}

            {/* Weekly chart */}
            {weekly?.series && <div className="mt-6"><WeeklyChart data={weekly.series} /></div>}
        </AppShell>
    );
}
