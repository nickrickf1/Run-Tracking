import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);

function getSystemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

function getInitialMode() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") return saved;
    return "auto";
}

export function ThemeProvider({ children }) {
    const [mode, setMode] = useState(getInitialMode);
    const [systemTheme, setSystemTheme] = useState(getSystemTheme);

    // Listen for system theme changes
    useEffect(() => {
        const mql = window.matchMedia("(prefers-color-scheme: dark)");
        function onChange(e) {
            setSystemTheme(e.matches ? "dark" : "light");
        }
        mql.addEventListener("change", onChange);
        return () => mql.removeEventListener("change", onChange);
    }, []);

    const resolvedTheme = mode === "auto" ? systemTheme : mode;

    useEffect(() => {
        const root = document.documentElement;
        if (resolvedTheme === "dark") root.classList.add("dark");
        else root.classList.remove("dark");
        localStorage.setItem("theme", mode);
    }, [resolvedTheme, mode]);

    const cycleTheme = useCallback(() => {
        setMode((m) => {
            if (m === "light") return "dark";
            if (m === "dark") return "auto";
            return "light";
        });
    }, []);

    const value = useMemo(
        () => ({ theme: resolvedTheme, mode, cycleTheme, setMode }),
        [resolvedTheme, mode, cycleTheme]
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    return useContext(ThemeContext);
}
