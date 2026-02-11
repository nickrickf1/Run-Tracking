import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/layout/AuthLayout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

export default function Login() {
    const { login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [err, setErr] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSubmit(e) {
        e.preventDefault();
        setErr("");
        setLoading(true);
        try {
            await login(email.trim(), password);
            nav("/dashboard");
        } catch (error) {
            setErr(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="Bentornato"
            subtitle="Accedi per gestire le tue corse, statistiche e progressi."
        >
            <form onSubmit={onSubmit} className="space-y-5">
                {err && <Alert>{err}</Alert>}

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email</label>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@email.com"
                        autoComplete="email"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                </div>

                <Button className="w-full" disabled={loading}>
                    {loading ? "Accesso in corso..." : "Accedi"}
                </Button>

                <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    Non hai un account?{" "}
                    <Link className="font-semibold text-slate-900 underline underline-offset-4 hover:text-slate-700 dark:text-white dark:hover:text-slate-300" to="/register">
                        Registrati
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
