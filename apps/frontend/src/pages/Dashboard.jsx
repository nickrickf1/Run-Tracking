import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";

export default function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="mx-auto max-w-5xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">Dashboard</h1>
                        <p className="text-sm text-slate-600">
                            Bentornato, <span className="font-medium text-slate-900">{user?.name}</span>
                        </p>
                    </div>
                    <Button className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50" onClick={logout}>
                        Logout
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white p-4 shadow">
                        <p className="text-xs text-slate-500">Email</p>
                        <p className="mt-1 text-sm font-medium">{user?.email}</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow">
                        <p className="text-xs text-slate-500">Stato</p>
                        <p className="mt-1 text-sm font-medium">Autenticato ✅</p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow">
                        <p className="text-xs text-slate-500">Prossimo</p>
                        <p className="mt-1 text-sm font-medium">Statistiche & Grafici</p>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow">
                    <p className="text-sm font-medium">To-do UI</p>
                    <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 space-y-1">
                        <li>Navbar + link (Dashboard, Runs)</li>
                        <li>Cards KPI (summary)</li>
                        <li>Grafico settimanale (weekly)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
