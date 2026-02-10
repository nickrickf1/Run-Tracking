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
            title="Accedi"
            subtitle="Entra e gestisci le tue corse, statistiche e progressi."
        >
            <form onSubmit={onSubmit} className="space-y-4">
                {err && <Alert>{err}</Alert>}

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <Input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nome@email.com"
                        autoComplete="email"
                    />
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <Input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                    />
                </div>

                <Button className="w-full" disabled={loading}>
                    {loading ? "Accesso..." : "Entra"}
                </Button>

                <p className="text-sm text-slate-600">
                    Non hai un account?{" "}
                    <Link className="font-medium text-slate-900 underline underline-offset-4" to="/register">
                        Registrati
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
