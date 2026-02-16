import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";
import { useAuth } from "../context/AuthContext";
import { changeMyPassword, updateMe } from "../services/users";
import {
    getStravaStatus,
    getStravaConnectUrl,
    importStravaActivities,
    disconnectStrava,
} from "../services/strava";

export default function Profile() {
    const { token, user, updateUser } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const [name, setName] = useState(user?.name || "");
    const [msg, setMsg] = useState("");
    const [err, setErr] = useState("");
    const [savingName, setSavingName] = useState(false);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [savingPwd, setSavingPwd] = useState(false);

    // --- Strava ---
    const [stravaConnected, setStravaConnected] = useState(false);
    const [stravaLoading, setStravaLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [disconnecting, setDisconnecting] = useState(false);

    // Carica stato Strava
    useEffect(() => {
        if (!token) return;
        const controller = new AbortController();

        (async () => {
            try {
                const res = await getStravaStatus(token);
                setStravaConnected(res.connected);
            } catch (e) {
                if (e.name === "AbortError") return;
            } finally {
                setStravaLoading(false);
            }
        })();

        return () => controller.abort();
    }, [token]);

    // Gestisci redirect ?strava=connected
    useEffect(() => {
        if (searchParams.get("strava") === "connected") {
            setStravaConnected(true);
            setMsg("Account Strava collegato con successo!");
            searchParams.delete("strava");
            setSearchParams(searchParams, { replace: true });
        }
    }, [searchParams, setSearchParams]);

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

    function onConnectStrava() {
        window.location.href = getStravaConnectUrl(token);
    }

    async function onImportStrava() {
        setErr("");
        setMsg("");
        setImporting(true);
        try {
            const res = await importStravaActivities(token);
            setMsg(res.message);
        } catch (e2) {
            setErr(e2.message);
        } finally {
            setImporting(false);
        }
    }

    async function onDisconnectStrava() {
        if (!confirm("Vuoi scollegare il tuo account Strava?")) return;
        setErr("");
        setMsg("");
        setDisconnecting(true);
        try {
            await disconnectStrava(token);
            setStravaConnected(false);
            setMsg("Account Strava scollegato");
        } catch (e2) {
            setErr(e2.message);
        } finally {
            setDisconnecting(false);
        }
    }

    return (
        <AppShell title="Profilo">
            <div className="space-y-5 max-w-xl">
                {err && <Alert>{err}</Alert>}
                {msg && <Alert variant="success">{msg}</Alert>}

                {/* Dati account */}
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 transition-colors">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Dati account</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>

                    <form onSubmit={onSaveName} className="mt-5 space-y-3">
                        <div className="space-y-1.5">
                            <label htmlFor="profile-name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nome</label>
                            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <Button disabled={savingName}>
                            {savingName ? "Salvataggio..." : "Salva nome"}
                        </Button>
                    </form>
                </div>

                {/* Cambia password */}
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 transition-colors">
                    <h2 className="text-sm font-bold text-slate-800 dark:text-white">Cambia password</h2>

                    <form onSubmit={onChangePassword} className="mt-5 space-y-3">
                        <div className="space-y-1.5">
                            <label htmlFor="profile-current-pwd" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password attuale</label>
                            <Input
                                id="profile-current-pwd"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="profile-new-pwd" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Nuova password</label>
                            <Input
                                id="profile-new-pwd"
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

                {/* Strava */}
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800 transition-colors">
                    <div className="flex items-center gap-3">
                        <svg className="h-6 w-6 text-[#FC4C02]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
                        </svg>
                        <h2 className="text-sm font-bold text-slate-800 dark:text-white">Strava</h2>
                    </div>

                    {stravaLoading ? (
                        <p className="mt-3 text-sm text-slate-400">Caricamento...</p>
                    ) : stravaConnected ? (
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                <span className="text-sm text-slate-600 dark:text-slate-400">Account collegato</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <Button
                                    onClick={onImportStrava}
                                    disabled={importing}
                                >
                                    {importing ? "Importazione..." : "Importa corse"}
                                </Button>
                                <Button
                                    onClick={onDisconnectStrava}
                                    disabled={disconnecting}
                                    className="bg-white !text-red-600 border border-red-200 hover:bg-red-50 dark:bg-slate-800 dark:!text-red-400 dark:border-red-900 dark:hover:bg-red-950"
                                >
                                    {disconnecting ? "Scollegamento..." : "Scollega"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 space-y-3">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Collega il tuo account Strava per importare automaticamente le corse.
                            </p>
                            <Button onClick={onConnectStrava}>
                                Connetti Strava
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
