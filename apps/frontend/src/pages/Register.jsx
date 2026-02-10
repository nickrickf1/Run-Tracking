import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

export default function Register() {
    const { register } = useAuth();
    const nav = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            await register(name.trim(), email.trim(), password);
            nav("/dashboard");
        } catch (error) {
            setErr(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Crea il tuo account"
            subtitle="Registrati per salvare le corse e monitorare i tuoi progressi."
        >
            <form onSubmit={onSubmit} className="space-y-5">
                {err && <Alert>{err}</Alert>}

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Nome</label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Riccardo"
                        autoComplete="name"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Email</label>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@email.com"
                        autoComplete="email"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="min 8 caratteri"
                        autoComplete="new-password"
                    />
                    <p className="text-xs text-slate-400">Usa almeno 8 caratteri.</p>
                </div>

                <Button className="w-full" disabled={loading}>
                    {loading ? "Creazione in corso..." : "Crea account"}
                </Button>

                <p className="text-center text-sm text-slate-500">
                    Hai gia un account?{" "}
                    <Link className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700" to="/login">
                        Accedi
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
