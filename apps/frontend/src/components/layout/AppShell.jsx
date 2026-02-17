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
                "rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
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
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <div className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 transition-colors">
                <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">Run Tracker</div>
                        <div className="hidden sm:flex items-center gap-1">
                            <NavLink to="/dashboard">Dashboard</NavLink>
                            <NavLink to="/runs">Corse</NavLink>
                            <NavLink to="/profile">Profilo</NavLink>
                            {user?.role === "admin" && <NavLink to="/admin/users">Admin</NavLink>}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {right}
                        <div className="hidden sm:block text-sm text-slate-500 dark:text-slate-400">
                            {user?.name}
                        </div>
                        <button
                            onClick={toggleTheme}
                            aria-label={theme === "dark" ? "Passa al tema chiaro" : "Passa al tema scuro"}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                        >
                            {theme === "dark" ? "☀️" : "🌙"}
                        </button>
                        <Button
                            className="bg-white !text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:!text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700"
                            onClick={logout}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                <div className="sm:hidden px-4 pb-3 flex gap-1">
                    <NavLink to="/dashboard">Dashboard</NavLink>
                    <NavLink to="/runs">Corse</NavLink>
                    <NavLink to="/profile">Profilo</NavLink>
                    {user?.role === "admin" && <NavLink to="/admin/users">Admin</NavLink>}
                </div>
            </div>

            <div className="mx-auto max-w-6xl p-4 md:p-8">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h1>
                </div>
                {children}
            </div>
        </div>
    );
}
