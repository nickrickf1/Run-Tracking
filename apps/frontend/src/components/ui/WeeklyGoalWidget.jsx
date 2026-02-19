import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getWeeklyGoal, setWeeklyGoal } from "../../services/goals";

function formatPaceSec(sec) {
    if (!sec || sec <= 0) return "-";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function ProgressRow({ label, current, target, unit, format }) {
    if (target == null) return null;
    const fmt = format || ((v) => v);
    const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
    const reached = current >= target;

    return (
        <div className="mb-3 last:mb-0">
            <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
                <span className="text-xs text-slate-400">
                    {fmt(current)} / {fmt(target)} {unit}
                </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${
                        reached ? "bg-emerald-500" : pct >= 60 ? "bg-blue-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            {reached && (
                <p className="mt-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">Raggiunto!</p>
            )}
        </div>
    );
}

export default function WeeklyGoalWidget() {
    const { token } = useAuth();
    const { addToast } = useToast();
    const [data, setData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ targetKm: "", targetRuns: "", targetPaceSec: "", targetMonthlyKm: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await getWeeklyGoal(token);
                setData(res);
                setForm({
                    targetKm: res.targetKm != null ? String(res.targetKm) : "",
                    targetRuns: res.targetRuns != null ? String(res.targetRuns) : "",
                    targetPaceSec: res.targetPaceSec != null ? String(res.targetPaceSec) : "",
                    targetMonthlyKm: res.targetMonthlyKm != null ? String(res.targetMonthlyKm) : "",
                });
            } catch {
                // silently fail
            }
        })();
    }, [token]);

    function handleChange(field) {
        return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
    }

    async function onSave() {
        const body = {};
        if (form.targetKm) body.targetKm = Number(form.targetKm);
        if (form.targetRuns) body.targetRuns = Number(form.targetRuns);
        if (form.targetPaceSec) body.targetPaceSec = Number(form.targetPaceSec);
        if (form.targetMonthlyKm) body.targetMonthlyKm = Number(form.targetMonthlyKm);

        if (Object.keys(body).length === 0) return;

        setSaving(true);
        try {
            const res = await setWeeklyGoal(token, body);
            setData((prev) => ({ ...prev, ...res }));
            setEditing(false);
            addToast("Obiettivi aggiornati");
        } catch (e) {
            addToast(e.message, { variant: "error" });
        } finally {
            setSaving(false);
        }
    }

    if (!data) return null;

    const hasGoals = data.targetKm || data.targetRuns || data.targetPaceSec || data.targetMonthlyKm;

    const inputCls =
        "w-full rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200";

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Obiettivi</h3>
                <button
                    onClick={() => setEditing(!editing)}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {editing ? "Annulla" : "Modifica"}
                </button>
            </div>

            {editing ? (
                <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400">Km / settimana</label>
                            <input type="number" step="0.1" min="0" value={form.targetKm} onChange={handleChange("targetKm")} placeholder="es. 20" className={inputCls} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400">Corse / settimana</label>
                            <input type="number" min="0" value={form.targetRuns} onChange={handleChange("targetRuns")} placeholder="es. 3" className={inputCls} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400">Passo obiettivo (sec/km)</label>
                            <input type="number" min="0" value={form.targetPaceSec} onChange={handleChange("targetPaceSec")} placeholder="es. 330" className={inputCls} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 dark:text-slate-400">Km / mese</label>
                            <input type="number" step="0.1" min="0" value={form.targetMonthlyKm} onChange={handleChange("targetMonthlyKm")} placeholder="es. 80" className={inputCls} />
                        </div>
                    </div>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                        {saving ? "Salvataggio..." : "Salva obiettivi"}
                    </button>
                </div>
            ) : hasGoals ? (
                <div>
                    <ProgressRow label="Km settimanali" current={data.currentKm} target={data.targetKm} unit="km" format={(v) => Number(v).toFixed(1)} />
                    <ProgressRow label="Corse settimanali" current={data.currentRuns} target={data.targetRuns} unit="corse" />
                    <ProgressRow
                        label="Passo medio"
                        current={data.targetPaceSec && data.currentPaceSec ? (data.currentPaceSec <= data.targetPaceSec ? data.targetPaceSec : data.currentPaceSec) : 0}
                        target={data.targetPaceSec}
                        unit=""
                        format={formatPaceSec}
                    />
                    <ProgressRow label="Km mensili" current={data.currentMonthlyKm} target={data.targetMonthlyKm} unit="km" format={(v) => Number(v).toFixed(1)} />
                </div>
            ) : (
                <p className="text-sm text-slate-400">
                    Nessun obiettivo impostato. Clicca &quot;Modifica&quot; per impostarne uno.
                </p>
            )}
        </div>
    );
}
