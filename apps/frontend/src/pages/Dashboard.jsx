import { useAuth } from "../context/AuthContext";
import { useStats } from "../hooks/useStats";
import { formatPace, formatDuration } from "../utils/format";
import Button from "../components/ui/Button";
import StatCard from "../components/ui/StatCard";
import WeeklyChart from "../components/charts/WeeklyChart";
import Alert from "../components/ui/Alert";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const { summary, weekly, loading: statsLoading, error } = useStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Bentornato, <span className="font-semibold text-slate-700">{user?.name}</span>
                        </p>
                    </div>
                    <Button
                        className="bg-white !text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50"
                        onClick={logout}
                    >
                        Logout
                    </Button>
                </div>

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
                {weekly?.series && <WeeklyChart data={weekly.series} />}
            </div>
        </div>
    );
}
