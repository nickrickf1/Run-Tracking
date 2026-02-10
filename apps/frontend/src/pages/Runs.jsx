import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { deleteRun, listRuns } from "../services/runs";

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
    const [data, setData] = useState({ runs: [], total: 0, page: 1, pageSize: 10 });
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    async function load() {
        setErr("");
        setLoading(true);
        try {
            const res = await listRuns(token, { page: 1, pageSize: 10 });
            setData(res);
        } catch (e) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function onDelete(id) {
        if (!confirm("Eliminare questa corsa?")) return;
        try {
            await deleteRun(token, id);
            await load();
        } catch (e) {
            setErr(e.message);
        }
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

            <div className="mt-4 space-y-3">
                {loading ? (
                    <div className="text-sm text-slate-600">Caricamento…</div>
                ) : data.runs.length === 0 ? (
                    <div className="rounded-2xl bg-white p-4 shadow text-sm text-slate-600">
                        Nessuna corsa ancora. Clicca “Nuova corsa”.
                    </div>
                ) : (
                    data.runs.map((r) => (
                        <div key={r.id} className="rounded-2xl bg-white p-4 shadow flex items-center justify-between gap-4">
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
                                    • {Math.round(Number(r.durationSec) / 60)} min
                                    {" "}• {formatPace(r.distanceKm, r.durationSec)}
                                </div>

                                {r.notes && (
                                    <div className="mt-1 text-sm text-slate-600 truncate">{r.notes}</div>
                                )}
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
        </AppShell>
    );
}
