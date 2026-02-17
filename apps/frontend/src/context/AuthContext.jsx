import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    async function loadMe(tk) {
        if (!tk) return null;
        const data = await apiFetch("/auth/me", { token: tk });
        return data.user;
    }

    useEffect(() => {
        (async () => {
            try {
                if (token) {
                    const me = await loadMe(token);
                    setUser(me);
                } else {
                    setUser(null);
                }
            } catch {
                // token non valido
                setToken(null);
                localStorage.removeItem("token");
                setUser(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [token]);

    // Ascolta token rinnovato da apiFetch
    useEffect(() => {
        function onTokenRefreshed(e) {
            setToken(e.detail);
        }
        window.addEventListener("token-refreshed", onTokenRefreshed);
        return () => window.removeEventListener("token-refreshed", onTokenRefreshed);
    }, []);

    async function login(email, password) {
        const data = await apiFetch("/auth/login", {
            method: "POST",
            body: { email, password },
        });
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
    }

    async function register(name, email, password) {
        const data = await apiFetch("/auth/register", {
            method: "POST",
            body: { name, email, password },
        });
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUser(data.user);
    }

    function logout() {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
    }

    function updateUser(fields) {
        setUser((prev) => prev ? { ...prev, ...fields } : prev);
    }

    const value = useMemo(
        () => ({ token, user, loading, login, register, logout, updateUser }),
        [token, user, loading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
