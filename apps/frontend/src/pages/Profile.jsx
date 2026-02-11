import { useState } from "react";
import AppShell from "../components/layout/AppShell";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { changeMyPassword, updateMe } from "../services/users";

export default function Profile() {
    const { token, user } = useAuth();

    const [name, setName] = useState(user?.name || "");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");

    const [savingName, setSavingName] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingPwd, setSavingPwd] = useState(false);

    async function onSaveName(e) {
        e.preventDefault();
        setErr("");
        setMsg("");
        setSavingName(true);
        try {
            const res = await updateMe(token, { name: name.trim() });
            setMsg("Nome aggiornato ✅");
            // Nota: se vuoi aggiornare anche l'header subito, conviene aggiungere una funzione nel AuthContext
            // che aggiorna user nello state. Per ora va bene: al refresh / re-login si vede.
        } catch (e2) {
            setErr(e2.message);
        } finally {
            setSavingName(false);
        }
    }

    async function onChangePassword(e) {
        e.preventDefault();
        setErr("");
        setMsg("");
        setSavingPwd(true);
        try {
            await changeMyPassword(token, { currentPassword, newPassword });
            setMsg("Password aggiornata ✅");
            setCurrentPassword("");
            setNewPassword("");
        } catch (e2) {
            setErr(e2.message);
        } finally {
            setSavingPwd(false);
        }
    }

    return (
        <AppShell title="Profilo">
            <div className="space-y-4">
                {err && <Alert>{err}</Alert>}
                {msg && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        {msg}
                    </div>
                )}

                <div className="rounded-2xl bg-white p-4 shadow">
                    <h2 className="text-sm font-semibold">Dati account</h2>
                    <p className="mt-1 text-sm text-slate-600">{user?.email}</p>

                    <form onSubmit={onSaveName} className="mt-4 space-y-3 max-w-md">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Nome</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <Button disabled={savingName}>
                            {savingName ? "Salvataggio..." : "Salva nome"}
                        </Button>
                    </form>
                </div>

                <div className="rounded-2xl bg-white p-4 shadow">
                    <h2 className="text-sm font-semibold">Cambia password</h2>

                    <form onSubmit={onChangePassword} className="mt-4 space-y-3 max-w-md">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Password attuale</label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Nuova password</label>
                            <Input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="min 8 caratteri"
                            />
                        </div>

                        <Button disabled={savingPwd}>
                            {savingPwd ? "Aggiornamento..." : "Aggiorna password"}
                        </Button>
                    </form>
                </div>
            </div>
        </AppShell>
    );
}
