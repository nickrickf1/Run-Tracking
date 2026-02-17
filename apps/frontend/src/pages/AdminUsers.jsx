import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "../services/admin";
import { formatDate } from "../utils/format";

export default function AdminUsers() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await getUsers(token);
                if (!cancelled) setUsers(data.users);
            } catch (e) {
                if (!cancelled) setErr(e.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [token]);

    return (
        <AppShell title="Gestione Utenti">
            {err && <Alert>{err}</Alert>}

            {loading ? (
                <p className="text-sm text-slate-400">Caricamento utenti...</p>
            ) : users.length === 0 ? (
                <p className="text-sm text-slate-400">Nessun utente registrato.</p>
            ) : (
                <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Nome</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Email</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Ruolo</th>
                                <th className="px-4 py-3 text-right font-semibold text-slate-700 dark:text-slate-300">Corse</th>
                                <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">Registrato</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.id} className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
                                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{u.email}</td>
                                    <td className="px-4 py-3">
                                        <span className={[
                                            "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                                            u.role === "admin"
                                                ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                                                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                                        ].join(" ")}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">
                                        {u._count.runs}
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                                        {formatDate(u.createdAt)}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <Link
                                            to={`/admin/users/${u.id}`}
                                            className="text-sm font-medium text-slate-900 underline underline-offset-4 hover:text-slate-600 dark:text-white dark:hover:text-slate-300"
                                        >
                                            Dettaglio
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </AppShell>
    );
}
