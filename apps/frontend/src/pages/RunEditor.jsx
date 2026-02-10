import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { createRun, getRun, updateRun } from "../services/runs";

const TYPES = ["lento", "tempo", "variato", "lungo", "gara", "forza"];

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
        durationSec: "",
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

                setForm({
                    date: new Date(r.date).toISOString().slice(0, 10),
                    distanceKm: String(Number(r.distanceKm)),
                    durationSec: String(Number(r.durationSec)),
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
            // converto ai tipi corretti per Zod backend
            const payload = {
                date: form.date,
                distanceKm: Number(form.distanceKm),
                durationSec: Number(form.durationSec),
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

    return (
        <AppShell
            title={mode === "edit" ? "Modifica corsa" : "Nuova corsa"}
            right={
                <Link to="/runs">
                    <Button className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50">
                        ← Indietro
                    </Button>
                </Link>
            }
        >
            {err && <Alert>{err}</Alert>}

            {loading ? (
                <div className="text-sm text-slate-600">Caricamento…</div>
            ) : (
                <form onSubmit={onSubmit} className="rounded-2xl bg-white p-4 shadow space-y-4 max-w-xl">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Data</label>
                            <Input type="date" value={form.date} onChange={(e) => setField("date", e.target.value)} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Tipo</label>
                            <select
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                                value={form.type}
                                onChange={(e) => setField("type", e.target.value)}
                            >
                                {TYPES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Distanza (km)</label>
                            <Input
                                inputMode="decimal"
                                value={form.distanceKm}
                                onChange={(e) => setField("distanceKm", e.target.value)}
                                placeholder="8.2"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Durata (secondi)</label>
                            <Input
                                inputMode="numeric"
                                value={form.durationSec}
                                onChange={(e) => setField("durationSec", e.target.value)}
                                placeholder="2700"
                            />
                            <p className="text-xs text-slate-500">Tip: 2700 = 45 minuti</p>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">RPE (1–10)</label>
                            <Input
                                inputMode="numeric"
                                value={form.rpe}
                                onChange={(e) => setField("rpe", e.target.value)}
                                placeholder="5"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Note</label>
                        <textarea
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm min-h-[110px] focus:outline-none focus:ring-2 focus:ring-slate-400"
                            value={form.notes}
                            onChange={(e) => setField("notes", e.target.value)}
                            placeholder="Come è andata…"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button disabled={saving}>{saving ? "Salvataggio..." : "Salva"}</Button>
                        <Link to="/runs">
                            <Button className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50" type="button">
                                Annulla
                            </Button>
                        </Link>
                    </div>
                </form>
            )}
        </AppShell>
    );
}
