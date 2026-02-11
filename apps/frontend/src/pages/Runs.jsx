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

    async function load(p = page) {
        setErr("");
        setLoading(true);
        try {
            const res = await listRuns(token, {
                page: p,
                pageSize,
                from: from || undefined,
                to: to || undefined,
                type: type || undefined,
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
        await load(1);
    }

    async function onDelete(id) {
        if (!confirm("Eliminare questa corsa?")) return;
        try {
            await deleteRun(token, id);
            // se cancelli l'ultima della pagina, torna indietro di una pagina
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
                className="mt-4 rounded-2xl bg-white p-4 shadow grid gap-4 md:grid-cols-4"
            >
                <div className="space-y-1">
                    <label className="text-sm font-medium">Da</label>
                    <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">A</label>
                    <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
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
                        className="w-full bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                    >
                        Reset
                    </Button>
                </div>
            </form>

            {/* Lista */}
            <div className="mt-4 space-y-3">
                {loading ? (
                    <div className="text-sm text-slate-600">Caricamento…</div>
                ) : data.runs.length === 0 ? (
                    <div className="rounded-2xl bg-white p-4 shadow text-sm text-slate-600">
                        Nessuna corsa trovata.
                    </div>
                ) : (
                    data.runs.map((r) => (
                        <div
                            key={r.id}
                            className="rounded-2xl bg-white p-4 shadow flex items-center justify-between gap-4"
                        >
                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <div className="text-sm font-semibold">{formatDate(r.date)}</div>
                                    <span className="text-xs rounded-full bg-slate-100 px-2 py-1">{r.type}</span>
                                    {r.rpe != null && (
                                        <span className="text-xs rounded-full bg-slate-100 px-2 py-1">RPE {r.rpe}</span>
                                    )}
                                </div>

                                <div className="mt-1 text-sm text-slate-700">
                                    <span className="font-medium">{Number(r.distanceKm).toFixed(1)} km</span>{" "}
                                    • {Math.round(Number(r.durationSec) / 60)} min • {formatPace(r.distanceKm, r.durationSec)}
                                </div>

                                {r.notes && <div className="mt-1 text-sm text-slate-600 truncate">{r.notes}</div>}
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <Link to={`/runs/${r.id}/edit`}>
                                    <Button className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50">
                                        Modifica
                                    </Button>
                                </Link>
                                <Button
                                    className="bg-white text-red-700 border border-red-200 hover:bg-red-50"
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
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                    Pagina <span className="font-medium">{data.page}</span> di{" "}
                    <span className="font-medium">{totalPages}</span> • Totale: {data.total}
                </div>

                <div className="flex gap-2">
                    <Button
                        className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                        onClick={() => goToPage(page - 1)}
                        disabled={page <= 1 || loading}
                    >
                        ←
                    </Button>
                    <Button
                        className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                        onClick={() => goToPage(page + 1)}
                        disabled={page >= totalPages || loading}
                    >
                        →
                    </Button>
                </div>
            </div>
        </AppShell>
    );
}
