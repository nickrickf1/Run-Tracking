import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { getUsers } from "../services/admin";
import { formatDate } from "../utils/format";

export default function AdminUsers() {
    const { token } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const pageSize = 20;

    const fetchUsers = useCallback(async (p, s) => {
        setLoading(true);
        setErr("");
        try {
            const data = await getUsers(token, { page: p, search: s });
            setUsers(data.users);
            setTotal(data.total);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchUsers(page, search);
    }, [page, search, fetchUsers]);

    function onSearch(e) {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput.trim());
    }

    const totalPages = Math.ceil(total / pageSize);

    return (
        <AppShell title="Gestione Utenti">
            {err && <Alert>{err}</Alert>}

            {/* Barra ricerca */}
            <form onSubmit={onSearch} className="mb-4 flex gap-2">
                <Input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Cerca per nome o email..."
                    className="max-w-sm"
                />
                <button
                    type="submit"
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
                >
                    Cerca
                </button>
                {search && (
                    <button
                        type="button"
                        onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        Annulla
                    </button>
                )}
            </form>

            {search && (
                <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
                    {total} risultat{total === 1 ? "o" : "i"} per &ldquo;{search}&rdquo;
                </p>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                    ))}
                </div>
            ) : users.length === 0 ? (
                <p className="text-sm text-slate-400">
                    {search ? "Nessun utente trovato." : "Nessun utente registrato."}
                </p>
            ) : (
                <>
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

                    {/* Paginazione */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Pagina {page} di {totalPages} ({total} utenti)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page <= 1}
                                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Precedente
                                </button>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page >= totalPages}
                                    className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                >
                                    Successiva
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </AppShell>
    );
}
