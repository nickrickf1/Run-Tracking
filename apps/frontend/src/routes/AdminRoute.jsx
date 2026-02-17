import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AppShell from "../components/layout/AppShell";

export default function AdminRoute({ children }) {
    const { loading, token, user } = useAuth();
    if (loading) return <div className="p-6">Loading...</div>;
    if (!token) return <Navigate to="/login" replace />;
    if (user?.role !== "admin") {
        return (
            <AppShell title="Accesso negato">
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                        <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                    </div>
                    <h2 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">Accesso riservato</h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                        Questa sezione è accessibile solo agli amministratori.
                    </p>
                    <Link
                        to="/dashboard"
                        className="mt-6 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                    >
                        Torna alla Dashboard
                    </Link>
                </div>
            </AppShell>
        );
    }
    return children;
}
