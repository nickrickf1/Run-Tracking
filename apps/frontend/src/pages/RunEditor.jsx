import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { createRun, getRun, updateRun } from "../services/runs";

const TYPES = ["lento", "tempo", "variato", "lungo", "gara", "forza"];
function toIntOrZero(v) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : 0;
}

function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}

function formatPace(distanceKm, totalSec) {
    const d = Number(distanceKm);
    const t = Number(totalSec);
    if (!d || !t || d <= 0 || t <= 0) return "-";
    const pace = t / d; // sec/km
    const m = Math.floor(pace / 60);
    const s = Math.round(pace % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} / km`;
}

function formatDuration(totalSec) {
    const t = Number(totalSec);
    if (!t || t <= 0) return "-";
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function RunEditor({ mode }) {
    const { token } = useAuth();
    const nav = useNavigate();
    const { id } = useParams();

    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(mode === "edit");
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        date: "",          // YYYY-MM-DD
        distanceKm: "",
        durationMin: "",   // nuovo
        durationSec: "",   // nuovo (secondi 0-59)
        type: "lento",
        rpe: "",
        notes: "",
    });


    useEffect(() => {
        if (mode !== "edit") return;

        (async () => {
            setErr("");
            setLoading(true);
            try {
                const res = await getRun(token, id);
                const r = res.run;

                const total = Number(r.durationSec || 0);
                const mm = Math.floor(total / 60);
                const ss = total % 60;

                setForm({
                    date: new Date(r.date).toISOString().slice(0, 10),
                    distanceKm: String(Number(r.distanceKm)),
                    durationMin: String(mm),
                    durationSec: String(ss),
                    type: r.type || "lento",
                    rpe: r.rpe == null ? "" : String(r.rpe),
                    notes: r.notes || "",
                });

            } catch (e) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        })();
    }, [mode, token, id]);

    function setField(key, value) {
        setForm((p) => ({ ...p, [key]: value }));
    }

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        setSaving(true);

        try {
            const payload = {
                date: form.date,
                distanceKm: Number(form.distanceKm),
                durationSec: totalDurationSec,
                type: form.type,
                notes: form.notes?.trim() ? form.notes.trim() : undefined,
                rpe: form.rpe === "" ? undefined : Number(form.rpe),
            };


            if (!payload.date) throw new Error("Inserisci la data");
            if (!isFinite(payload.distanceKm) || payload.distanceKm <= 0) throw new Error("Distanza non valida");
            if (!Number.isInteger(payload.durationSec) || payload.durationSec <= 0) throw new Error("Durata non valida");

            if (mode === "edit") {
                await updateRun(token, id, payload);
            } else {
                await createRun(token, payload);
            }

            nav("/runs");
        } catch (e) {
            setErr(e.message);
        } finally {
            setSaving(false);
        }
    }

    const selectClass = [
        "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm",
        "transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400",
        "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-700",
    ].join(" ");

    const textareaClass = [
        "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm min-h-[110px]",
        "transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400",
        "dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:bg-slate-700",
    ].join(" ");

    const totalDurationSec =
        clamp(toIntOrZero(form.durationMin), 0, 100000) * 60 +
        clamp(toIntOrZero(form.durationSec), 0, 59);

    const livePace = formatPace(form.distanceKm, totalDurationSec);
    const liveDuration = formatDuration(totalDurationSec);



    return (
        <AppShell
            title={mode === "edit" ? "Modifica corsa" : "Nuova corsa"}
            right={
                <Link to="/runs">
                    <Button className="bg-white !text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:!text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700">
                        Indietro
                    </Button>
                </Link>
            }
        >
            {err && <Alert>{err}</Alert>}

            {loading ? (
                <div className="text-sm text-slate-500">Caricamento...</div>
            ) : (
                <form onSubmit={onSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 space-y-5 max-w-xl dark:bg-slate-900 dark:ring-slate-800 transition-colors">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Data</label>
                            <Input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipo</label>
                            <select
                                className={selectClass}
                                value={form.type}
                                onChange={(e) => setField("type", e.target.value)}
                            >
                                {TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Distanza (km)</label>
                            <Input
                                inputMode="decimal"
                                value={form.distanceKm}
                                onChange={(e) => setField("distanceKm", e.target.value)}
                                placeholder="8.2"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Durata</label>

                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        inputMode="numeric"
                                        value={form.durationMin}
                                        onChange={(e) => setField("durationMin", e.target.value)}
                                        placeholder="min"
                                    />
                                    <Input
                                        inputMode="numeric"
                                        value={form.durationSec}
                                        onChange={(e) => setField("durationSec", e.target.value)}
                                        placeholder="sec (0-59)"
                                    />
                                </div>

                                <p className="text-xs text-slate-500">
                                    Totale: <span className="font-medium">{liveDuration}</span> • Passo:{" "}
                                    <span className="font-medium">{livePace}</span>
                                </p>
                            </div>
                        </div>
                        </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">RPE (1-10)</label>
                        <Input
                            inputMode="numeric"
                            value={form.rpe}
                            onChange={(e) => setField("rpe", e.target.value)}
                            placeholder="6"
                        />
                        <p className="text-xs text-slate-400 dark:text-slate-500">Sforzo percepito: 1 = facile, 10 = massimale</p>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Note</label>
                        <textarea
                            className={textareaClass}
                            value={form.notes}
                            onChange={(e) => setField("notes", e.target.value)}
                            placeholder="Come e andata..."
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button disabled={saving}>{saving ? "Salvataggio..." : "Salva"}</Button>
                        <Link to="/runs">
                            <Button className="bg-white !text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:!text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700" type="button">
                                Annulla
                            </Button>
                        </Link>
                    </div>
                </form>
            )}
        </AppShell>
    );
}
