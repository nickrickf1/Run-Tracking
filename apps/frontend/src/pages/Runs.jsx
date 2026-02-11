import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import Input from "../components/ui/Input";
import { useAuth } from "../context/AuthContext";
import { deleteRun, listRuns } from "../services/runs";

const TYPES = ["", "lento", "tempo", "variato", "lungo", "gara", "forza"];

function formatDate(iso) {
    try {
        return new Date(iso).toISOString().slice(0, 10);
    } catch {
        return iso;
    }
}

function formatPace(distanceKm, durationSec) {
    const d = Number(distanceKm);
    const t = Number(durationSec);
    if (!d || !t) return "-";
    const pace = t / d;
    const m = Math.floor(pace / 60);
    const s = Math.round(pace % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} / km`;
}

export default function Runs() {
    const { token } = useAuth();
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(true);

    // filtri
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [type, setType] = useState("");

    // paginazione
    const [page, setPage] = useState(1);
    const pageSize = 5;

    const [data, setData] = useState({ runs: [], total: 0, page: 1, pageSize });

    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil((data.total || 0) / pageSize));
    }, [data.total]);

    async function load(p = page, filters = { from, to, type }) {
        setErr("");
        setLoading(true);
        try {
            const res = await listRuns(token, {
                page: p,
                pageSize,
                from: filters.from || undefined,
                to: filters.to || undefined,
                type: filters.type || undefined,
            });
            setData(res);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    // carica iniziale
    useEffect(() => {
        load(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // quando cambi filtri, riparti da pagina 1
    async function onApplyFilters(e) {
        e.preventDefault();
        setPage(1);
        await load(1);
    }

    async function onClearFilters() {
        setFrom("");
        setTo("");
        setType("");
        setPage(1);
        await load(1, { from: "", to: "", type: "" });
    }

    async function onDelete(id) {
        if (!confirm("Eliminare questa corsa?")) return;
        try {
            await deleteRun(token, id);
            const newPage = Math.min(page, Math.max(1, Math.ceil((data.total - 1) / pageSize)));
            setPage(newPage);
            await load(newPage);
        } catch (e) {
            setErr(e.message);
        }
    }

    async function goToPage(p) {
        const next = Math.min(Math.max(1, p), totalPages);
        setPage(next);
        await load(next);
    }

    return (
        <AppShell
            title="Corse"
            right={
                <Link to="/runs/new">
                    <Button>+ Nuova corsa</Button>
                </Link>
            }
        >
            {err && <Alert>{err}</Alert>}

            {/* Filtri */}
            <form
                onSubmit={onApplyFilters}
                className="mt-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 grid gap-4 md:grid-cols-4 dark:bg-slate-900 dark:ring-slate-800 transition-colors"
            >
                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Da</label>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">A</label>
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipo</label>
                    <select
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-700"
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                    >
                        {TYPES.map((t) => (
                            <option key={t} value={t}>
                                {t === "" ? "Tutti" : t}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-end gap-2">
                    <Button type="submit" className="w-full">Applica</Button>
                    <Button
                        type="button"
                        onClick={onClearFilters}
                        className="w-full bg-white !text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:!text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                    >
                        Reset
                    </Button>
                </div>
            </form>

            {/* Lista */}
            <div className="mt-4 space-y-3">
                {loading ? (
                    <div className="text-sm text-slate-500">Caricamento...</div>
                ) : data.runs.length === 0 ? (
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 text-sm text-slate-500 dark:bg-slate-900 dark:ring-slate-800">
                        Nessuna corsa trovata.
                    </div>
                ) : (
                    data.runs.map((r) => (
                        <div
                            key={r.id}
                            className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 flex items-center justify-between gap-4 transition-shadow hover:shadow-md dark:bg-slate-900 dark:ring-slate-800"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(r.date)}</div>
                                    <span className="text-xs rounded-full bg-slate-100 px-2.5 py-1 font-medium dark:bg-slate-800 dark:text-slate-300">{r.type}</span>
                                    {r.rpe != null && (
                                        <span className="text-xs rounded-full bg-slate-100 px-2.5 py-1 font-medium dark:bg-slate-800 dark:text-slate-300">RPE {r.rpe}</span>
                                    )}
                                </div>

                                <div className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{Number(r.distanceKm).toFixed(1)} km</span>{" "}
                                    · {Math.round(Number(r.durationSec) / 60)} min · {formatPace(r.distanceKm, r.durationSec)}
                                </div>

                                {r.notes && <div className="mt-1 text-sm text-slate-500 dark:text-slate-500 truncate">{r.notes}</div>}
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <Link to={`/runs/${r.id}/edit`}>
                                    <Button className="bg-white !text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:!text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700">
                                        Modifica
                                    </Button>
                                </Link>
                                <Button
                                    className="bg-white !text-red-600 border border-red-200 hover:bg-red-50 dark:bg-slate-800 dark:!text-red-400 dark:border-red-900 dark:hover:bg-red-950"
                                    onClick={() => onDelete(r.id)}
                                >
                                    Elimina
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Paginazione */}
            {!loading && data.total > 0 && (
                <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                        Pagina <span className="font-semibold text-slate-700 dark:text-slate-200">{data.page}</span> di{" "}
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{totalPages}</span> · {data.total} corse
                    </div>

                    <div className="flex gap-2">
                        <Button
                            className="bg-white !text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:!text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                            onClick={() => goToPage(page - 1)}
                            disabled={page <= 1 || loading}
                        >
                            ←
                        </Button>
                        <Button
                            className="bg-white !text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:!text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                            onClick={() => goToPage(page + 1)}
                            disabled={page >= totalPages || loading}
                        >
                            →
                        </Button>
                    </div>
                </div>
            )}
        </AppShell>
    );
}
