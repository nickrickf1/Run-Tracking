import { useAuth } from "../context/AuthContext";
import { useStats } from "../hooks/useStats";
import { formatPace, formatDuration } from "../utils/format";
import AppShell from "../components/layout/AppShell";
import StatCard from "../components/ui/StatCard";
import WeeklyChart from "../components/charts/WeeklyChart";
import Alert from "../components/ui/Alert";
import { CardSkeleton } from "../components/ui/Skeleton";
import WeeklyGoalWidget from "../components/ui/WeeklyGoalWidget";
import PersonalBests from "../components/ui/PersonalBests";
import StreakWidget from "../components/ui/StreakWidget";
import RunCalendar from "../components/ui/RunCalendar";

export default function Dashboard() {
    const { user } = useAuth();
    const { summary, weekly, loading: statsLoading, error } = useStats();

    return (
        <AppShell title="Dashboard">
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
                Bentornato, <span className="font-semibold text-slate-700 dark:text-slate-200">{user?.name}</span>
            </p>

            {error && <Alert>{error}</Alert>}

            {statsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
                </div>
            ) : summary ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    <StatCard label="Corse totali" value={summary.totalRuns} />
                    <StatCard label="Km totali" value={summary.totalDistanceKm.toFixed(1)} />
                    <StatCard label="Tempo totale" value={formatDuration(summary.totalDurationSec)} />
                    <StatCard label="Passo medio" value={formatPace(summary.totalDistanceKm, summary.totalDurationSec)} />
                </div>
            ) : (
                <p className="text-sm text-slate-400">Nessuna statistica disponibile.</p>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
                <WeeklyGoalWidget />
                <StreakWidget />
            </div>

            <div className="mt-6">
                <PersonalBests />
            </div>

            <div className="mt-6">
                <RunCalendar />
            </div>

            {weekly?.series && <div className="mt-6"><WeeklyChart data={weekly.series} /></div>}
        </AppShell>
    );
}
