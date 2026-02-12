import { useState } from "react";
import AppShell from "../components/layout/AppShell";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { changeMyPassword, updateMe } from "../services/users";

export default function Profile() {
    const { token, user, updateUser } = useAuth();

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
            updateUser({ name: res.user.name });
            setMsg("Nome aggiornato");
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
            setMsg("Password aggiornata");
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
            <div className="space-y-5 max-w-xl">
                {err && <Alert>{err}</Alert>}
                {msg && <Alert variant="success">{msg}</Alert>}

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 transition-colors">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Dati account</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>

                    <form onSubmit={onSaveName} className="mt-5 space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nome</label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <Button disabled={savingName}>
                            {savingName ? "Salvataggio..." : "Salva nome"}
                        </Button>
                    </form>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 transition-colors">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Cambia password</h2>

                    <form onSubmit={onChangePassword} className="mt-5 space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password attuale</label>
                            <Input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nuova password</label>
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
