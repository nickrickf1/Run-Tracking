import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

export default function Dashboard() {
    const { user, logout } = useAuth();

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

                {/* Stats cards */}
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Email</p>
                        <p className="mt-2 text-sm font-semibold text-slate-800">{user?.email}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Stato</p>
                        <p className="mt-2 text-sm font-semibold text-emerald-600">Autenticato</p>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md">
                        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Prossimo</p>
                        <p className="mt-2 text-sm font-semibold text-slate-800">Statistiche & Grafici</p>
                    </div>
                </div>

                {/* Roadmap card */}
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                    <p className="text-sm font-bold text-slate-800">Prossimi passi</p>
                    <ul className="mt-3 space-y-2 text-sm text-slate-600">
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            Navbar + link (Dashboard, Runs)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            Cards KPI (summary)
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                            Grafico settimanale (weekly)
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
