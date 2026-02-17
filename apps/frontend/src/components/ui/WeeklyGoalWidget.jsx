import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { getWeeklyGoal, setWeeklyGoal } from "../../services/goals";

export default function WeeklyGoalWidget() {
    const { token } = useAuth();
    const { addToast } = useToast();
    const [data, setData] = useState(null);
    const [editing, setEditing] = useState(false);
    const [inputKm, setInputKm] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const res = await getWeeklyGoal(token);
                setData(res);
                if (res.targetKm != null) setInputKm(String(res.targetKm));
            } catch {
                // silently fail
            }
        })();
    }, [token]);

    async function onSave() {
        const km = Number(inputKm);
        if (!km || km <= 0) return;
        setSaving(true);
        try {
            await setWeeklyGoal(token, km);
            setData((prev) => ({ ...prev, targetKm: km }));
            setEditing(false);
            addToast("Obiettivo settimanale aggiornato");
        } catch (e) {
            addToast(e.message, { variant: "error" });
        } finally {
            setSaving(false);
        }
    }

    if (!data) return null;

    const { targetKm, currentKm } = data;
    const pct = targetKm ? Math.min(100, Math.round((currentKm / targetKm) * 100)) : 0;
    const reached = targetKm && currentKm >= targetKm;

    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Obiettivo settimanale
                </h3>
                <button
                    onClick={() => setEditing(!editing)}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {editing ? "Annulla" : "Modifica"}
                </button>
            </div>

            {editing ? (
                <div className="flex gap-2">
                    <input
                        type="number"
                        step="0.1"
                        min="1"
                        value={inputKm}
                        onChange={(e) => setInputKm(e.target.value)}
                        placeholder="km"
                        className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                    <span className="self-center text-sm text-slate-500">km / settimana</span>
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                    >
                        {saving ? "..." : "Salva"}
                    </button>
                </div>
            ) : targetKm ? (
                <>
                    <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-2xl font-bold text-slate-900 dark:text-white">
                            {currentKm.toFixed(1)}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            / {targetKm} km
                        </span>
                        {reached && (
                            <span className="ml-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                Raggiunto!
                            </span>
                        )}
                    </div>
                    <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                reached
                                    ? "bg-emerald-500"
                                    : pct >= 60
                                    ? "bg-blue-500"
                                    : "bg-amber-500"
                            }`}
                            style={{ width: `${pct}%` }}
                        />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{pct}% completato</p>
                </>
            ) : (
                <p className="text-sm text-slate-400">
                    Nessun obiettivo impostato. Clicca &quot;Modifica&quot; per impostarne uno.
                </p>
            )}
        </div>
    );
}
