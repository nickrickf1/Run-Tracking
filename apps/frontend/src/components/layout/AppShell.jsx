import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import { useTheme } from "../../context/ThemeContext";

function NavLink({ to, children }) {
    const { pathname } = useLocation();
    const active = pathname === to;
    return (
        <Link
            to={to}
            className={[
                "rounded-xl px-3 py-2 text-sm font-medium",
                active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100",
            ].join(" ")}
        >
            {children}
        </Link>
    );
}

export default function AppShell({ title, children, right }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen">
            <div className="border-b bg-white">
                <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="text-sm font-semibold">Run Tracker</div>
                        <div className="hidden sm:flex items-center gap-2">
                            <NavLink to="/dashboard">Dashboard</NavLink>
                            <NavLink to="/runs">Corse</NavLink>
                            <NavLink to="/profile">Profilo</NavLink>

                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {right}
                        <div className="hidden sm:block text-sm text-slate-600">
                            {user?.name}
                        </div>
                        <Button
                            className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                            onClick={toggleTheme}
                            title="Cambia tema"
                        >
                            {theme === "dark" ? "☀️" : "🌙"}
                        </Button>

                        <Button
                            className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50"
                            onClick={logout}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="sm:hidden px-4 pb-4 flex gap-2">
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/runs">Corse</NavLink>
                </div>
            </div>

            <div className="mx-auto max-w-6xl p-4 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">{title}</h1>
                </div>
                {children}
            </div>
        </div>
    );
}
